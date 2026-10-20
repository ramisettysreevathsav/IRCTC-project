const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_BYTES = 64;

const signAccessToken = (user, sessionId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }

    return jwt.sign(
        { sub: user.id, sid: sessionId, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_TTL }
    );
};

const createRefreshToken = () => crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = { signAccessToken, createRefreshToken, hashToken };
