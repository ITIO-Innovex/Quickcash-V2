const express = require('express');
const router = express.Router();
const { 
    addTransaction,
    transactionList, 
    transactionById,
    transactionByIdApi, 
    transactionBySourceAccount,
    getStatement,
    updateStatus,
    admintransactionList,
    exportExcelForTransaction,
    accountByUserandCurrency,
    sendTransaction,
    getExchangeValues,
    getExchangeRate,
    admintransaction_all,
    addMoneyTrnsactionForApp,
    exportExcelForCryptoTransaction,
    exportExcelForTransactionStatement,
    adminexportExcelForTransactionStatement
 } = require('../controllers/transaction.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');
const { verifyAccountWithUser } = require('../middlewares/aacount.middleware');

router.route('/add').post(verifyToken,verifyAccountWithUser,addTransaction);
router.route('/addsend').post(verifyToken,verifyAccountWithUser,sendTransaction);
router.route('/list/:id').get(verifyToken,transactionList);
router.route('/admin/listall').get(verifySecondaryToken,admintransaction_all);
router.route('/:id').get(verifyToken,transactionById);
router.route('/tapi/:id').get(verifyToken,transactionByIdApi);
router.route('/tr/:id').get(verifySecondaryToken,transactionById);
router.route('/account').post(verifyToken,transactionBySourceAccount);
router.route('/statement').post(verifyToken,getStatement);
router.route('/admin/list').get(verifySecondaryToken,admintransactionList);
router.route('/account/fetch').post(verifyToken,accountByUserandCurrency);
router.route('/admin/status/update/:id').patch(verifySecondaryToken,updateStatus);
router.route('/export/:id').get(verifyToken,exportExcelForTransaction);
router.route('/exportstatement/:id').get(verifyToken,exportExcelForTransactionStatement);
router.route('/exportcrypto/:id/:name').get(verifyToken,exportExcelForCryptoTransaction);
router.route('/admin/exportstatement').get(verifySecondaryToken,adminexportExcelForTransactionStatement);

// Mobile APP API

router.route('/mobileapp/exchange').post(verifyToken,getExchangeValues);
router.route('/mobileapp/rate').post(verifyToken,getExchangeRate);
router.route('/mobileapp/addmoney').post(verifyToken,addMoneyTrnsactionForApp);

module.exports = router;

