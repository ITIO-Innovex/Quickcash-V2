const express = require('express');
const router = express.Router();
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, callback) {
      callback(null, './public/company');
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
    addCompany,
    companyList, 
    companyById, 
    updateCompany,
    deleteCompany,
 } = require('../controllers/usercompany.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
router.route('/add').post(upload.fields([
  { name: 'businessRegistrationDocument', maxCount: 1},
  { name: 'proofoftradingAddress', maxCount: 1},
  { name: 'taxID', maxCount: 1},
]), addCompany);

router.route('/list/:id').get(verifyToken,companyList);
router.route('/:id').get(verifyToken,companyById);
router.route('/update/:id').patch(upload.fields([
  { name: 'businessRegistrationDocument', maxCount: 1},
  { name: 'proofoftradingAddress', maxCount: 1},
  { name: 'taxID', maxCount: 1},
]),verifyToken,updateCompany);
router.route('/delete/:id').delete(verifyToken,deleteCompany);

module.exports = router;

