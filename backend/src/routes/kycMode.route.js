const express = require('express');
const router = express.Router();
const kycModeController = require('../controllers/kycMode.controller');
const { verifyToken } = require('../middlewares/admin.middleware');

// POST for Sumsub KYC config
router.post('/sumsub',verifyToken, kycModeController.setSumsubKycConfig);
// GET for Sumsub KYC config
router.get('/sumsub', verifyToken, kycModeController.getSumsubKycConfig);
// PUT for Sumsub KYC config
router.put('/sumsub', verifyToken, kycModeController.updateSumsubKycConfig);

module.exports = router; 