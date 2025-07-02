const express = require('express');
const router = express.Router();
const { 
  addAdminInvoice,
  invoiceList, 
  invoiceById,
  generateInv,
  updateAdminInvoice,
  deleteInvoice,
  AdmininvoiceList,
  transactionsById,
  exportExcelForInvoice
 } = require('../controllers/invoice.controller');

const { verifySecondaryToken } = require('../middlewares/admin.middleware');
router.route('/add').post(verifySecondaryToken,addAdminInvoice);
router.route('/list/:id').get(verifySecondaryToken,AdmininvoiceList);
router.route('/transactions/:id').get(transactionsById);
router.route('/adminlist/:id').get(verifySecondaryToken,invoiceList);
router.route('/:id').get(verifySecondaryToken,invoiceById);
router.route('/update/:id').patch(verifySecondaryToken,updateAdminInvoice);
router.route('/generate/inv').get(verifySecondaryToken,generateInv);
router.route('/delete/:id').delete(verifySecondaryToken,deleteInvoice);
router.route('/export/:id').get(verifySecondaryToken,exportExcelForInvoice);
module.exports = router;

