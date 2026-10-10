const authService = require('../services/auth.service.js')
const logger = require('../config/logger');

exports.sendOtp = async (req, res) => {
    try {
        logger.info('Received request for /auth/send-otp');
        const {firstName, lastName, email , password , confirmPassword} = req.body

        if(!firstName || !lastName || !email || !password || !confirmPassword){
            logger.warn('Rejected /auth/send-otp: required fields are missing');
            return res.status(400).json({ message: 'All fields are required' });
        }

        if(password !== confirmPassword){
            logger.warn('Rejected /auth/send-otp: passwords do not match');
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        const { otp, otpSessionId } = await authService.sendOtp(firstName, lastName, email , password);
        res.cookie('otpSessionId', otpSessionId, { httpOnly: true, maxAge: 300000 }); // Set cookie for 5 minutes
        return res.status(200).json({ message: 'OTP sent successfully'});
    }
    catch (error) {
        logger.error(`Failed /auth/send-otp: ${error.message}`);
        return res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};