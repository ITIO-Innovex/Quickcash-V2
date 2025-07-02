const express = require('express');
const router = express.Router();
const { 
    addReceipient,
    receipientList, 
    receipientById, 
    addAPIReceipient,
    directAPIReceipient,
    updateReciepientInfo
 } = require('../controllers/receipient.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');
router.route('/add').post(verifyToken,addReceipient);
router.route('/list/:id').get(verifyToken,receipientList);
router.route('/adminlist/:id').get(verifySecondaryToken,receipientList);
router.route('/:id').get(verifyToken,receipientById);
router.route('/update').patch(verifyToken,updateReciepientInfo);
router.route('/make-payment').post(verifyToken,addAPIReceipient);
router.route('/direct-payment').post(verifyToken,directAPIReceipient);

module.exports = router;

