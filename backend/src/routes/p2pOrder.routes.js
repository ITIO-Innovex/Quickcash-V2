const express = require('express');
const router = express.Router();
const controller = require('../controllers/p2pOrder.controller');
const { verifyToken } = require('../middlewares/auth.middleware'); // your auth middleware

router.post('/', verifyToken, controller.create);
router.get('/', controller.getAll);
router.get('/my', verifyToken, controller.getMine);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.remove);

module.exports = router;
