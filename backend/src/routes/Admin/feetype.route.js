const express = require('express');
const router  = express.Router();
const { 
  addFeeType,
  FeeTypeList, 
  FeeTypeById, 
  updateFeeType,
  deleteFeeType,
  FeeTypeByType
} = require('../../controllers/Admin/feetype.controller');

const { verifyToken } = require('../../middlewares/admin.middleware');

router.route('/fees/:id').get(verifyToken,FeeTypeById);
router.route('/type').get(FeeTypeByType);
router.route('/add').post(verifyToken,addFeeType);
router.route('/list').get(FeeTypeList);
router.route('/update/:id').patch(verifyToken,updateFeeType);
router.route('/delete/:id').delete(verifyToken,deleteFeeType);

module.exports = router;

