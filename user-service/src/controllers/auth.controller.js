const authService = require('../services/auth.service.js')
const logger = require('../config/logger');

exports.sendOtp = async (req, res) => {
    try {
        logger.info('Received request for /auth/send-otp');
        const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

        if(!email){
            logger.warn('Rejected /auth/send-otp: required fields are missing');
            return res.status(400).json({ message: 'Email is required' });
        }

        const { otpSessionId } = await authService.sendOtp(email);
        res.cookie('otpSessionId', otpSessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 300000,
            path: '/',
        });
        return res.status(200).json({ message: 'OTP sent successfully'});
    }
    catch (error) {
        logger.error(`Failed /auth/send-otp: ${error.message}`);
        return res.status(error.statusCode || 500).json({ message: error.message || 'Error sending OTP' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        logger.info('Received request for /auth/verify-otp');
        const { otp } = req.body;
        const otpSessionId = req.cookies.otpSessionId;

        if (!otp || !otpSessionId) {
            logger.warn('Rejected /auth/verify-otp: required fields are missing');
            return res.status(400).json({ message: 'OTP and OTP session ID are required' });
        }

        const { accessToken, refreshToken, user, refreshTokenExpiresAt } = await authService.verifyOtp(otpSessionId, otp);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: refreshTokenExpiresAt,
            path: '/auth',
        });
        res.clearCookie('otpSessionId', { path: '/' });
        return res.status(200).json({ message: 'OTP verified successfully', accessToken, user });
    } catch (error) {
        logger.error(`Failed /auth/verify-otp: ${error.message}`);
        return res.status(error.statusCode || 500).json({ message: error.message || 'Error verifying OTP' });
    }
};

exports.refresh = async (req, res) => {
    try {
        const { accessToken, refreshToken, user, refreshTokenExpiresAt } =
            await authService.refreshSession(req.cookies.refreshToken);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: refreshTokenExpiresAt,
            path: '/auth',
        });
        return res.status(200).json({ accessToken, user });
    } catch (error) {
        logger.warn(`Failed /auth/refresh: ${error.message}`);
        return res.status(error.statusCode || 500).json({ message: error.message || 'Unable to refresh session' });
    }
};

exports.logout = async (req, res) => {
    try {
        await authService.revokeSession(req.cookies.refreshToken);
        res.clearCookie('refreshToken', { path: '/auth' });
        res.clearCookie('otpSessionId', { path: '/' });
        return res.status(204).end();
    } catch (error) {
        logger.error(`Failed /auth/logout: ${error.message}`);
        return res.status(500).json({ message: 'Unable to sign out' });
    }
};