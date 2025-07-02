const fs = require('fs');
const path = require('path');
const multer  = require('multer');
const express = require('express');

var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    const folderName = path.resolve(path.join(__dirname, '../../../storage/profile'+'/'+req.user?._id));
    try {
     if (!fs.existsSync(folderName)) {
      console.log("folder creating", folderName);
      fs.mkdirSync(folderName);
     } 
    } catch (err) {
      console.error("errdor",err);
    }
    callback(null, `../storage/profile/${req.user?._id}`);
  },
  filename: function(req, file, callback) {
    if(file.originalname.length > 6)
     callback(null, file.fieldname + '-' + Date.now() + file.originalname.substr(file.originalname.length-6,file.originalname.length));
    else
     callback(null, file.fieldname + '-' + Date.now() + file.originalname);
    }
});
  
const upload = multer({ storage: storage })
const router = express.Router();

const { 
  registerUser,
  loginUser, 
  logoutUser, 
  auth,
  listUsers,
  updateUserInfo,
  resetPassword,
  forgetPassword,
  updateUserStatus,
  changePassword,
  updateUserSuspend,
  sendOtpEmail,
  getStateList,
  getCityLists,
  getCountryList,
  getRecentTrades,
  currentuser,
  currentuserprofilephoto,
  getLiveMarketCryptoCoinData,
  forgetPasswordMobile,
  deleteAccountRequest,
 } = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');
const { User } = require('../models/user.model');

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(verifyToken,logoutUser);
router.route('/profilephoto').get(verifyToken,currentuserprofilephoto);
router.route('/auth').post(verifyToken,auth);
router.route('/list').post(verifyToken,listUsers);
router.route('/admin/list').post(verifySecondaryToken,listUsers);
router.route('/forget-password').post(forgetPassword);
router.route('/forget-password-mobile').post(forgetPasswordMobile);
router.route('/reset-password').post(resetPassword);
router.route('/updateuseradmin').patch(verifySecondaryToken,updateUserStatus);
router.route('/updateUserSuspend').patch(verifySecondaryToken,updateUserSuspend);
router.route('/change-password').patch(verifyToken,changePassword);
router.route('/send-email').post(verifyToken,sendOtpEmail);
router.route('/getCountryList').get(verifyToken,getCountryList);
router.route('/getStateList/:id').get(verifyToken,getStateList);
router.route('/getCityList/:id').get(verifyToken,getCityLists);
router.route('/getRecentTrades').get(verifyToken,getRecentTrades);
router.route('/getLiveMarketCryptoData').get(getLiveMarketCryptoCoinData);
router.route('/account-delete-request').post(verifyToken,deleteAccountRequest)
router.route('/get-user-details').get(verifyToken, currentuser);
router.route('/update-profile').patch(verifyToken, upload.fields([
 { name: 'ownerbrd', maxCount: 1},
 { name: 'ownerProfile', maxCount: 1}
]),updateUserInfo);

router.post('/profile', verifyToken, upload.single('avatar'), async function (req, res, next) {
   
  if(req.file === undefined) {
    return res.status(401).json({
      status:401,
      message: "Please upload file / Invalid file selection",
    });
  } else if(req.file.mimetype == "image/jpeg" || req.file.mimetype == "image/png" || req.file.mimetype == "image/jpg") {
       
    await User.findByIdAndUpdate({
     _id:req.user._id
    },
    {
      $set: {
        profileImage: req.file.originalname
      }
    });
    
    return res.status(201).json({
      status:201,
      data: req.file.originalname,
      message: "Profile Image is updated successfully",
    });
   
    } else {
      return res.status(401).json({
        status:401,
        message: "Only support .jpg , .jpeg and .png format",
      });
    }
})

module.exports = router;

