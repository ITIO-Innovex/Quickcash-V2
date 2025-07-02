const { Schema, mongoose } = require("mongoose");

const swapSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  fromCoin: {
    type: String,
    required: true
  },
  toCoin: {
    type: String,
    required: true
  },
  coinsDeducted: {
    type: Number,
    required: true
  },
  coinsAdded: {
    type: Number,
    required: true
  },
  conversionRate: {
    type: Number,
    required: true
  },
  convertedAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: "completed"
  }
}, { timestamps: true });

const Swap = mongoose.model("Swap", swapSchema);
module.exports = { Swap };
