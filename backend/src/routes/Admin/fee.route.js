const express = require('express');
const router  = express.Router();
const { 
  addFeeStructure,
  feeStructureList, 
  feeStructureById, 
  updateFeeStructure,
  deleteFeeStructure,
} = require('../../controllers/Admin/feestructure.controller');

const { verifyToken } = require('../../middlewares/admin.middleware');

router.route('/fees/:id').get(verifyToken,feeStructureById);
router.route('/add').post(verifyToken,addFeeStructure);
router.route('/list').get(verifyToken,feeStructureList);
router.route('/update/:id').patch(verifyToken,updateFeeStructure);
router.route('/delete/:id').delete(verifyToken,deleteFeeStructure);

module.exports = router;

