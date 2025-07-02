const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const coinSchema = new mongoose.Schema(
  {
    coin: {
      type: String,
      required: false,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    network: {
      type: String,
      default: "",
    },
    withdrawFee: {
      type: Number, 
      default: 0,
    },
    withdrawMinimum: {
      type: Number,
      default: 0,
    },
    withdrawMaximum: {
      type: Number, 
      default: 0,
    },
    type: {
      type: String, 
      default: "",
    },
    logo: {
      type: String, 
      default: "",
    },
    logoName: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    time_last_update_words: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

coinSchema.plugin(mongoosePaginate);
const Coin = mongoose.model("Coin", coinSchema);
module.exports = { Coin };