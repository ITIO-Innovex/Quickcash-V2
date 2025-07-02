const express = require('express');
const router = express.Router();
const templateController = require('../../controllers/DigitalSignature/template.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');

// Save a new template
router.post('/templates-store', verifyToken, templateController.saveTemplate);

// Get all templates
router.get('/templates-list', verifyToken, templateController.getAllTemplates);

// Delete template
router.delete('/:templateId', verifyToken, templateController.deleteTemplate);

module.exports = router;
