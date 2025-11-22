const mongoose = require('mongoose');

const emiSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  pending: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'partial'],
    default: 'pending'
  }
});

const studentActivitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['fee_delay', 'course_change', 'status_update', 'note', 'call', 'payment_recorded', 'payment_approved', 'payment_rejected'],
    required: true
  },
  description: String,
  date: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  paymentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }
});

const enrollmentSchema = new mongoose.Schema({
  enrollmentNo: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  admission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admission',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  enrollmentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  trainingBranch: {
    type: String,
    required: true,
    trim: true
  },
  mode: {
    type: String,
    enum: ['Online', 'Offline', 'Hybrid'],
    default: 'Offline'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'dropout', 'notattending', 'completed', 'cancelled', 'on_hold'],
    default: 'active'
  },
  
  // Fee Details - CLEANED VERSION (actualAmount removed)
  totalAmount: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  amountReceived: {
    type: Number,
    default: 0
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  pendingAmount: {
    type: Number,
    default: function() {
      return (this.totalAmount - this.discount) - this.amountReceived;
    }
  },
  charges: {
    type: Number,
    default: 0
  },
  upcomingEMIAmount: {
    type: Number,
    default: 0
  },
  
  // Fee Structure
  feeType: {
    type: String,
    enum: ['one-time', 'installment'],
    default: 'one-time'
  },
  firstEMI: emiSchema,
  secondEMI: emiSchema,
  thirdEMI: emiSchema,
  dueDate: Date,
  
  // Last Payment Details (Updated only when payment is approved)
  lastTransactionNo: String,
  lastPaidAmount: Number,
  lastPaidDate: Date,
  lastPaidMode: {
    type: String,
    enum: ['cash', 'card', 'online', 'cheque', 'bank_transfer']
  },
  lastAmountReceivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Lead Information
  leadDate: Date,
  leadSource: {
    type: String,
    enum: ['website', 'walkin', 'referral', 'counsellor', 'social_media', 'other'],
    default: 'website'
  },
  call: String,
  counsellor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Student Activity Tracking
  operations: [studentActivitySchema]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
enrollmentSchema.index({ enrollmentNo: 1 });
enrollmentSchema.index({ student: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ batch: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ trainingBranch: 1 });
enrollmentSchema.index({ counsellor: 1 });
enrollmentSchema.index({ enrollmentDate: -1 });
enrollmentSchema.index({ dueDate: 1 });

// Virtual for fee delay status
enrollmentSchema.virtual('hasFeeDelay').get(function() {
  if (this.dueDate && new Date() > this.dueDate && this.pendingAmount > 0) {
    return true;
  }
  return false;
});

// Virtual for next EMI
enrollmentSchema.virtual('nextEMI').get(function() {
  const today = new Date();
  const emis = [this.firstEMI, this.secondEMI, this.thirdEMI].filter(emi => 
    emi && emi.date && emi.pending > 0 && emi.date >= today
  ).sort((a, b) => a.date - b.date);
  
  return emis.length > 0 ? emis[0] : null;
});

// Virtual for approved payments total
enrollmentSchema.virtual('approvedPayments', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'enrollment',
  match: { verificationStatus: 'approved' }
});

// Pre-save middleware to generate enrollment number
enrollmentSchema.pre('save', async function(next) {
  if (this.isNew && !this.enrollmentNo) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Enrollment').countDocuments({
      enrollmentDate: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.enrollmentNo = `ENR${year}${(count + 1).toString().padStart(4, '0')}`;
  }
  
  // Update pending amount based on approved payments
  if (this.isModified('totalAmount') || this.isModified('discount') || this.isModified('amountReceived')) {
    this.pendingAmount = (this.totalAmount - this.discount) - this.amountReceived;
  }
  
  // Update upcoming EMI amount
  const nextEMI = this.nextEMI;
  this.upcomingEMIAmount = nextEMI ? nextEMI.amount : 0;
  
  next();
});

// Instance method to add student activity
enrollmentSchema.methods.addActivity = function(type, description, createdBy, paymentRef = null) {
  this.operations.push({
    type,
    description,
    createdBy,
    paymentRef,
    date: new Date()
  });
  return this.save();
};

// Instance method to update enrollment after payment approval
enrollmentSchema.methods.updateAfterPaymentApproval = async function(payment) {
  // Update amount received
  this.amountReceived += payment.amountReceived;
  this.pendingAmount = (this.totalAmount - this.discount) - this.amountReceived;
  
  // Update last payment details
  this.lastTransactionNo = payment.transactionNo || payment.paymentNo;
  this.lastPaidAmount = payment.amountReceived;
  this.lastPaidDate = payment.date;
  this.lastPaidMode = payment.paymentMode;
  this.lastAmountReceivedBy = payment.receivedBy;
  
  // Update EMI status if applicable
  if (this.feeType === 'installment' && payment.emiNumber) {
    const emiField = `${payment.emiNumber}EMI`;
    const emi = this[emiField];
    
    if (emi) {
      emi.pending -= payment.amountReceived;
      emi.status = emi.pending === 0 ? 'paid' : 'partial';
    }
  }
  
  await this.save();
  await this.addActivity(
    'payment_approved', 
    `Payment of ₹${payment.amountReceived} approved for ${payment.feeType}`,
    payment.verifiedBy,
    payment._id
  );
  
  return this;
};

// Static method to find enrollments by status
enrollmentSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('student', 'studentId name email phone')
    .populate('course', 'name fee duration')
    .populate('batch', 'name timing')
    .populate('counsellor', 'name email')
    .sort({ enrollmentDate: -1 });
};

// Static method to find enrollments with fee delays
enrollmentSchema.statics.findWithFeeDelay = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    pendingAmount: { $gt: 0 }
  })
  .populate('student', 'studentId name email phone')
  .populate('course', 'name')
  .populate('counsellor', 'name email')
  .sort({ dueDate: 1 });
};

// Static method to get enrollment statistics
enrollmentSchema.statics.getStatistics = async function(branch = null) {
  const matchStage = branch ? { trainingBranch: branch } : {};
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'enrollment',
        as: 'payments'
      }
    },
    {
      $addFields: {
        approvedPayments: {
          $filter: {
            input: '$payments',
            as: 'payment',
            cond: { $eq: ['$$payment.verificationStatus', 'approved'] }
          }
        }
      }
    },
    {
      $addFields: {
        totalApprovedAmount: { $sum: '$approvedPayments.amountReceived' }
      }
    },
    {
      $group: {
        _id: null,
        totalEnrollments: { $sum: 1 },
        totalRevenue: { $sum: '$totalApprovedAmount' },
        totalPending: { $sum: { $subtract: ['$totalAmount', '$totalApprovedAmount'] } },
        activeEnrollments: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        completedEnrollments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    }
  ]);
  
  const statusStats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const counsellorStats = await this.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'enrollment',
        as: 'payments'
      }
    },
    {
      $unwind: '$payments'
    },
    {
      $match: {
        'payments.verificationStatus': 'approved'
      }
    },
    {
      $group: {
        _id: '$counsellor',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$payments.amountReceived' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  return {
    ...(stats[0] || {
      totalEnrollments: 0,
      totalRevenue: 0,
      totalPending: 0,
      activeEnrollments: 0,
      completedEnrollments: 0
    }),
    statusDistribution: statusStats,
    topCounsellors: counsellorStats
  };
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);