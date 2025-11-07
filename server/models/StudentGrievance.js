// const mongoose = require('mongoose');

// const studentGrievanceSchema = new mongoose.Schema({
//   studentName: { type: String, required: true },
//   studentEmail: { type: String, required: true },
//   complaint: { type: String, required: true },
//   title: { type: String, default: '' },
//   status: {
//     type: String,
//     enum: ['pending', 'submittedToAdmin', 'approved', 'rejected'],
//     default: 'pending'
//   },
//   adminResponse: { type: String, default: '' }, // response from admin
//   counsellorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// }, { timestamps: true });

// module.exports = mongoose.model('StudentGrievance', studentGrievanceSchema);


const mongoose = require('mongoose');

const studentGrievanceSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  title: { type: String, default: '' },
  complaint: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'submittedToAdmin', 'approved', 'rejected'],
    default: 'pending'
  },
  adminResponse: { type: String, default: '' },      // Admin suggestion/reason
  counsellorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }  // Optional: set when admin acts
}, { timestamps: true });

module.exports = mongoose.model('StudentGrievance', studentGrievanceSchema);
