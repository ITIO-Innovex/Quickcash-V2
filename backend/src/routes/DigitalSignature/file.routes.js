const express = require('express');
const router = express.Router();
const { saveFile, saveFileListing } = require('../../controllers/DigitalSignature/file.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');

router.post('/save', verifyToken, saveFile);
router.get('/list', verifyToken, saveFileListing);

module.exports = router; 