const express = require('express');
const router = express.Router();

const { 
  addInvoiceTemplate,
  list,
  getDetailsById,
 } = require('../controllers/templatesetting.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.route('/add').post(verifyToken,addInvoiceTemplate);
router.route('/list/:id').get(verifyToken,list);
router.route('/:id').get(verifyToken,getDetailsById);

module.exports = router;

