const mongoose = require('mongoose');

const emiSchema = new mongoose.Schema({
  amount: Number,
  pending: Number,
  date: Date
});

const enrolledStudentSchema = new mongoose.Schema({
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
  mobile: {
    type: String,
    required: true
  },
  alternateEmail: String,
  alternateMobile: String,
  primaryEmail: String,
  primaryMobile: String,
  course: {
    type: String,
    required: true
  },
  courseFee: {
    type: Number,
    required: true
  },
  batch: String,
  trainingBranch: {
    type: String,
    required: true
  },
  totalAmount: Number,
  amountReceived: {
    type: Number,
    default: 0
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  actualAmount: Number,
  pendingAmount: Number,
  charges: Number,
  upcomingEMIAmount: Number,
  feeType: {
    type: String,
    enum: ['one-time', 'installment'],
    default: 'one-time'
  },
  counsellor: String,
  firstEMI: emiSchema,
  secondEMI: emiSchema,
  thirdEMI: emiSchema,
  dueDate: Date,
  lastTransactionNo: String,
  lastPaidAmount: Number,
  lastPaidDate: Date,
  lastPaidMode: String,
  lastPaidStatus: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'pending'
  },
  lastAmountReceivedBy: String,
  leadDate: Date,
  leadSource: String,
  call: String,
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'suspended'],
    default: 'active'
  },
  mode: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EnrolledStudent', enrolledStudentSchema);