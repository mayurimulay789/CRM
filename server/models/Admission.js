const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  admissionNo: {
    type: String,
    required: true,
    unique: true
  },
  admissionDate: {
    type: Date,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  alternateEmail: String,
  phoneNo: {
    type: String,
    required: true
  },
  alternateNumber: String,
  primaryEmail: String,
  primaryNumber: String,
  course: {
    type: String,
    required: true
  },
  courseFee: {
    type: Number,
    required: true
  },
  trainingBranch: {
    type: String,
    required: true
  },
  counsellor: {
    type: String,
    required: true
  },
  idProofPhoto: String,
  studentPhoto: String,
  studentSignature: String,
  admissionFrontPage: String,
  admissionBackPage: String,
  paymentReceipt: String,
  studentStatement: String,
  termsCondition: Boolean,
  confidentialForm: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'enrolled'],
    default: 'pending'
  },
  operation: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Admission', admissionSchema);




// const mongoose = require('mongoose');

// const admissionSchema = new mongoose.Schema({
//   admissionNo: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   admissionDate: {
//     type: Date,
//     required: true
//   },
//   name: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true
//   },
//   alternateEmail: String,
//   phoneNo: {
//     type: String,
//     required: true
//   },
//   alternateNumber: String,
//   primaryEmail: String,
//   primaryNumber: String,
//   course: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Course',
//     required: true
//   },
//   trainingBranch: {
//     type: String,
//     required: true
//   },
//   counsellor: {
//     type: String,
//     required: true
//   },
//   idProofPhoto: String,
//   studentPhoto: String,
//   studentSignature: String,
//   admissionFrontPage: String,
//   admissionBackPage: String,
//   paymentReceipt: String,
//   studentStatement: String,
//   termsCondition: Boolean,
//   confidentialForm: String,
//   emailVerified: {
//     type: Boolean,
//     default: false
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'approved', 'rejected', 'enrolled'],
//     default: 'pending'
//   },
//   operation: String
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('Admission', admissionSchema);