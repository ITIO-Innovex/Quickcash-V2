const express = require('express');
const router = express.Router();
const { 
    revenueList,
    revenueByUser
 } = require('../controllers/revenue.controller');
 
const { verifyToken } = require('../middlewares/auth.middleware'); 
const { verifySecondaryToken } = require('../middlewares/admin.middleware');

router.route('/list').get(verifySecondaryToken,revenueList);
router.route('/dashboard/:id').get(verifyToken,revenueByUser);

module.exports = router;

