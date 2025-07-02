const express = require('express');
const router = express.Router();
const { getAllKycEntries ,getKycById ,updateKycStatus} = require('../../controllers/bsKyc.controller');
const { verifyToken } = require('../../middlewares/admin.middleware');

// Route to get all KYC entries (admin use)
router.route('/list').get(verifyToken, getAllKycEntries);
//Route to get details of kyc
router.route('/list/:id').get(verifyToken, getKycById);
// Route to change ststus of kyc
router.route('/status/:id').put( verifyToken ,updateKycStatus);
module.exports = router;
