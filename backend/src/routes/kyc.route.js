const express = require('express');
const router = express.Router();
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './public/kyc');
    },
    filename: function(req, file, callback) {
      if(file.originalname.length > 6)
       callback(null, file.fieldname + '-' + Date.now() + file.originalname.substr(file.originalname.length-6,file.originalname.length));
      else
       callback(null, file.fieldname + '-' + Date.now() + file.originalname);
    }
});

const upload = multer({ storage: storage });

const {
  list, 
  addKyc,
  verify,
  getkycData, 
  updateHistory,
  updateKycData,
  getAdminkycData,
  updatekycRequestStatus,
  getKycStatus,
 } = require('../controllers/kyc.controller');
 
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');

router.route('/add').post(verifyToken,upload.fields([
  { name: 'documentPhotoFront', maxCount: 1},
  { name: 'documentPhotoBack', maxCount: 1},
  { name: 'addressProofPhoto', maxCount: 1},
]),addKyc);
router.route('/getData/:id').get(verifyToken,getkycData);
router.route('/admingetData/:id').get(verifySecondaryToken,getAdminkycData);
router.route('/update/:id').patch(verifyToken,upload.fields([
  { name: 'documentPhotoFront', maxCount: 1},
  { name: 'documentPhotoBack', maxCount: 1},
  { name: 'addressProofPhoto', maxCount: 1},
]),updateKycData);
router.route('/list').get(verifySecondaryToken,list);
router.route('/updateStatus/:id').patch(verifySecondaryToken,updatekycRequestStatus);
router.route('/history/:id').get(verifySecondaryToken,updateHistory);
router.route('/verify/:id').patch(verifyToken,verify);
router.route("/status").get( verifyToken, getKycStatus);
module.exports = router;

