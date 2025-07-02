const express = require('express');
const router = express.Router();
const { 
  callbackResponse
 } = require('../controllers/PaymentGateway/itiopay.controller');

router.route('/getResponse').get(callbackResponse);
module.exports = router;

