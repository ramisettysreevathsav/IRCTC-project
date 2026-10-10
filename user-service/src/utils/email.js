
const nodemailer = require('nodemailer');

const sendEmail = async (meta) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: meta.email,
        subject: 'OTP for Email Verification',
        html: `<div>Hello ${meta.firstName} ${meta.lastName},</div><br/>Your OTP for email verification is: ${meta.otp}<br/>Please enter this OTP to verify your email address.`
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };