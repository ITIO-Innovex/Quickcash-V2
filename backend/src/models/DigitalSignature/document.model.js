const { mongoose, Schema } = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["AIDoc", "Regular"],
      default: "Regular",
    },
    name: {
      type: String,
      required: true,
    },
    note: String,
    url: String,
    description: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    expiryDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },

    signedUrl: {
      type: String,
    },

    isEnableOTP: {
      type: Boolean,
      default: false,
    },

    Signers: { type: Array },

    AuditTrail: [
      {
        SignedUrl: {
          type: String,
        },
        Activity: {
          type: String,
          enum: ["Signed", "Viewed", "Downloaded"],
        },
        ipAddress: {
          type: String,
        },
        SignedOn: {
          type: Date,
          default: Date.now,
        },
        Signature: {
          type: String,
        },
        UserDetails: {
          type: mongoose.Schema.Types.Mixed,
        },
        UserPtr: {
          type: mongoose.Schema.Types.Mixed,
        },
      },
    ],

    isCompleted: {
      type: Boolean,
      default: false
    },

    signature: {
      type: String,
    },

    CertificateUrl: String,

    SignatureType: { type: [Schema.Types.Mixed] },
    Placeholders: { type: [Schema.Types.Mixed] },

    SentToOthers: {
      type: Boolean,
      default: false
    },

    ExpiryDate: { type: Schema.Types.Mixed },
    SignedUrl: { type: String },

    SendMail: {
      type: Boolean,
      default: false
    },

    SendinOrder: {
      type: Boolean,
      default: false
    },

    IsDeclined: Boolean,

    DeclineReason: {
      type: String,
      default: ''
    },

    DeclineBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    Viewers: [
      {
        signerId: {
          type: mongoose.Schema.Types.ObjectId,
          required: false
        },
        viewedAt: {
          type: Date,
          default: null
        }
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Document", documentSchema);
