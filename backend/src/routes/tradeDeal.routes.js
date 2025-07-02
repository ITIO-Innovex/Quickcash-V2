const express = require('express');
const router = express.Router();
const controller = require('./../controllers/tradeDeal.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, controller.createTrade);
router.get('/my', verifyToken, controller.getUserTrades);
router.patch('/:tradeId/status', verifyToken, controller.updateTradeStatus);

module.exports = router;
