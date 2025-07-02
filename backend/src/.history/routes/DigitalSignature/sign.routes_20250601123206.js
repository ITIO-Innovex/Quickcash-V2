const express = require('express');
const router = express.Router();
const signController = require('../controller/signController');
const { verifyToken } = require('../../middlewares/auth.middleware');

router.get('/signatures', verifyToken, signController.getSignature);
router.post('/signatures', verifyToken.storeSignature);

module.exports = router;