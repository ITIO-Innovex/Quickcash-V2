const express = require('express');
const router = express.Router();

const {
  upsertPaymentDetail,
  getIncomingPaymentDetails
} = require('../controllers/paymentDetails.controller');

const verifyToken = require('../middlewares/auth.middleware');

// Save/update payment details
router.post('/payment-details', verifyToken, upsertPaymentDetail);

// Get all incoming payment details
router.get('/payment-details/incoming', verifyToken, getIncomingPaymentDetails);

module.exports = router;
