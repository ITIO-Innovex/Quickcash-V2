const express = require('express');
const router = express.Router();
const { 
  paymentCapture, 
 } = require('../../controllers/PaymentGateway/paypal.controller');

router.route('/capture').post(paymentCapture);

module.exports = router;

