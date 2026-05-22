const mongoose = require("mongoose");

const ScanSchema = new mongoose.Schema({
  text: String,
  result: Object,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Scan", ScanSchema);