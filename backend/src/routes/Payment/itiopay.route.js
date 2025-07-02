const express = require('express');
const router = express.Router();
const { 
  saveData,
  checkStatus,
  initiatePayment,
  invoicesaveData,
  callbackResponse,
  invoicecheckStatus,
  invoiceinitiatePayment
} = require('../../controllers/PaymentGateway/itiopay.controller');

router.route('/pay').post(initiatePayment);
router.route('/inv/pay').post(invoiceinitiatePayment);
router.route('/return').all(callbackResponse);
router.route('/status/:id').all(checkStatus);
router.route('/inv/status/:id').all(invoicecheckStatus);
router.route('/inv/savedata').post(invoicesaveData);
router.route('/savedata').post(saveData);

module.exports = router;

