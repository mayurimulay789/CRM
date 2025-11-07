const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  admissionNo: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  admissionDate: {
    type: Date,
    required: true,
    default: Date.now
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
  trainingBranch: {
    type: String,
    required: true,
    trim: true
  },
  counsellor: {
    type: String,
    required: true,
    trim: true
  },
  admissionFrontPage: String,
  admissionBackPage: String,
  studentStatement: String,
  confidentialForm: String,
  termsCondition: {
    type: Boolean,
    default: false,
    validate: {
      validator: function(v) {
        return v === true;
      },
      message: 'Terms and conditions must be accepted'
    }
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'waiting_list'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  notes: String,
  appliedBatch: String,
  source: {
    type: String,
    enum: ['website', 'walkin', 'referral', 'counsellor', 'social_media'],
    default: 'website'
  }
}, {
  timestamps: true
});

// Indexes
admissionSchema.index({ student: 1 });
admissionSchema.index({ course: 1 });
admissionSchema.index({ status: 1 });
admissionSchema.index({ admissionDate: 1 });
admissionSchema.index({ counsellor: 1 });

// Pre-save middleware to generate admission number
admissionSchema.pre('save', async function(next) {
  if (this.isNew && !this.admissionNo) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Admission').countDocuments({
      admissionDate: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.admissionNo = `ADM${year}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Instance method to get admission details
admissionSchema.methods.getDetails = async function() {
  await this.populate('student');
  await this.populate('course');
  
  return {
    admissionNo: this.admissionNo,
    admissionDate: this.admissionDate,
    student: this.student.getSummary(),
    course: this.course.getOverview(),
    status: this.status,
    trainingBranch: this.trainingBranch,
    counsellor: this.counsellor
  };
};

// Static method to get admissions by status
admissionSchema.statics.getByStatus = function(status) {
  return this.find({ status })
    .populate('student', 'studentId name email phone')
    .populate('course', 'name code fee duration')
    .sort({ admissionDate: -1 });
};

module.exports = mongoose.model('Admission', admissionSchema);