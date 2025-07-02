const express = require('express');
const router = express.Router();
const { 
  createIntent,
  paymentCapture, 
  confirmPaymentIntent,
  completePayment,
  retreiveIntent,
  paymentCaptureAddMoney,
  cryptopaymentCaptureAddMoney
} = require('../../controllers/PaymentGateway/stripe.controller');

router.route('/create-intent').post(createIntent);
router.route('/capture').post(paymentCapture);
router.route('/confirmPayment').post(confirmPaymentIntent);
router.route('/complete').post(completePayment);
router.route('/complete-addmoney').post(paymentCaptureAddMoney);
router.route('/crypto-addmoney').post(cryptopaymentCaptureAddMoney);
router.route('/fetch').post(retreiveIntent);

module.exports = router;

