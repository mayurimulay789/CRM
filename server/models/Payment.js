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

<<<<<<< HEAD
module.exports = mongoose.model('Payment', paymentSchema);
=======
module.exports = mongoose.model('Payment', paymentSchema);







// const mongoose = require('mongoose');

// const paymentSchema = new mongoose.Schema({
//   paymentNo: {
//     type: String,
//     required: true,
//     unique: true,
//     index: true
//   },
//   enrollment: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Enrollment',
//     required: true
//   },
//   student: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Student',
//     required: true
//   },
//   course: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Course',
//     required: true
//   },
//   date: {
//     type: Date,
//     required: true,
//     default: Date.now
//   },
//   amount: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   taxAmount: {
//     type: Number,
//     default: 0,
//     min: 0
//   },
//   totalAmount: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   paymentType: {
//     type: String,
//     enum: ['registration', 'tuition', 'exam', 'certificate', 'other'],
//     required: true
//   },
//   feeType: {
//     type: String,
//     enum: ['one-time', 'installment'],
//     required: true
//   },
//   installmentNumber: {
//     type: Number,
//     required: function() {
//       return this.feeType === 'installment';
//     }
//   },
//   totalInstallments: Number,
//   paymentMode: {
//     type: String,
//     enum: ['cash', 'card', 'online', 'cheque', 'upi', 'bank-transfer'],
//     required: true
//   },
//   paymentDetails: {
//     cardLastFour: String,
//     cardType: String,
//     transactionId: String,
//     gateway: String,
//     gatewayReference: String,
//     chequeNumber: String,
//     chequeDate: Date,
//     bankName: String,
//     upiId: String,
//     upiReference: String,
//     referenceNumber: String,
//     accountNumber: String
//   },
//   receivedBy: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   receivedBranch: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   counsellor: String,
//   status: {
//     type: String,
//     enum: ['pending', 'success', 'failed', 'refunded', 'cancelled'],
//     default: 'pending'
//   },
//   statusHistory: [{
//     status: String,
//     changedAt: {
//       type: Date,
//       default: Date.now
//     },
//     changedBy: String,
//     notes: String
//   }],
//   reconciled: {
//     type: Boolean,
//     default: false
//   },
//   reconciledBy: String,
//   reconciledAt: Date,
//   refund: {
//     refunded: {
//       type: Boolean,
//       default: false
//     },
//     refundAmount: {
//       type: Number,
//       default: 0,
//       min: 0
//     },
//     refundDate: Date,
//     refundReason: String,
//     refundProcessedBy: String
//   },
//   remarks: String,
//   supportingDocuments: [{
//     documentType: String,
//     documentUrl: String,
//     uploadedAt: {
//       type: Date,
//       default: Date.now
//     }
//   }],
//   createdBy: {
//     type: String,
//     required: true
//   },
//   updatedBy: String
// }, {
//   timestamps: true
// });

// // Indexes
// paymentSchema.index({ enrollment: 1 });
// paymentSchema.index({ student: 1 });
// paymentSchema.index({ course: 1 });
// paymentSchema.index({ date: 1 });
// paymentSchema.index({ status: 1 });
// paymentSchema.index({ paymentMode: 1 });
// paymentSchema.index({ receivedBranch: 1 });

// // Pre-save middleware
// paymentSchema.pre('save', async function(next) {
//   // Generate payment number
//   if (this.isNew && !this.paymentNo) {
//     const year = new Date().getFullYear();
//     const count = await mongoose.model('Payment').countDocuments({
//       date: {
//         $gte: new Date(year, 0, 1),
//         $lt: new Date(year + 1, 0, 1)
//       }
//     });
//     this.paymentNo = `PAY${year}${(count + 1).toString().padStart(4, '0')}`;
//   }

//   // Initialize status history
//   if (this.isNew) {
//     this.statusHistory = [{
//       status: this.status,
//       changedAt: new Date(),
//       changedBy: this.createdBy,
//       notes: 'Payment created'
//     }];
//   }

//   // Calculate total amount
//   if (this.isModified('amount') || this.isModified('taxAmount')) {
//     this.totalAmount = this.amount + this.taxAmount;
//   }

//   next();
// });

// // Instance method to update status
// paymentSchema.methods.updateStatus = function(newStatus, changedBy, notes = '') {
//   this.status = newStatus;
//   this.statusHistory.push({
//     status: newStatus,
//     changedAt: new Date(),
//     changedBy: changedBy,
//     notes: notes
//   });
// };

// // Virtuals
// paymentSchema.virtual('formattedDate').get(function() {
//   return this.date.toLocaleDateString('en-IN');
// });

// paymentSchema.virtual('statusColor').get(function() {
//   const statusColors = {
//     pending: 'orange',
//     success: 'green',
//     failed: 'red',
//     refunded: 'blue',
//     cancelled: 'gray'
//   };
//   return statusColors[this.status] || 'gray';
// });

// // Static method to get payments by enrollment
// paymentSchema.statics.getByEnrollment = function(enrollmentId) {
//   return this.find({ enrollment: enrollmentId })
//     .populate('student', 'studentId name')
//     .populate('course', 'name code')
//     .sort({ date: -1 });
// };

// // Static method to get payment summary by student
// paymentSchema.statics.getStudentSummary = async function(studentId) {
//   const result = await this.aggregate([
//     {
//       $match: {
//         student: new mongoose.Types.ObjectId(studentId),
//         status: 'success'
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         totalPaid: { $sum: '$amount' },
//         totalTransactions: { $sum: 1 }
//       }
//     }
//   ]);
  
//   return result.length > 0 ? result[0] : { totalPaid: 0, totalTransactions: 0 };
// };

// module.exports = mongoose.model('Payment', paymentSchema);
>>>>>>> 796f7396510349a3599e146e7987a6e0c9dcc0ef
