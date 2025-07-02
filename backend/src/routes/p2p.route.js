const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const p2pController = require('../controllers/p2p.controller');

// ✅ Correct middleware import
const { verifyToken } = require('../middlewares/auth.middleware');

// Create Trade
router.post(
  '/createTrade',
  verifyToken,
  [
    check('coin').not().isEmpty(),
    check('currency').not().isEmpty(),
    check('price').isFloat({ gt: 0 }),
    check('quantity').isFloat({ gt: 0 }),
    check('tradeType').isIn(['buy', 'sell']),
  ],
  p2pController.createTrade
);

// Get All Trades for User
router.get('/myTrades', verifyToken, p2pController.getMyTrades);

// Complete Trade
router.post(
  '/completeTrade',
  verifyToken,
  [check('tradeId').not().isEmpty()],
  p2pController.completeTrade
);

router.get('/search', p2pController.searchTrades);

module.exports = router;
