const prisma = require('../config/prisma');
const logger = require('../config/logger');
const crypto = require('crypto');
const redisClient = require('../config/redis');

const { generateAndSendOtp } = require('../utils/otp');

const sendEmail = require('../utils/email').sendEmail;

const sendOtp = async (email) => {
    const existingUser = await prisma.user.findUnique({where : { email }});
    // if (existingUser) {
    //     throw new Error('User already exists');
    // }

    // await prisma.user.create({
    //     data: {
    //         firstName,
    //         lastName,
    //         email,
    //         password
    //     }
    // });
    logger.info('Created unverified user record in PostgreSQL');

    const meta = { email };

    const {otp , otpSessionId} = await generateAndSendOtp(meta);

    await sendEmail({...meta , otp});

    return { otp, otpSessionId };
    
}

const verifyOtp = async (otpSessionId, otp) => {
    try {
        const redis = await redisClient.connect();
        const otpData = await redis.get(`otp:${otpSessionId}`);
        if (!otpData) {
            throw new Error('OTP session not found or expired');
        }

        const { hashedOtp, meta } = JSON.parse(otpData);
        const hashInputOtp = crypto.createHash('sha256').update(meta.email + ':' + otp).digest('hex');

        if (hashedOtp !== hashInputOtp) {
            throw new Error('Invalid OTP');
        }

        // OTP is valid, create the user in PostgreSQL

        const existingUser = await prisma.user.findUnique({where : {  email : meta.email}});
        if(!existingUser){
            await prisma.user.create({
                data: {
                    firstName: meta.firstName ,
                    lastName: meta.lastName,
                    email: meta.email,
                    password: meta.password
                }
            
             })
             logger.info('User verified and created in PostgreSQL');
        }

        // Clean up the OTP from Redis
        await redis.del(`otp:${otpSessionId}`);
    } catch (error) {
        logger.error(`Error verifying OTP: ${error.message}`);
        throw error;
    }
};

module.exports = { sendOtp, verifyOtp };
