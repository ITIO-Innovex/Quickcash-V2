const express = require('express');
const router = express.Router();
const documentController = require('../../controllers/DigitalSignature/documentController');
const { verifyToken } = require('../middlewares/auth.middleware');

// Document after-save route
router.get('/list', verifyToken, documentController.getDocumentList);
router.get('/list/:id', verifyToken, documentController.getDocumentUserList);
router.get('/:id', verifyToken, documentController.getDocumentById);
router.post('/after-save', verifyToken, documentController.handleDocumentAfterSave);
router.post('/save-pdf', verifyToken, documentController.savePdf);
router.post('/forward-doc', verifyToken, documentController.forwardDoc);

module.exports = router; 