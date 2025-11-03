const mongoose = require("mongoose");

const onlineDemoSchema = new mongoose.Schema({
  course: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  mode: { type: String, required: true },
  medium: { type: String, required: true },
  trainer: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("OnlineDemo", onlineDemoSchema);
