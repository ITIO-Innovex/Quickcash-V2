const express = require('express');
const multer  = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
  cb(null, './public/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname)
  }
})
  
const upload = multer({ storage: storage })
  
const router = express.Router();

const { 
  // registerAdmin,
  loginUser, 
  logoutUser, 
  // auth,
  updateUserInfo,
  resetPassword,
  forgetPassword,
  usersList,
  sendOtp,
  updateTwofa,
  adminsList,
  getbyId,
  generatePassword,
  ticketsList,
  usertickets,
  usergetbyId,
  accountsList,
  accountsListByID,
  removeprofileImage,
  dashboardData,
  registerAdmin
 } = require('../../controllers/Admin/admin.controller');
const { verifyToken } = require('../../middlewares/admin.middleware');

router.route('/test').get(loginUser);
// router.route('/register').post(registerAdmin);
router.route('/login').post(loginUser);
router.route('/logout').post(verifyToken,logoutUser);
router.route('/dashboarddetails').get(verifyToken,dashboardData);
// router.route('/auth').get(verifyToken,auth);
router.route('/register').post(registerAdmin);
router.route('/forget-password').post(forgetPassword);
router.route('/reset-password').post(resetPassword);
router.route('/adminsList').get(verifyToken,adminsList);
router.route('/userslist').get(verifyToken,usersList);
router.route('/accountslist').get(verifyToken,accountsList);
router.route('/accountslist/:id').get(verifyToken,accountsListByID);
router.route('/ticketslist').get(verifyToken,ticketsList);
router.route('/usertickets').get(verifyToken,usertickets);
router.route('/sendOtp').post(verifyToken,sendOtp);
router.route('/verifyotp').post(verifyToken,updateTwofa);
router.route('/getbyId/:id').get(verifyToken,getbyId);
router.route('/usergetbyId/:id').get(verifyToken,usergetbyId);
router.route('/removeprofileImage').patch(verifyToken,removeprofileImage);
router.route('/generatePassword/:id').patch(verifyToken,generatePassword);
router.route('/update-profile').patch(verifyToken, upload.fields([{ name: 'profileAvatar', maxCount: 1}]),updateUserInfo);

module.exports = router;

