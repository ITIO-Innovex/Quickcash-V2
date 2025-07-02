const express = require('express');
const router = express.Router();

const { 
  addSession,
  updateUserStatus, 
  getSessionById, 
} = require('../controllers/usersession.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { verifySecondaryToken } = require('../middlewares/admin.middleware');

router.route('/add').post(addSession);
router.route('/update').patch(updateUserStatus);
router.route('/getsession/:id').get(getSessionById);
router.route('/getusersession/:id').get(getSessionById);
module.exports = router;

