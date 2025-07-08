const express = require('express');
const router = express.Router();
const { 
  list,
  addCurrency,
  currencyList, 
  countryList,
  currencyById,
  currencyDelete,
  getExchangeValue,
  exChangeCurrency,
  updateCurrencyDefaultStatus,
  // removeCurrencyDefaultStatus
 } = require('../controllers/currency.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');
router.route('/lists').get(currencyList);
router.route('/add').post(addCurrency);
router.route('/list').get(list);
router.route('/currency-list').get(currencyList);
router.route('/country-list').get(countryList);
router.route('/:id').get(verifyToken,currencyById);
router.route('/exchange').post(verifyToken,exChangeCurrency);
router.route('/getExchange').post(verifyToken,getExchangeValue);
router.route('/delete/:id').post(verifySecondaryToken,currencyDelete);
router.route('/update/:id').patch(verifySecondaryToken,updateCurrencyDefaultStatus);


module.exports = router;

