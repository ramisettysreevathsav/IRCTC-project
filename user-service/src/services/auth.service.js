const prisma = require('../config/prisma');
const logger = require('../config/logger');
const crypto = require('crypto');
const redisClient = require('../config/redis');

const { generateAndSendOtp } = require('../utils/otp');

const sendEmail = require('../utils/email').sendEmail;

const { signAccessToken, createRefreshToken, hashToken } = require('../utils/tokenGenerator');

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const authError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

const publicUser = ({ id, firstName, lastName, email }) => ({ id, firstName, lastName, email });

const sendOtp = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
        throw authError('No account exists for this email address', 404);
    }

    const meta = { email: user.email, firstName: user.firstName, lastName: user.lastName };
    const { otp, otpSessionId } = await generateAndSendOtp(meta);
    await sendEmail({ ...meta, otp });
    return { otpSessionId };
};

const verifyOtp = async (otpSessionId, otp) => {
    const redis = redisClient.getClient();
    const otpKey = `otp:${otpSessionId}`;
    const otpData = await redis.get(otpKey);
    if (!otpData) {
        throw authError('OTP session not found or expired', 400);
    }

    const { hashedOtp, meta } = JSON.parse(otpData);
    const submittedHash = crypto.createHash('sha256').update(`${meta.email}:${otp}`).digest();
    const storedHash = Buffer.from(hashedOtp, 'hex');
    if (storedHash.length !== submittedHash.length || !crypto.timingSafeEqual(storedHash, submittedHash)) {
        throw authError('Invalid OTP', 400);
    }

    const user = await prisma.user.findUnique({ where: { email: meta.email } });
    if (!user) {
        throw authError('No account exists for this email address', 404);
    }

    const refreshToken = createRefreshToken();
    const sessionId = crypto.randomUUID();
    const accessToken = signAccessToken(user, sessionId);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    const result = await prisma.$transaction(async (tx) => {
        const verifiedUser = await tx.user.update({
            where: { id: user.id },
            data: { emailVerified: true },
        });
        const session = await tx.authSession.create({
            data: {
                id: sessionId,
                userId: verifiedUser.id,
                refreshTokenHash: hashToken(refreshToken),
                expiresAt,
            },
        });
        return { user: verifiedUser, session };
    });

    await redis.del(otpKey);
    logger.info('OTP verified and authenticated session created');
    return {
        accessToken,
        refreshToken,
        user: publicUser(result.user),
        refreshTokenExpiresAt: expiresAt,
    };
};

const refreshSession = async (refreshToken) => {
    if (!refreshToken) {
        throw authError('Refresh token is required', 401);
    }

    const now = new Date();
    const session = await prisma.authSession.findUnique({
        where: { refreshTokenHash: hashToken(refreshToken) },
        include: { user: true },
    });
    if (!session || session.revokedAt || session.expiresAt <= now) {
        throw authError('Refresh session is invalid or expired', 401);
    }

    const nextRefreshToken = createRefreshToken();
    const nextExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    const accessToken = signAccessToken(session.user, session.id);
    const rotation = await prisma.authSession.updateMany({
        where: {
            id: session.id,
            refreshTokenHash: hashToken(refreshToken),
            revokedAt: null,
            expiresAt: { gt: now },
        },
        data: {
            refreshTokenHash: hashToken(nextRefreshToken),
            expiresAt: nextExpiresAt,
        },
    });
    if (rotation.count !== 1) {
        throw authError('Refresh token has already been used', 401);
    }

    return {
        accessToken,
        refreshToken: nextRefreshToken,
        user: publicUser(session.user),
        refreshTokenExpiresAt: nextExpiresAt,
    };
};

const revokeSession = async (refreshToken) => {
    if (!refreshToken) return;

    await prisma.authSession.updateMany({
        where: {
            refreshTokenHash: hashToken(refreshToken),
            revokedAt: null,
        },
        data: { revokedAt: new Date() },
    });
};

module.exports = { sendOtp, verifyOtp, refreshSession, revokeSession };
