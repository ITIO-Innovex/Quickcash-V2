const express = require('express');
const router = express.Router();
const { sendContactMail } = require('../controllers/contact.controller');

router.post('/send', sendContactMail);

module.exports = router;
