const express = require('express');
const router = express.Router();
const documentController = require('../../controllers/DigitalSignature/document.controller');
const { verifyToken, validateToken } = require('../../middlewares/auth.middleware');

// Document after-save route
router.get('/list', verifyToken, documentController.getDocumentList);
router.get('/list/:id', verifyToken, documentController.getDocumentUserList);
router.get('/:id', documentController.getDocumentById);
router.post('/after-save', verifyToken, documentController.handleDocumentAfterSave);
router.post('/save-pdf', validateToken, documentController.savePdf);
router.post('/forward-doc', verifyToken, documentController.forwardDoc);
router.put('/update-document/:docId', verifyToken, documentController.updateDocument);
router.post('/send-mail', validateToken, documentController.sendGeneralDocumentMail);
router.post('/get-report', verifyToken, documentController.getReport);
router.put('/decline-document', validateToken, documentController.declineDocument);
router.delete('/:id', verifyToken, documentController.deleteDocument);

router.put('/view-document', documentController.handleDocumentWebhook);

module.exports = router; 