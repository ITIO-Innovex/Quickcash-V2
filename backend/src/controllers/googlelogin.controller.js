// src/controllers/user.controller.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const verifyGoogleToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ status: 400, message: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userData = decoded.data;

    let user = await User.findOne({ email: userData.email });
    if (!user) {
      user = await User.create({
        email: userData.email,
        name: userData.name,
        defaultcurr: userData.defaultcurr
      });
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    return res.status(201).json({
      status: 201,
      message: 'Google token verified',
      token: accessToken,
      user
    });

  } catch (err) {
    console.error('JWT Verification Error:', err);
    return res.status(401).json({ status: 401, message: 'Invalid token' });
  }
};

module.exports = {
  verifyGoogleToken
};
