const service = require('../service/p2pOrder.service');

exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = { ...req.body, user: userId };
    const order = await service.createOrder(data);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const orders = await service.getAllActiveOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMine = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await service.getUserOrders(userId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const order = await service.updateOrder(req.params.id, req.user.id, req.body);
    if (!order) return res.status(404).json({ message: 'Order not found or not authorized' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const order = await service.deleteOrder(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ message: 'Order not found or not authorized' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
