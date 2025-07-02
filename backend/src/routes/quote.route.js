const express = require('express');
const router = express.Router();
const { 
  addQuote,
  addQuoteApi,
  updateQuote, 
  quoteList,
  quoteById,
  deleteQuote,
  exportExcelForQuote,
  reminderQuoteToUser,
  convertQuoteToInvoice,
  getQuoteInfoByQuoteNumber,
  updateQuoteStatusByCustomer,
  getQuoteStatusByQuoteNumber
 } = require('../controllers/quote.controller');
 
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');

router.route('/add').post(verifyToken,addQuote);
router.route('/mobileApp/add').post(verifyToken,addQuoteApi);
router.route('/list/:id').get(verifyToken,quoteList);
router.route('/adminlist/:id').get(verifySecondaryToken,quoteList);
router.route('/:id').get(verifyToken,quoteById);
router.route('/getinv/info/:id').get(verifyToken,getQuoteInfoByQuoteNumber);
router.route('/update/:id').patch(verifyToken,updateQuote);
router.route('/delete/:id').delete(verifyToken,deleteQuote);
router.route('/export/:id').get(verifyToken,exportExcelForQuote);
router.route('/reminder-inv/:id').get(verifyToken,reminderQuoteToUser);
router.route('/status/:id').patch(updateQuoteStatusByCustomer);
router.route('/check-status/:id').get(getQuoteStatusByQuoteNumber);
router.route('/convert-quote/:id').patch(verifyToken,convertQuoteToInvoice);

module.exports = router;

