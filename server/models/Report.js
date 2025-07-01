const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, required: true },
  message: { type: String, required: true },
  reportedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", reportSchema);