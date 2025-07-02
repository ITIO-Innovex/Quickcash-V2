const express = require('express');
const router = express.Router();

const { 
  addTax,
  list, 
  getDetailsById,
  updateTax, 
  deleteMember,
 } = require('../controllers/tax.controller');

const { verifySecondaryToken } = require('../middlewares/admin.middleware');

router.route('/add').post(verifySecondaryToken,addTax);
router.route('/list/:id').get(verifySecondaryToken,list);
router.route('/:id').get(verifySecondaryToken,getDetailsById);
router.route('/update/:id').patch(verifySecondaryToken,updateTax);
router.route('/delete/:id').delete(verifySecondaryToken,deleteMember);

module.exports = router;

