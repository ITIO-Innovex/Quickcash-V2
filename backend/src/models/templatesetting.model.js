const { mongoose,Schema} = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const templateSettingSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  invoice_country: {
    type: String,
    required: false,
    default: 'default'
  },
  color: {
    type: String,
    default: 'black'
  },
  templateContent: {
    type: String,
    required: false,
    default:'',
  },
},
{
  timestamps: true
});

templateSettingSchema.plugin(mongoosePaginate);
const TemplateSetting = mongoose.model("TemplateSetting", templateSettingSchema);
module.exports = { TemplateSetting };