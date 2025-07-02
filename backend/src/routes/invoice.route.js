const express = require('express');
const router = express.Router();

const { 
  addInvoice,
  addInvoiceApi,
  invoiceList, 
  invoiceById,
  generateInv,
  updateInvoice,
  deleteInvoice,
  generateInvapi,
  quoteDashboard,
  transactionsById,
  invoiceDashboard,
  filterQuoteDashboard,
  exportExcelForInvoice,
  reminderInvoiceToUser,
  filterinvoiceDashboard,
  IsAvailableInvoiceSettings,
  getInvoiceInfoByInvoiceNumber,
  getInvoiceTransactionByInvoiceNumber
 } = require('../controllers/invoice.controller');

const { verifyToken } = require('../middlewares/auth.middleware');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');

router.route('/add').post(verifyToken,addInvoice);
router.route('/mobileApp/add').post(verifyToken,addInvoiceApi);
router.route('/list/:id').get(verifyToken,invoiceList);
router.route('/adminlist/:id').get(verifySecondaryToken,invoiceList);
router.route('/:id').get(verifyToken,invoiceById);
router.route('/getinv/info/:id').get(verifyToken,getInvoiceInfoByInvoiceNumber);
router.route('/transactions/:id').get(transactionsById);
router.route('/update/:id').patch(verifyToken,updateInvoice);
router.route('/generate/inv').get(verifyToken,generateInv);
router.route('/generate/invapi').get(verifyToken,generateInvapi);
router.route('/delete/:id').delete(verifyToken,deleteInvoice);
router.route('/export/:id').get(verifyToken,exportExcelForInvoice);
router.route('/settings-inv/:id').get(verifyToken,IsAvailableInvoiceSettings);
router.route('/reminder-inv/:id').get(verifyToken,reminderInvoiceToUser);
router.route('/dashboard/details').get(verifyToken,invoiceDashboard);
router.route('/dashboard/filter').get(verifyToken,filterinvoiceDashboard);
router.route('/dashboard/quote').get(verifyToken,quoteDashboard);
router.route('/dashboard/quote-filter').get(verifyToken,filterQuoteDashboard);
router.route('/transaction/:invoice_id').get(verifyToken,getInvoiceTransactionByInvoiceNumber);

module.exports = router;

