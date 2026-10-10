const prisma = require('../config/prisma').prisma;

const generateAndSendOtp = require('../utils/otp')

const sendEmail = require('../utils/email').sendEmail;

const sendOtp = async (firstName, lastName, email, password) => {
    const existingUser = await prisma.user.findUnique({where : { email }});
    if (existingUser) {
        throw new Error('User already exists');
    }

    const meta = {firstName, lastName, email, password}

    const {otp , otpSessionId} = await generateAndSendOtp(meta);

    await sendEmail({...meta , otp});

    return { otp, otpSessionId };
    
}

module.exports = {sendOtp}