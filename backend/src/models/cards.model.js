const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  cardNumber: {
    type: String,
    required: true,
    unique: true,
  },
  cvv: {
    type: String,
    required: true,
  },
  pin: {
    type: Number,
    required: true,
  },
  expiry: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  Account: {
    type: String,
    required: false,
  },
  currency: {
    type: String,
    required: false,
  },
  cardType: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: false,
  },
  paymentType: {
    type: String,
    required: false,
  },
  iban: {
    type: String,
    required: false,
  },
  dailyLimit: {
    type: Number,
    default: 0.00,
  },
  monthlyLimit: {
    type: Number,
    default: 0.00,
  },
  isFrozen: {
    type: Boolean,
    default: false,
  }
});

const Card = mongoose.model('Card', cardSchema);

module.exports = { Card };
