const express = require('express');
const router = express.Router();

const { 
  addProduct,
  productList, 
  productListApi,
  proById,
  updateProduct,
  deleteProduct
 } = require('../controllers/product.controller');

const { verifyToken } = require('../middlewares/auth.middleware');

router.route('/add').post(verifyToken,addProduct);
router.route('/list/:id').get(verifyToken,productList);
router.route('/listapi/:id').get(verifyToken,productListApi);
router.route('/:id').get(verifyToken,proById);
router.route('/update/:id').patch(verifyToken,updateProduct);
router.route('/delete/:id').delete(verifyToken,deleteProduct);

module.exports = router;

