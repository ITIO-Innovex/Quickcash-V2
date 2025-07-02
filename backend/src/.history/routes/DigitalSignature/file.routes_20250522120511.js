const express = require('express');
const router = express.Router();
const { saveFile, saveFileListing } = require('../controller/fileController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware
router.use(authenticate);

// Route for saving files
router.post('/save', saveFile);

// Route for getting file listing
router.get('/list', saveFileListing);

module.exports = router; 