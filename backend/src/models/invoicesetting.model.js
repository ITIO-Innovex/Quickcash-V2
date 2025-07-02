const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const invoiceSettingSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  invoice_country: {
    type: String,
    required: false,
    default: 'default'
  },
  company_name: {
    type: String,
    default: ''
  },
  mobile: {
    type: Number,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  zipcode: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  prefix: {
    type: String,
    default: ''
  },
  regardstext: {
    type: String,
    default: ''
  }
},
{
  timestamps: true
});

invoiceSettingSchema.plugin(mongoosePaginate);
const InvoiceSetting = mongoose.model("InvoiceSetting", invoiceSettingSchema);
module.exports = { InvoiceSetting };