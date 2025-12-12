// const mongoose = require("mongoose");

// const LiveClassSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   date: { type: Date, required: true },
//   timing: { type: String, required: true },
//   email: { type: String },
//   mobile: { type: String },
//   trainer: { type: String },
//   counselor: { type: String },
//   counselorRemark: { type: String },
//   trainerReply: { type: String },
//   addRemark: { type: String },
//   status: { type: String },
//   reason: { type: String },
// });

// module.exports = mongoose.model("LiveClass", LiveClassSchema);

const mongoose = require("mongoose");

const LiveClassSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("LiveClass", LiveClassSchema);