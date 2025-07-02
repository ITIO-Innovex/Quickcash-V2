const express = require('express');
const router = express.Router();
const { saveFile, saveFileListing } = require('../../controllers/DigitalSignature/file.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');

router.use(verifyToken);
router.post('/save', saveFile);
router.get('/list', saveFileListing);

module.exports = router; 