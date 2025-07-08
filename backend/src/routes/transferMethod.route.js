const express = require('express');
const router = express.Router();
const { 
  getTransferMethods,
  getTransferMethodById,
  createTransferMethod,
  updateTransferMethod,
  deleteTransferMethod,
  validateTransferForm,
  processTransfer,
  getRecommendedMethod
} = require('../controllers/transferMethod.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');
const { verifyAccountWithUser } = require('../middlewares/aacount.middleware');

// Public routes (for getting transfer methods)
router.route('/methods').get(getTransferMethods);
router.route('/methods/:methodId').get(getTransferMethodById);
router.route('/recommended').get(getRecommendedMethod);

// Protected routes (require authentication)
router.route('/validate').post(verifyToken, validateTransferForm);
router.route('/process').post(verifyToken, verifyAccountWithUser, processTransfer);

// Admin routes (require admin authentication)
router.route('/admin/methods').post(verifySecondaryToken, createTransferMethod);
router.route('/admin/methods/:methodId').put(verifySecondaryToken, updateTransferMethod);
router.route('/admin/methods/:methodId').delete(verifySecondaryToken, deleteTransferMethod);

module.exports = router; 