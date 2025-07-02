const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { authenticate } = require('../middleware/auth');


router.get('/users/:id', userController.getUserById);  
// router.get('/user/:email', userController.getUserDetails);
router.get('/user/id/:identifier', userController.getUserId);

router.get('/user/details', authenticate, userController.getUserDetails)

module.exports = router;
