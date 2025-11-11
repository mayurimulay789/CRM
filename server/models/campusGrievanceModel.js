// const mongoose = require("mongoose");

// const campusGrievanceSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     complaint: { type: String, required: true },
//     status: {
//       type: String,
//       enum: ["submitted", "approved", "rejected"],
//       default: "submitted",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("CampusGrievance", campusGrievanceSchema);



const mongoose = require("mongoose");

const campusGrievanceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    complaint: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["submittedToAdmin", "approved", "rejected"],
      default: "submittedToAdmin",
    },
    adminResponse: { type: String, trim: true },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CampusGrievance", campusGrievanceSchema);
