const express = require('express');
const router = express.Router();
const { 
    createOrder,
    paymentCapture, 
    paymentCaptureMoney
 } = require('../../controllers/PaymentGateway/razorpay.controller');
 

router.route('/createOrder').post(createOrder);
router.route('/capture/money').post(paymentCaptureMoney);
router.route('/capture').post(paymentCapture);

module.exports = router;

