const p2pService = require('../service/p2pservice');

exports.createTrade = async (req, res) => {
  try {
    const trade = await p2pService.createTrade({
      ...req.body,
      buyer: req.user.id // from auth middleware
    });
    res.json({ success: true, trade });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyTrades = async (req, res) => {
  try {
    const trades = await p2pService.getUserTrades(req.user.id);
    res.json({ success: true, trades });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.completeTrade = async (req, res) => {
  try {
    const trade = await p2pService.completeTrade(req.body.tradeId, req.user.id);
    res.json({ success: true, trade });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.searchTrades = async (req, res) => {
  try {
    const { coin, currency, tradeType } = req.query;
    const trades = await p2pService.searchPublicTrades({ coin, currency, tradeType });
    res.json({ success: true, trades });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
