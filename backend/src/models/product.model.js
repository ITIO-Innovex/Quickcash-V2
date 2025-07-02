const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

// Invoice Product model Schema

const productSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  name: {
    type: String,
    required: false,
    default: null
  },
  productCode: {
    type: String,
    required: true,
    default: ''
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category"
  },
  unitPrice: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    required: false,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: Boolean,
    required: false,
    default: true
  }
},
{
  timestamps: true
});

productSchema.plugin(mongoosePaginate);
const Product = mongoose.model("Product", productSchema);
module.exports = { Product };