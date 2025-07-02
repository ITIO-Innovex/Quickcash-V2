const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otp.controller');

// Route for sending OTP
router.post('/send-otp', otpController.sendOTP);

// Route for verifying OTP
router.post('/verify-otp', otpController.verifyOTP);

module.exports = router;
