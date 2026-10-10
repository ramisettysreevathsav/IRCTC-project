
const nodemailer = require('nodemailer');

const sendEmail = async (meta) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: meta.email,
        subject: 'OTP for Email Verification',
        html: `<div>Hello ${meta.firstName} ${meta.lastName},</div><br/>Your OTP for email verification is: ${meta.otp}<br/>Please enter this OTP to verify your email address.`
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };