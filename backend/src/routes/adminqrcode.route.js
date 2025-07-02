const express = require('express');
const router = express.Router();
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './public/qrcode');
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
  addQrCode,
  qrCodeList, 
  qrCodeById, 
  updateQrCode,
  deleteQrCode,
 } = require('../controllers/qrcode.controller');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');
router.route('/add').post(upload.fields([
  { name: 'qrCodeImage', maxCount: 1}
]), addQrCode);

router.route('/list/:id').get(verifySecondaryToken,qrCodeList);
router.route('/:id').get(verifySecondaryToken,qrCodeById);
router.route('/update/:id').patch(upload.fields([
  { name: 'qrCodeImage', maxCount: 1}
]),verifySecondaryToken,updateQrCode);
router.route('/delete/:id').delete(verifySecondaryToken,deleteQrCode);

module.exports = router;

