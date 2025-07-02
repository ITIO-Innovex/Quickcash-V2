const express = require('express');
const passport = require('passport');
const router = express.Router();
const ip = require('ip');
const { UserSession } = require('../models/usersession.model');

// 1️⃣ Start Google Auth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 2️⃣ Callback after Google Auth
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    const user = req.user;

    // Optional: log session (similar to your addSession controller)
    await UserSession.create({
      user: user._id,
      device: req.headers['user-agent'],
      OS: "Google OAuth",
      ipAddress: ip.address(),
      status: "Logged in with Google",
      isActiveNow: true
    });

    // Redirects to frontend
    router.get(
        '/google/callback',
        passport.authenticate('google', { failureRedirect: '/login-failed' }),
        (req, res) => {
          console.log('User:', req.user);
          res.redirect(`${process.env.BASE_URL2}/home?currency=all&token=${token}`);

        }
      );
      

    // Generate JWT if needed
    const token = user.generateAccessToken(); // assuming your model has this method

    // Set cookie (optional) or redirect
    res.cookie('accessToken', token, {
      httpOnly: true,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });

    // Redirect to dashboard or frontend app
    res.redirect(`${process.env.BASE_URL2}/myapp/web?token=${token}`);
  }
);

module.exports = router;
