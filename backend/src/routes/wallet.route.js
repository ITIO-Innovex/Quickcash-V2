const express = require('express');
const router = express.Router();
const { 
  addMoney,
  list, 
  getAllCoinsForUsers,
 } = require('../controllers/wallet.controller');

const { verifyToken } = require('../middlewares/auth.middleware');
router.route('/add').post(verifyToken,addMoney);
router.route('/list/:id/:account_id').get(verifyToken,list);
router.route('/fetchcoins').get( verifyToken, getAllCoinsForUsers); 
module.exports = router;

