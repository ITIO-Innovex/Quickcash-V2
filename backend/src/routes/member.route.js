const express = require('express');
const router = express.Router();

const { 
  registerMember,
  validateMember, 
  loginMember,
  membersList,
  updateMember,
  membersDetailsById,
  deleteMember,
  memberLoginList,
  adminmembersList,
  members
} = require('../controllers/member.controller');

const { verifyToken } = require('../middlewares/auth.middleware');
const {verifySecondaryToken } = require('../middlewares/admin.middleware');

router.route('/register').post(verifyToken,registerMember);
router.route('/validate').post(validateMember);
router.route('/login').post(loginMember);
router.route('/list/:id').get(verifyToken,membersList);
router.route('/members/:id').get(verifyToken,members);
router.route('/adminlist/:id').get(verifySecondaryToken,adminmembersList);
router.route('/update').patch(verifyToken,updateMember);
router.route('/details/:id').get(verifyToken,membersDetailsById);
router.route('/delete/:id').delete(verifyToken,deleteMember);
router.route('/view/:id').get(verifyToken,memberLoginList);

module.exports = router;

