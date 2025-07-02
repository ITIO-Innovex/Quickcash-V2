const express = require('express');
const router = express.Router();
const { 
  addCreate,
  list, 
  ecommerceById,
  updateEcommerce,
  deleteEcommerce,
  sendLinktoMail,
  frontecommerceById,
  transactionDetails,
  invoice_frontecommerceById
 } = require('../controllers/ecommerce.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');
router.route('/add').post(verifyToken,addCreate);
router.route('/list/:id').get(verifyToken,list);

router.route('/admin/add').post(verifySecondaryToken,addCreate);
router.route('/adminlist/:id').get(verifySecondaryToken,list);
router.route('/admin/ecommerce/:id').get(verifySecondaryToken,ecommerceById);
router.route('/admin/transaction/:id').get(verifySecondaryToken,transactionDetails);
router.route('/admin/delete/:id').delete(verifySecondaryToken,deleteEcommerce);
router.route('/admin/update/:id').patch(verifySecondaryToken,updateEcommerce);
router.route('/admin/sendlink/:id').get(verifySecondaryToken,sendLinktoMail);

router.route('/:id').get(verifyToken,ecommerceById);
router.route('/transaction/:id').get(verifyToken,transactionDetails);
router.route('/frontend/:id').get(frontecommerceById);
router.route('/invoice-frontend/:id').get(invoice_frontecommerceById);
router.route('/update/:id').patch(verifyToken,updateEcommerce);
router.route('/sendlink/:id').get(verifyToken,sendLinktoMail);
router.route('/delete/:id').delete(verifyToken,deleteEcommerce);
module.exports = router;
