const prisma = require('../config/prisma');
const logger = require('../config/logger');

const { generateAndSendOtp } = require('../utils/otp');

const sendEmail = require('../utils/email').sendEmail;

const sendOtp = async (firstName, lastName, email, password) => {
    const existingUser = await prisma.user.findUnique({where : { email }});
    if (existingUser) {
        throw new Error('User already exists');
    }

    await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password
        }
    });
    logger.info('Created unverified user record in PostgreSQL');

    const meta = {firstName, lastName, email, password}

    const {otp , otpSessionId} = await generateAndSendOtp(meta);

    await sendEmail({...meta , otp});

    return { otp, otpSessionId };
    
}

module.exports = {sendOtp}