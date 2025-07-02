const express = require('express');
const router = express.Router();
var multer = require('multer');
const fs = require('fs');
var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    const folderName = `public/setting/${req.body.user}`;
    try {
     if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
     }
    } catch (err) {
      console.error("error",err);
    }
    callback(null, `./public/setting/${req.body.user}`);
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
  getDetailsById,
  addInvoiceSetting,
  updateInvoiceSetting,
 } = require('../controllers/invoicesetting.controller');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');

router.route('/add').post(upload.fields([{ name: 'logo', maxCount: 1}]), verifySecondaryToken, addInvoiceSetting);
router.route('/update/:id').patch(upload.fields([{ name: 'logo', maxCount: 1}]), verifySecondaryToken, updateInvoiceSetting);
router.route('/list/:id').get(verifySecondaryToken,list);
router.route('/:id').get(verifySecondaryToken,getDetailsById);

module.exports = router;

