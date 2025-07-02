const express = require('express');
const router = express.Router();
var multer = require('multer');

var storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './public/notifications');
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
  updateRead,
  detailsById,
  adminUpdateRead,
  addNotification
 } = require('../controllers/notification.controller');
 
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');
const { getAdminNotifications ,getAllAdminNotification, getUserUnreadNotifications ,getAdminUnreadNotifications,getAllUserNotification } = require('../middlewares/notification.middleware');

router.route('/add').post(verifySecondaryToken,upload.fields([
  { name: 'attachment', maxCount: 1}
]),addNotification);
router.route('/list/:id').get(verifySecondaryToken,list);
router.route('/admingetData/:id').get(verifySecondaryToken,detailsById);
router.route('/user/:id').get(verifyToken,detailsById);
router.route('/all').get(verifySecondaryToken,getAdminNotifications);
router.route('/admin-unread').get(verifySecondaryToken,getAdminUnreadNotifications);
router.route('/unread').get(verifyToken,getUserUnreadNotifications);
router.route('/update-unread').patch(verifyToken,updateRead);
router.route('/admin-update-unread').patch(verifySecondaryToken,adminUpdateRead);
router.route('/user-all').get(verifyToken,getAllUserNotification);
router.route('/admin-all').get(verifySecondaryToken,getAllAdminNotification);
// router.route('/update/:id').patch(verifyToken,upload.fields([
//   { name: 'documentPhotoFront', maxCount: 1},
//   { name: 'documentPhotoBack', maxCount: 1},
//   { name: 'addressProofPhoto', maxCount: 1},
// ]),updateKycData);
// router.route('/list').get(verifySecondaryToken,list);
// router.route('/updateStatus/:id').patch(verifySecondaryToken,updatekycRequestStatus);
// router.route('/history/:id').get(verifySecondaryToken,updateHistory);
// router.route('/verify/:id').patch(verifyToken,verify);

module.exports = router;

