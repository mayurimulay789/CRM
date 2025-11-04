const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  admissionNo: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  mobileNo: {
    type: String,
    required: true
  },
  amountReceived: {
    type: Number,
    required: true
  },
  feeType: {
    type: String,
    enum: ['one-time', 'installment'],
    required: true
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'card', 'online', 'cheque'],
    required: true
  },
  paymentBank: String,
  receivedBy: {
    type: String,
    required: true
  },
  admissionBranch: String,
  receivedBranch: {
    type: String,
    required: true
  },
  trainingBranch: {
    type: String,
    required: true
  },
  trainingMode: {
    type: String,
    enum: ['online', 'offline', 'hybrid']
  },
  counsellor: String,
  remarks: String,
  transactionNo: String,
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);