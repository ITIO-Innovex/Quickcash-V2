const express = require('express');
const router = express.Router();
const { 
  addWalletRequest,
  list, 
  updateWalletRequestStatus,
  updateHistory,
  adminlist,
  newWalletRequest,
  exportExcelForTransaction
 } = require('../controllers/walletaddressrequest.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');
router.route('/list/:id').get(verifyToken,list);
router.route('/add').post(verifyToken,addWalletRequest);
router.route('/listadmin').get(verifySecondaryToken,adminlist);
router.route('/history/:id').get(verifySecondaryToken,updateHistory);
router.route('/update/:id').patch(verifySecondaryToken,updateWalletRequestStatus);
router.route('/exportstatement/:id').get(verifyToken,exportExcelForTransaction);
router.route('/request-newwalletaddress').post(verifyToken,newWalletRequest);
module.exports = router;

