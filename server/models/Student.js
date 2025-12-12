const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  alternateEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  alternatePhone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  idProof: {
    type: {
      type: String,
      enum: ['aadhaar', 'passport', 'driving_license', 'voter_id', 'pan_card']
    },
    number: String,
    photo: String
  },
  studentPhoto: String,
  studentSignature: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
studentSchema.index({ email: 1 });
studentSchema.index({ phone: 1 });
studentSchema.index({ isActive: 1 });
studentSchema.index({ 'address.city': 1 });
studentSchema.index({ createdAt: -1 });

// Virtual for student's age
studentSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for formatted date of birth
studentSchema.virtual('formattedDateOfBirth').get(function() {
  if (!this.dateOfBirth) return null;
  return this.dateOfBirth.toLocaleDateString('en-IN');
});

// Pre-save middleware to generate student ID (REMOVE THIS if generating in controller)
// studentSchema.pre('save', async function(next) {
//   if (this.isNew && !this.studentId) {
//     const count = await mongoose.model('Student').countDocuments();
//     this.studentId = `STU${(count + 1).toString().padStart(6, '0')}`;
//   }
//   next();
// });

// Instance method to get student summary
studentSchema.methods.getSummary = function() {
  return {
    studentId: this.studentId,
    name: this.name,
    email: this.email,
    phone: this.phone,
    isActive: this.isActive,
    age: this.age
  };
};

// Instance method to get complete student profile
studentSchema.methods.getProfile = function() {
  return {
    studentId: this.studentId,
    name: this.name,
    email: this.email,
    phone: this.phone,
    alternateEmail: this.alternateEmail,
    alternatePhone: this.alternatePhone,
    dateOfBirth: this.dateOfBirth,
    formattedDateOfBirth: this.formattedDateOfBirth,
    age: this.age,
    gender: this.gender,
    address: this.address,
    idProof: this.idProof,
    studentPhoto: this.studentPhoto,
    studentSignature: this.studentSignature,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to find active students
studentSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Static method to find students by city
studentSchema.statics.findByCity = function(city) {
  return this.find({ 'address.city': new RegExp(city, 'i') });
};

// Static method to get student statistics
studentSchema.statics.getStatistics = async function() {
  const total = await this.countDocuments();
  const active = await this.countDocuments({ isActive: true });
  const inactive = await this.countDocuments({ isActive: false });
  
  const genderStats = await this.aggregate([
    {
      $group: {
        _id: '$gender',
        count: { $sum: 1 }
      }
    }
  ]);

  const cityStats = await this.aggregate([
    {
      $group: {
        _id: '$address.city',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);

  return {
    total,
    active,
    inactive,
    genderDistribution: genderStats,
    topCities: cityStats
  };
};

// Middleware to update timestamps on update
studentSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model('Student', studentSchema);