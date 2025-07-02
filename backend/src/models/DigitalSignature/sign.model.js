const mongoose = require("mongoose");

const SignSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
  base64: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Sign", SignSchema);
