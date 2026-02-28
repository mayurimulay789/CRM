const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  FullName: {
    type: String,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  phone: {
    type: String,        // Changed from Number to String
    unique: true,
    sparse: true,         // Allows multiple null/undefined values
  },
  education: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['Counsellor', 'admin'],
    default: 'Counsellor',
  },
  otp: {
    type: String,
    select: false,
  },
  otpExpiry: {
    type: Date,
    select: false,
  },
}, {
  timestamps: true,
});

// Hash password before saving – always assign plain password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate a 6-digit OTP, hash it, set expiry (10 minutes)
 * @returns {string} Plain OTP (to be sent via email)
 */
userSchema.methods.generateOtp = async function () {   // made async
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(otp, salt);
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return otp;
};

/**
 * Verify a plain OTP against the stored hash and check expiry
 * @param {string} enteredOtp - Plain OTP entered by user
 * @returns {boolean} True if valid and not expired
 */
userSchema.methods.verifyOtp = async function (enteredOtp) {
  if (!this.otp || !this.otpExpiry) return false;
  if (Date.now() > this.otpExpiry) return false;
  return await bcrypt.compare(enteredOtp, this.otp);
};

module.exports = mongoose.model('User', userSchema);