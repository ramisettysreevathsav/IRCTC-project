
const express = require('express');

const router = express.Router();



const authController = require('../controllers/auth.controller');

router.post('/send-otp', authController.sendOtp);

module.exports = router;