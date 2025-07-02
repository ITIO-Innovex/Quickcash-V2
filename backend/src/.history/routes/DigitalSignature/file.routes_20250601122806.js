const express = require('express');
const router = express.Router();
const { saveFile, saveFileListing } = require('../../controllers/DigitalSignature/fileController');
const { verifyToken } = require('../middlewares/auth.middleware');


// Apply authentication middleware
router.use(verifyToken);

// Route for saving files
router.post('/save', saveFile);

// Route for getting file listing
router.get('/list', saveFileListing);

module.exports = router; 