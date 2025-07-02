const express = require('express');
const router = express.Router();

var multer = require('multer');
var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, `./public/client`);
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
  addClient,
  clientList, 
  clientById, 
  updateClient,
  deleteClient,
  getInvoiceNumbertoClient
 } = require('../controllers/client.controller');

const { verifyToken } = require('../middlewares/auth.middleware');

router.route('/add').post(verifyToken,upload.fields([
  { name: 'profilePhoto', maxCount: 1},
]),addClient);
router.route('/list/:id').get(verifyToken,clientList);
router.route('/:id').get(verifyToken,clientById);
router.route('/numberofinvoice/:id').get(verifyToken,getInvoiceNumbertoClient);
router.route('/update/:id').patch(verifyToken,upload.fields([
  { name: 'profilePhoto', maxCount: 1},
]),updateClient);
router.route('/delete/:id').delete(verifyToken,deleteClient);

module.exports = router;

