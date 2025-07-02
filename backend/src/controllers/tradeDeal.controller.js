const TradeDeal = require('../models/tradeDeal.model');
const P2POrder = require('../models/p2pOrder.model');

exports.createTrade = async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    const userId = req.user.id;

    const order = await P2POrder.findById(orderId).populate('user');
    if (!order || !order.isActive) return res.status(400).json({ message: 'Order unavailable' });

    const price = order.price;
    const totalPrice = amount * price;

    // Determine buyer/seller based on order type
    const buyer = order.type === 'SELL' ? userId : order.user._id;
    const seller = order.type === 'SELL' ? order.user._id : userId;

    const deal = await TradeDeal.create({
      order: orderId,
      buyer,
      seller,
      amount,
      totalPrice
    });

    res.status(201).json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserTrades = async (req, res) => {
  try {
    const userId = req.user.id;
    const trades = await TradeDeal.find({
      $or: [{ buyer: userId }, { seller: userId }]
    }).populate('order buyer seller');
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTradeStatus = async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const trade = await TradeDeal.findById(tradeId);
    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    if (![trade.buyer.toString(), trade.seller.toString()].includes(userId))
      return res.status(403).json({ message: 'Not authorized' });

    trade.status = status;
    await trade.save();

    res.json(trade);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
