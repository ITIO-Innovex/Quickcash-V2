const { mongoose, Schema } = require('mongoose');

const CONTACT_ROLES = {
  Signer: 'signer',
  Viewer: 'viewer',
  Approver: 'approver'
}

const contactBookSchema = new Schema({
  Role: {
    type: String,
    required: false,
  },
  UserRole: {
    type: String,
    required: false,
    default: CONTACT_ROLES.Signer
  },
  UserId: {
    type: Schema.Types.ObjectId,
    ref: '_User',
    required: false,
  },
  TourStatus: {
    type: [String],
    required: false,
    default: []
  },
  Name: {
    type: String,
    required: false,
  },
  Phone: {
    type: String,
    required: false,
  },
  Email: {
    type: String,
    required: false,
  },
  CreatedBy: {
    type: Schema.Types.ObjectId,
    ref: '_User',
    required: false,
  },
  ExtUserPtr: {
    type: Schema.Types.ObjectId,
    ref: 'contracts_Users',
    required: false,
  },
  IsDeleted: {
    type: Boolean,
    default: false,
  },
  objectId: {
    type: Schema.Types.ObjectId,
  },
}, {
  timestamps: true
});

contactBookSchema.pre('save', function (next) {
  if (!this.objectId) {
    this.objectId = this._id;
  }
  next();
});

const ContactBook = mongoose.model('ContactBook', contactBookSchema);
module.exports = { ContactBook, CONTACT_ROLES };
