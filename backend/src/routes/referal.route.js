const express = require('express');
const router = express.Router();
const { 
  list,
  ReferedUsersList,
  generateReferalCode,
  AdminReferedUsersList,
  IsReferalCodeGenerated,
  exportExcelForReferral,
  generateReferalCodeforAPI
 } = require('../controllers/referal.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');
router.route('/list/:id').get(verifyToken,list);
router.route('/list/:id').get(verifySecondaryToken,list);
router.route('/add').post(verifyToken,generateReferalCode);
router.route('/referuserslist/:id').get(verifyToken,ReferedUsersList);
router.route('/export/:id').get(verifyToken,exportExcelForReferral);
router.route('/codeExists/:id').get(verifyToken,IsReferalCodeGenerated);
router.route('/referallist').get(AdminReferedUsersList);
router.route('/generate').get(verifyToken,generateReferalCodeforAPI);
module.exports = router;

