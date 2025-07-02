const express = require('express');
const router = express.Router();
const signController = require('../controller/signController');
const { authenticate } = require('../middleware/auth');

router.get('/signatures', authenticate, signController.getSignature);
router.post('/signatures', signController.storeSignature);

module.exports = router;