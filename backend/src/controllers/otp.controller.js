const otpModel = require('../models/opt.model');

// Send OTP and respond
exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const otp = await otpModel.sendOTP(email);

  if (otp) {
    return res.status(200).json({ message: 'OTP sent successfully', otp });
  } else {
    return res.status(500).json({ message: 'Error sending OTP' });
  }
};

// Verify OTP entered by user
exports.verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const isVerified = otpModel.verifyOTP(email, otp);

  if (isVerified) {
    return res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    return res.status(400).json({ message: 'Invalid OTP' });
  }
};
