const P2POrder = require('../models/p2pOrder.model');

const createOrder = async (data) => await P2POrder.create(data);
const getAllActiveOrders = async () => await P2POrder.find({ isActive: true }).populate('user', 'name email');
const getUserOrders = async (userId) => await P2POrder.find({ user: userId });
const updateOrder = async (orderId, userId, update) => await P2POrder.findOneAndUpdate({ _id: orderId, user: userId }, update, { new: true });
const deleteOrder = async (orderId, userId) => await P2POrder.findOneAndDelete({ _id: orderId, user: userId });

module.exports = { createOrder, getAllActiveOrders, getUserOrders, updateOrder, deleteOrder };
