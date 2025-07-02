const express = require('express');
const router  = express.Router();
const { 
  addSetting,
  settingData,
} = require('../../controllers/Admin/paymentsetting.controller');

const { verifyToken } = require('../../middlewares/admin.middleware');

router.route('/add').post(verifyToken,addSetting);
router.route('/list').get(verifyToken,settingData);

module.exports = router;

