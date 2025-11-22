const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentNo: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  
  // Payment Details
  amountReceived: {
    type: Number,
    required: true,
    min: 0
  },
  feeType: {
    type: String,
    enum: ['registration', 'tuition', 'exam', 'other'],
    required: true
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'card', 'online', 'cheque', 'bank_transfer', 'upi'],
    required: true
  },
  paymentBank: String,
  transactionNo: String,
  
  // EMI Tracking - NEW FIELD
  emiNumber: {
    type: String,
    enum: ['first', 'second', 'third', null],
    default: null
  },
  
  // Branch Information
  admissionBranch: String,
  receivedBranch: {
    type: String,
    required: true
  },
  trainingBranch: {
    type: String,
  },
  trainingMode: {
    type: String,
    enum: ['Online', 'Offline', 'Hybrid']
  },
  
  // Personnel - Counsellor who recorded the payment
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  counsellor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Admin Approval Workflow - REQUIRED FOR EVERY PAYMENT
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    required: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  verificationNotes: String,
  
  // Payment evidence for verification
  paymentProof: String, // File path or URL to receipt image
  chequeDetails: {
    chequeNo: String,
    bankName: String,
    chequeDate: Date
  },
  
  remarks: String,

}, {
  timestamps: true
});


// Indexes for better query performance
paymentSchema.index({ paymentNo: 1 });
paymentSchema.index({ enrollment: 1 });
paymentSchema.index({ student: 1 });
paymentSchema.index({ date: -1 });
paymentSchema.index({ receivedBy: 1 });
paymentSchema.index({ counsellor: 1 });
paymentSchema.index({ trainingBranch: 1 });
paymentSchema.index({ verificationStatus: 1 });
paymentSchema.index({ paymentMode: 1 });
paymentSchema.index({ verifiedBy: 1 });

// FIXED: Pre-save middleware to generate payment number and set required fields
paymentSchema.pre('save', async function(next) {
  try {
    // Only run for new documents
    if (this.isNew) {
      // Generate payment number
      const year = new Date().getFullYear();
      const count = await mongoose.model('Payment').countDocuments({
        date: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      });
      this.paymentNo = `PAY${year}${(count + 1).toString().padStart(4, '0')}`;

      // Set branch information from enrollment
      if (this.enrollment) {
        const enrollment = await mongoose.model('Enrollment').findById(this.enrollment)
          .populate('student')
          .populate('counsellor');
        
        if (enrollment) {
          // Set all required fields from enrollment
          this.trainingBranch = enrollment.trainingBranch;
          this.trainingMode = enrollment.mode;
          this.admissionBranch = enrollment.trainingBranch;
          this.receivedBranch = this.receivedBranch || enrollment.trainingBranch;
          
          if (enrollment.student) {
            this.student = enrollment.student._id;
          }
          
          if (enrollment.counsellor) {
            this.counsellor = enrollment.counsellor._id;
          }
        } else {
          throw new Error('Enrollment not found');
        }
      }

      // Ensure receivedBy is set (from auth middleware)
      if (!this.receivedBy && this.counsellor) {
        this.receivedBy = this.counsellor;
      }
    }
    
    next();
  } catch (error) {
    console.error('Payment pre-save middleware error:', error);
    next(error);
  }
});

// Post-save middleware to add activity when payment is recorded
paymentSchema.post('save', async function() {
  if (this.isNew) {
    try {
      const enrollment = await mongoose.model('Enrollment').findById(this.enrollment);
      if (enrollment) {
        await enrollment.addActivity(
          'payment_recorded',
          `Payment of ₹${this.amountReceived} recorded for ${this.feeType} - Awaiting approval`,
          this.receivedBy,
          this._id
        );
      }
    } catch (error) {
      console.error('Error adding payment recorded activity:', error);
    }
  }
});

// Instance method for admin to approve payment
paymentSchema.methods.approvePayment = async function(adminId, notes = '') {
  if (this.verificationStatus === 'approved') {
    throw new Error('Payment is already approved');
  }
  
  this.verificationStatus = 'approved';
  this.verifiedBy = adminId;
  this.verifiedAt = new Date();
  this.verificationNotes = notes;
  
  await this.save();
  
  // Update enrollment with approved payment
  const enrollment = await mongoose.model('Enrollment').findById(this.enrollment);
  if (enrollment) {
    await enrollment.updateAfterPaymentApproval(this);
  }
  
  return this;
};

// Instance method for admin to reject payment
paymentSchema.methods.rejectPayment = async function(adminId, notes = '') {
  if (this.verificationStatus === 'rejected') {
    throw new Error('Payment is already rejected');
  }
  
  this.verificationStatus = 'rejected';
  this.verifiedBy = adminId;
  this.verifiedAt = new Date();
  this.verificationNotes = notes;
  
  await this.save();
  
  // Add rejection activity to enrollment
  const enrollment = await mongoose.model('Enrollment').findById(this.enrollment);
  if (enrollment) {
    await enrollment.addActivity(
      'payment_rejected',
      `Payment of ₹${this.amountReceived} rejected: ${notes}`,
      adminId,
      this._id
    );
  }
  
  return this;
};

