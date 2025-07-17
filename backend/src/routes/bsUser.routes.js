const express = require('express');
const { createUser, checkBusinessUserExists, addBusinessDetails, addBusinessAddress, addRepresentativeInfo,addBankInfo,getBusinessUser, upload, uploadKycDocument,getBusinessProfile,verifyOtp, listBusinessKyc, getBusinessRegistrationProgress} = require('../controllers/bsUser.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const router = express.Router();

//  New business user form submission route
router.route('/register-info').post(verifyToken, createUser);
// route to verify otp
router.route('/verify').post(verifyToken, verifyOtp);
// route for checking email verification of user
router.route('/check').post(verifyToken, checkBusinessUserExists); 
// Route for saving business details
router.route('/details').post(verifyToken, addBusinessDetails);
// Route for saving business address
router.route('/address').post(verifyToken, addBusinessAddress);
// Route for saving representative info
router.route('/representative-info').post(verifyToken, addRepresentativeInfo);
// Route for saving bank info
router.route('/bank-info').post(verifyToken, addBankInfo);
// Route to get user's Business Account Details
router.route('/fetch-details').get(verifyToken, getBusinessUser);
// Route to upload kyc docs
router.route('/upload-kyc').post(verifyToken, upload.single('document'), uploadKycDocument);
// Route to get business details
router.route('/fetch-profile').get(verifyToken, getBusinessProfile);
// Route to get business registration progress
router.route('/progress').get(verifyToken, getBusinessRegistrationProgress);
module.exports = router;