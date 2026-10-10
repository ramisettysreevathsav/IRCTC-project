const authService = require('../services/auth.service.js')

exports.sendOtp = async (req, res) => {
    const {firstName, lastName, email , password , confirmPassword} = req.body

    if(!firstName || !lastName || !email || !password || !confirmPassword){
        return res.status(400).json({ message: 'All fields are required' });
    }

    if(password !== confirmPassword){
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const { otp, otpSessionId } = await authService.sendOtp(firstName, lastName, email , password);
        res.cookie('otpSessionId', otpSessionId, { httpOnly: true, maxAge: 300000 }); // Set cookie for 5 minutes
        return res.status(200).json({ message: 'OTP sent successfully'});
    }
    catch (error) {
        return res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};