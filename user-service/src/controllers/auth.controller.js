const authService = require('../services/auth.service.js')
const logger = require('../config/logger');

exports.sendOtp = async (req, res) => {
    try {
        logger.info('Received request for /auth/send-otp');
        const { email } = req.body

        if(!email){
            logger.warn('Rejected /auth/send-otp: required fields are missing');
            return res.status(400).json({ message: 'Email is required' });
        }

        const { otp, otpSessionId } = await authService.sendOtp(email);
        res.cookie('otpSessionId', otpSessionId, { httpOnly: true, maxAge: 300000 }); // Set cookie for 5 minutes
        return res.status(200).json({ message: 'OTP sent successfully'});
    }
    catch (error) {
        logger.error(`Failed /auth/send-otp: ${error.message}`);
        return res.status(500).json({ message: 'Error sending OTP', error: error.message });
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

        await authService.verifyOtp(otpSessionId, otp);
        return res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        logger.error(`Failed /auth/verify-otp: ${error.message}`);
        return res.status(500).json({ message: 'Error verifying OTP', error: error.message });
    }
};