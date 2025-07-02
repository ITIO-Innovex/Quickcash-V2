const express = require('express');
const router = express.Router();
const signController = require('../../controllers/DigitalSignature/sign.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');

router.get('/signatures', verifyToken, signController.getSignature);
router.post('/signatures', verifyToken, signController.storeSignature);

module.exports = router;