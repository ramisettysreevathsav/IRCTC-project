const redis = require('../config/redis').getClient();

async function generateAndSendOtp(meta) {
    const otpgenerator = require('otp-generator');
    const rateLimitKey = `otp_rate_limit:${meta.email}`;
    const rateLimit = await redis.get(rateLimitKey);

    if (Number(rateLimit) >= 5) {
        throw new Error('OTP request limit exceeded. Please try again later.');
    }
    const otp = otpgenerator.generate(6, 
        { upperCaseAlphabets: false, 
          lowerCaseAlphabets: false ,
          specialChars: false
    });

    const otpSessionId = crypto.randomUUID();
    const hashOtp = crypto.createHash('sha256').update(meta.email + ':' + otp).digest('hex');

    // Store the OTP in Redis with a TTL of 5 minutes
    await redis.setex(`otp:${otpSessionId}`, 300, JSON.stringify(
        {
            hashedOtp: hashOtp,
            meta
        }
    ));
    await redis.incr(rateLimitKey); // incrementing counter for every otp hit
    await redis.expire(rateLimitKey, 3600); // Set rate limit key to expire in 1 hour
    
    
     return { otp, otpSessionId };

}

module.exports = {
    generateAndSendOtp
};