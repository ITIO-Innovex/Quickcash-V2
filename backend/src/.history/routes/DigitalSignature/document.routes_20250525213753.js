const express = require('express');
const router = express.Router();
const documentController = require('../controller/documentController');
const { authenticate } = require('../middleware/auth');

// Document after-save route
router.get('/list', authenticate, documentController.getDocumentList);
router.get('/list/:id', authenticate, documentController.getDocumentUserList);
router.get('/:id', authenticate, documentController.getDocumentById);
router.post('/after-save', authenticate, documentController.handleDocumentAfterSave);
router.post('/save-pdf', authenticate, documentController.savePdf);
router.post('/forward-doc', authenticate, documentController.forwardDoc);

module.exports = router; 