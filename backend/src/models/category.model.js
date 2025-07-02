const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

// Invoice Category model Schema

const categorySchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  name: {
    type: String,
    required: false,
    default: null
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

categorySchema.plugin(mongoosePaginate);
const Category = mongoose.model("Category", categorySchema);
module.exports = { Category };