const express = require('express');
const router = express.Router();

const { 
  addCategory,
  categoryList, 
  catById, 
  updateCategory,
  deleteCategory,
 } = require('../controllers/category.controller');

const { verifyToken } = require('../middlewares/auth.middleware');

router.route('/:id').get(verifyToken,catById);
router.route('/add').post(verifyToken,addCategory);
router.route('/list/:id').get(verifyToken,categoryList);
router.route('/update/:id').patch(verifyToken,updateCategory);
router.route('/delete/:id').delete(verifyToken,deleteCategory);

module.exports = router;

