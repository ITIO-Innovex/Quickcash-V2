const express = require('express');
const router = express.Router();

const { 
  addInvoiceTemplate,
  list,
  getDetailsById,
 } = require('../controllers/templatesetting.controller');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');

router.route('/add').post(verifySecondaryToken,addInvoiceTemplate);
router.route('/list/:id').get(verifySecondaryToken,list);
router.route('/:id').get(verifySecondaryToken,getDetailsById);

module.exports = router;

