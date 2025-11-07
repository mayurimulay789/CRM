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
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  paidDate: Date,
  transactionId: String
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
    required: true,
    unique: true
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
    name: String,
    startDate: Date,
    endDate: Date,
    timing: String,
    branch: {
      type: String,
      required: true
    }
  },
  feeStructure: {
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    feeType: {
      type: String,
      enum: ['one-time', 'installment'],
      default: 'one-time'
    },
    installments: [installmentSchema]
  },
  payment: {
    totalPaid: {
      type: Number,
      default: 0,
      min: 0
    },
    pendingAmount: {
      type: Number,
      min: 0
    }
  },
  academicStatus: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'suspended', 'transferred'],
    default: 'active'
  },
  attendance: {
    totalClasses: {
      type: Number,
      default: 0
    },
    attendedClasses: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  performance: {
    grade: String,
    marks: Number,
    remarks: String
  },
  certificates: [{
    name: String,
    issueDate: Date,
    certificateUrl: String
  }],
  counsellor: String,
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  completionDate: Date,
  notes: String
}, {
  timestamps: true
});

// Indexes
enrollmentSchema.index({ student: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ admission: 1 });
enrollmentSchema.index({ academicStatus: 1 });
enrollmentSchema.index({ 'batch.branch': 1 });

// Pre-save middleware for calculations
enrollmentSchema.pre('save', function(next) {
  // Calculate pending amount
  this.payment.pendingAmount = this.feeStructure.finalAmount - this.payment.totalPaid;
  
  // Calculate attendance percentage
  if (this.attendance.totalClasses > 0) {
    this.attendance.percentage = (this.attendance.attendedClasses / this.attendance.totalClasses) * 100;
  }
  
  // Update installment statuses
  if (this.feeStructure.installments) {
    this.feeStructure.installments.forEach(installment => {
      if (installment.paidAmount >= installment.amount) {
        installment.status = 'paid';
      } else if (new Date() > installment.dueDate && installment.status === 'pending') {
        installment.status = 'overdue';
      }
    });
  }
  
  next();
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
  next();
});

// Instance method to get enrollment summary
enrollmentSchema.methods.getSummary = async function() {
  await this.populate('student');
  await this.populate('course');
  await this.populate('admission');
  
  return {
    enrollmentNo: this.enrollmentNo,
    student: this.student.getSummary(),
    course: this.course.getOverview(),
    batch: this.batch,
    academicStatus: this.academicStatus,
    feeStructure: this.feeStructure,
    payment: this.payment
  };
};

// Static method to get active enrollments
enrollmentSchema.statics.getActiveEnrollments = function() {
  return this.find({ academicStatus: 'active' })
    .populate('student', 'studentId name email phone')
    .populate('course', 'name code duration')
    .sort({ enrollmentDate: -1 });
};

// Method to add payment to enrollment
enrollmentSchema.methods.addPayment = async function(amount, installmentNumber = null) {
  this.payment.totalPaid += amount;
  
  if (installmentNumber !== null && this.feeStructure.installments) {
    const installment = this.feeStructure.installments.find(
      inst => inst.installmentNumber === installmentNumber
    );
    if (installment) {
      installment.paidAmount += amount;
    }
  }
  
  await this.save();
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);