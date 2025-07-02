const express = require('express');
const router = express.Router();
const { 
    addAccount ,
    accountList, 
    accountById, 
    changeName,
    defaultAccount,
    updateAccount,
    accountByCurrency
 } = require('../controllers/account.controller');
 
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');
router.route('/add').post(verifyToken,addAccount);
router.route('/list/:id').get(verifyToken,accountList);
router.route('/adminlist/:id').get(verifySecondaryToken,accountList);
router.route('/accountbyid/:id').get(verifyToken,accountById);
router.route('/default/:id').get(verifyToken,defaultAccount);
router.route('/change-name').put(verifyToken,changeName);
router.route('/update/:id').patch(verifyToken,updateAccount);
router.route('/accountbycurr/:id').get(verifyToken,accountByCurrency);

module.exports = router;

