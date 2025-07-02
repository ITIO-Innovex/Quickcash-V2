const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { signup, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { googleCallbackHandler } = require('../middlewares/passport.middleware');
const User = require('../models/user.model'); 

// Regular auth routes
router.post('/signup', signup);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// 🔐 Google OAuth Routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  googleCallbackHandler
);

module.exports = router;
