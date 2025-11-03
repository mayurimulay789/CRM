// server/src/models/OneToOneDemo.js
const mongoose = require("mongoose");

const oneToOneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  timing: { type: String, required: true },
  email: { type: String },
  mobile: { type: String },
  trainer: { type: String },
  counselor: { type: String },
  counselorRemark: { type: String },
  trainerReply: { type: String },
  addRemark: { type: String },
  status: { type: String },
  reason: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("OneToOneDemo", oneToOneSchema);
