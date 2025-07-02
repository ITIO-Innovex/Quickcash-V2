const express = require('express');
const router = express.Router();

const { 
  addTax,
  list, 
  getDetailsById,
  updateTax, 
  deleteMember,
 } = require('../controllers/tax.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');

router.route('/add').post(verifyToken,addTax);
router.route('/list/:id').get(verifyToken,list);
router.route('/:id').get(verifyToken,getDetailsById);
router.route('/update/:id').patch(verifyToken,updateTax);
router.route('/delete/:id').delete(verifyToken,deleteMember);

router.route('/admin/add').post(verifySecondaryToken,addTax);
router.route('/admin/list/:id').get(verifySecondaryToken,list);
router.route('/admin/:id').get(verifySecondaryToken,getDetailsById);
router.route('/admin/update/:id').patch(verifySecondaryToken,updateTax);
router.route('/admin/delete/:id').delete(verifySecondaryToken,deleteMember);

module.exports = router;

