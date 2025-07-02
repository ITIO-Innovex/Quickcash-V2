const express = require('express');
const router = express.Router();

var multer = require('multer');
var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './public');
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
  addSupport,
  list, 
  updateSupportStatus,
  updateRequestStatus,
  updateHistory,
  listbyId,
  replyTicket
 } = require('../controllers/support.controller');

const { verifyToken } = require('../middlewares/auth.middleware');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');
const { randomId } = require('../middlewares/common.middleware');

router.route('/add').post(verifyToken,randomId,addSupport);
router.route('/list/:id').get(verifyToken,list);
router.route('/listbyid/:id').get(verifyToken,listbyId);

router.route('/adminlist/:id').get(verifySecondaryToken,listbyId);
router.route('/update').patch(verifySecondaryToken,updateSupportStatus);

router.route('/update-Status/:id').patch(verifyToken,updateRequestStatus);

router.route('/replyticket').post(verifyToken,upload.fields([
  { name: 'attachment', maxCount: 1}
]),replyTicket);

router.route('/admin-replyticket').post(verifySecondaryToken,upload.fields([
  { name: 'attachment', maxCount: 1}
]),replyTicket);

router.route('/updateStatus/:id').patch(verifySecondaryToken,updateRequestStatus);
router.route('/history/:id').get(verifySecondaryToken,updateHistory);

module.exports = router;