// Instance method to get payment details
paymentSchema.methods.getDetails = async function() {
  await this.populate([
    { path: 'enrollment', select: 'enrollmentNo courseName' },
    { path: 'student', select: 'studentId name email phone' },
    { path: 'receivedBy', select: 'name email' },
    { path: 'counsellor', select: 'name email' },
    { path: 'verifiedBy', select: 'name email' }
  ]);
  
  return {
    paymentNo: this.paymentNo,
    date: this.date,
    amountReceived: this.amountReceived,
    feeType: this.feeType,
    paymentMode: this.paymentMode,
    paymentBank: this.paymentBank,
    transactionNo: this.transactionNo,
    student: this.student,
    enrollment: this.enrollment,
    receivedBy: this.receivedBy,
    counsellor: this.counsellor,
    verificationStatus: this.verificationStatus,
    verifiedBy: this.verifiedBy,
    verifiedAt: this.verifiedAt,
    verificationNotes: this.verificationNotes,
    trainingBranch: this.trainingBranch,
    trainingMode: this.trainingMode,
    admissionBranch: this.admissionBranch,
    receivedBranch: this.receivedBranch,
    remarks: this.remarks,
    paymentProof: this.paymentProof,
    chequeDetails: this.chequeDetails
  };
};

// Static method to find payments by verification status
paymentSchema.statics.findByVerificationStatus = function(status) {
  return this.find({ verificationStatus: status })
    .populate('enrollment', 'enrollmentNo courseName')
    .populate('student', 'studentId name email phone')
    .populate('receivedBy', 'name email')
    .populate('counsellor', 'name email')
    .populate('verifiedBy', 'name email')
    .sort({ date: -1 });
};

// Static method to find payments needing approval
paymentSchema.statics.findPendingApprovals = function() {
  return this.find({ verificationStatus: 'pending' })
    .populate('enrollment', 'enrollmentNo courseName totalAmount amountReceived')
    .populate('student', 'studentId name email phone')
    .populate('receivedBy', 'name email')
    .populate('counsellor', 'name email')
    .sort({ date: 1 });
};

// Static method to find payments by date range
paymentSchema.statics.findByDateRange = function(startDate, endDate, status = null) {
  const query = {
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  if (status) {
    query.verificationStatus = status;
  }
  
  return this.find(query)
    .populate('enrollment', 'enrollmentNo courseName')
    .populate('student', 'studentId name email phone')
    .populate('receivedBy', 'name email')
    .populate('counsellor', 'name email')
    .populate('verifiedBy', 'name email')
    .sort({ date: -1 });
};

// Static method to get payment statistics (only approved payments count)
paymentSchema.statics.getStatistics = async function(startDate, endDate) {
  const matchStage = {
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    verificationStatus: 'approved' // Only count approved payments
  };
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amountReceived' },
        totalTransactions: { $sum: 1 },
        averagePayment: { $avg: '$amountReceived' }
      }
    }
  ]);
  
  const modeStats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$paymentMode',
        totalAmount: { $sum: '$amountReceived' },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
  
  const statusStats = await this.aggregate([
    { 
      $match: {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$verificationStatus',
        totalAmount: { $sum: '$amountReceived' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  const branchStats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$trainingBranch',
        totalAmount: { $sum: '$amountReceived' },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  const counsellorStats = await this.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'users',
        localField: 'counsellor',
        foreignField: '_id',
        as: 'counsellorInfo'
      }
    },
    {
      $unwind: '$counsellorInfo'
    },
    {
      $group: {
        _id: '$counsellor',
        counsellorName: { $first: '$counsellorInfo.name' },
        totalAmount: { $sum: '$amountReceived' },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
  
  return {
    ...(stats[0] || {
      totalAmount: 0,
      totalTransactions: 0,
      averagePayment: 0
    }),
    paymentModeDistribution: modeStats,
    verificationStatusDistribution: statusStats,
    branchWiseCollection: branchStats,
    counsellorPerformance: counsellorStats
  };
};

// Static method to get payment by payment number
paymentSchema.statics.findByPaymentNo = function(paymentNo) {
  return this.findOne({ paymentNo })
    .populate('enrollment', 'enrollmentNo courseName totalAmount')
    .populate('student', 'studentId name email phone')
    .populate('receivedBy', 'name email phone')
    .populate('counsellor', 'name email phone')
    .populate('verifiedBy', 'name email');
};

// Static method to get payments by student
paymentSchema.statics.findByStudent = function(studentId, status = null) {
  const query = { student: studentId };
  
  if (status) {
    query.verificationStatus = status;
  }
  
  return this.find(query)
    .populate('enrollment', 'enrollmentNo courseName')
    .populate('receivedBy', 'name email')
    .populate('verifiedBy', 'name email')
    .sort({ date: -1 });
};

// Static method to get payments by enrollment
paymentSchema.statics.findByEnrollment = function(enrollmentId, status = null) {
  const query = { enrollment: enrollmentId };
  
  if (status) {
    query.verificationStatus = status;
  }
  
  return this.find(query)
    .populate('receivedBy', 'name email')
    .populate('verifiedBy', 'name email')
    .sort({ date: -1 });
};

module.exports = mongoose.model('Payment', paymentSchema);