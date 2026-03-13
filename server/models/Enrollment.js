const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
  installmentNumber: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
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
  admissionRegistrationPayment: {
    type: Number,
    default: 0,
    description: 'Payment made at the time of admission registration.'
  },
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
  mode: {
    type: String,
    enum: ['Online', 'Offline', 'Hybrid'],
    default: 'Offline'
  },
  // Enrollment approval status
  enrollmentStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // Student status
  status: {
    type: String,
    enum: ['active', 'inactive', 'dropout', 'notattending', 'completed', 'cancelled', 'on_hold'],
    default: 'active'
  },
  
  // Fee Details - NO AUTO CALCULATION
  totalAmount: {
    type: Number,
    required: true
  },
  
  amountReceived: {
    type: Number,
    default: 0
  },
  
  courseAmount: {
    type: Number,
    default: 0,
    description: 'Base course amount before any calculation (same as totalAmount)'
  },
  
  refundAmount: {
    type: Number,
    default: 0
  },
  
  pendingAmount: {
    type: Number,
    default: 0  // Just default 0, no function
  },
  
  discount: {
    type: Number,
    default: 0
  },
  
  // Fee Structure
  feeType: {
    type: String,
    enum: ['one-time', 'installment'],
    default: 'one-time'
  },
  
  dueDate: {
    type: Date,
    default: null
  },
  
  // Installment Array
  installments: [installmentSchema],
  
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
enrollmentSchema.index({ enrollmentStatus: 1 });
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

// Virtual for approved payments total
enrollmentSchema.virtual('approvedPayments', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'enrollment',
  match: { verificationStatus: 'approved' }
});

// Pre-save middleware - ONLY generates enrollment number, NO calculations
enrollmentSchema.pre('save', async function(next) {
  // Only generate enrollment number for new documents
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
  
  // ❌ ALL CALCULATIONS REMOVED - Values must be set explicitly in controllers
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

// Helper method to calculate actual total (kept for reference if needed)
enrollmentSchema.methods.calculateActualTotal = function() {
  const baseAmount = this.totalAmount || 0;
  const registrationFees = this.admissionRegistrationPayment || 0;
  return baseAmount - registrationFees;
};

// Method to calculate total installment amount
enrollmentSchema.methods.calculateTotalInstallmentAmount = function() {
  if (!this.installments || this.installments.length === 0) return 0;
  return this.installments.reduce((total, inst) => total + (inst.amount || 0), 0);
};

// Method to validate installments total matches expected amount
enrollmentSchema.methods.validateInstallmentsTotal = function() {
  if (this.feeType !== 'installment') return true;
  
  const totalInstallmentAmount = this.calculateTotalInstallmentAmount();
  const expectedTotal = (this.totalAmount || 0) - (this.admissionRegistrationPayment || 0);
  
  return Math.abs(totalInstallmentAmount - expectedTotal) < 0.01;
};

// Method to add an installment
enrollmentSchema.methods.addInstallment = function(installmentData) {
  const nextNumber = this.installments.length + 1;
  this.installments.push({
    installmentNumber: nextNumber,
    amount: installmentData.amount,
    dueDate: installmentData.dueDate
  });
  return this.save();
};

// Method to remove an installment
enrollmentSchema.methods.removeInstallment = function(installmentId) {
  const installment = this.installments.id(installmentId);
  if (!installment) return this;
  
  // Check if any payment exists for this installment number
  const hasPayments = false; // You can implement payment check logic here
  
  if (!hasPayments) {
    installment.deleteOne();
    // Re-number remaining installments
    this.installments.forEach((inst, index) => {
      inst.installmentNumber = index + 1;
    });
  }
  return this.save();
};

// ❌ REMOVED updateAfterPaymentApproval method - now handled in payment controller

// Static method to find enrollments by enrollmentStatus
enrollmentSchema.statics.findByEnrollmentStatus = function(enrollmentStatus) {
  return this.find({ enrollmentStatus })
    .populate('student', 'studentId name email phone')
    .populate('course', 'name fee duration')
    .populate('batch', 'name timing')
    .populate('counsellor', 'name email')
    .sort({ enrollmentDate: -1 });
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
        pendingEnrollments: {
          $sum: { $cond: [{ $eq: ['$enrollmentStatus', 'pending'] }, 1, 0] }
        },
        approvedEnrollments: {
          $sum: { $cond: [{ $eq: ['$enrollmentStatus', 'approved'] }, 1, 0] }
        },
        rejectedEnrollments: {
          $sum: { $cond: [{ $eq: ['$enrollmentStatus', 'rejected'] }, 1, 0] }
        },
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

  const enrollmentStatusStats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$enrollmentStatus',
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
      pendingEnrollments: 0,
      approvedEnrollments: 0,
      rejectedEnrollments: 0,
      activeEnrollments: 0,
      completedEnrollments: 0
    }),
    statusDistribution: statusStats,
    enrollmentStatusDistribution: enrollmentStatusStats,
    topCounsellors: counsellorStats
  };
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);