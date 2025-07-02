const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/auth.middleware');
const { getSigners, addContact, getContactDetails } = require('../../controllers/DigitalSignature/contactBook.controller')

router.get('/list', verifyToken, getSigners);
router.post('/add', verifyToken, addContact);
router.get('/details/:id', getContactDetails);

module.exports = router;