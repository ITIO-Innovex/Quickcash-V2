const express = require('express');
const router = express.Router();
const { linkedinLogin, linkedinCallback, logout } = require('../controllers/linkedin.controller');

// LinkedIn login route
router.get('/linkedin', linkedinLogin);

// LinkedIn callback route
router.get('/linkedin/callback', linkedinCallback);

// Logout route
router.get('/logout', logout);

module.exports = router;
