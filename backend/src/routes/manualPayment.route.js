const express = require('express');
const router = express.Router();
const { 
  add,
  unpaidInvoice, 
  manualInvoiceById,
  manualInvoiceList,
  invoiceListformanual,
  transactionInvoiceList,
  getInvoiceInfoByInvoiceNumber,
 } = require('../controllers/manualPayment.controller');

const { verifyToken } = require('../middlewares/auth.middleware');

router.route('/add').post(verifyToken,add);
router.route('/list').get(verifyToken,manualInvoiceList);
router.route('/transaction-list').get(verifyToken,transactionInvoiceList);
router.route('/:id').get(verifyToken,manualInvoiceById);
router.route('/getinv/info/:id').get(verifyToken,getInvoiceInfoByInvoiceNumber);
router.route('/unpaidList/:id').get(verifyToken,unpaidInvoice);
router.route('/unpaidapi/:id').get(verifyToken,invoiceListformanual);

module.exports = router;

