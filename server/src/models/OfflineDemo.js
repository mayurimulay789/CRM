const mongoose = require("mongoose");

const offlineDemoSchema = new mongoose.Schema({
  course: { type: String, required: true },
  branch: { type: String, required: true }, // 🆕 Added branch field
  date: { type: Date, required: true },
  time: { type: String, required: true },
  mode: { type: String, required: true },
  medium: { type: String, required: true },
  trainer: { type: String, required: true },
});

module.exports = mongoose.model("OfflineDemo", offlineDemoSchema);
