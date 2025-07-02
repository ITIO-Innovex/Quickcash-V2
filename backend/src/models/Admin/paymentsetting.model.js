const { mongoose } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const paymentSettingSchema = new mongoose.Schema({
  stripe_key: {
    type: String,
    required: false,
    default: ''
  },
  stripe_secret: {
    type: String,
    required: false,
    default: ''
  },
  stripe_status: {
    type: Boolean,
    default: false
  },
  paypal_client_id: {
    type: String,
    required: false,
    default: ''
  },
  paypal_secret: {
    type: String,
    required: false,
    default: ''
  },
  paypal_status: {
    type: Boolean,
    default: false
  },
  razor_key: {
    type: String,
    required: false,
    default: ''
  },
  razor_secret: {
    type: String,
    required: false,
    default: ''
  },
  razor_status: {
    type: Boolean,
    default: false
  },
  itio_store_id: {
    type: String,
    required: false,
    default: ''
  },
  itio_api_key: {
    type: String,
    required: false,
    default: ''
  },
  itio_status: {
    type: Boolean,
    default: false
  },
},
{
  timestamps: true
});

paymentSettingSchema.plugin(mongoosePaginate);
const PaymentSetting = mongoose.model("PaymentSetting", paymentSettingSchema);
module.exports = { PaymentSetting };