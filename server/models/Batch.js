const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Batch name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Running', 'Closed', 'Cancelled'],
    default: 'Upcoming',
  },
  branch: {
    type: String,
    trim: true,
  },
  trainer: {
    type: String,
    trim: true,
  },
  classRoom: {
    type: Number,
    min: 0,
  },
  code: {
    type: String,
    trim: true,
  },
  completionDate: {
    type: Date,
  },
  timing: {
    type: String,
    trim: true,
  },
  course: {
    type: String,
    trim: true,
  },
  studentsActive: {
    type: Number,
    default: 0,
    min: 0,
  },
  batchType: {
    type: String,
    trim: true,
  },
  mode: {
    type: String,
    enum: ['Online', 'Offline', 'Hybrid'],
    trim: true,
  },
  country: {
    type: String,
    trim: true,
  },
  mergingStatus: {
    type: String,
    trim: true,
  },
  mergingTill: {
    type: Date,
  },

  batchExtenApproval: {
    type: String,
    trim: true,
  },
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Index for better query performance
batchSchema.index({ status: 1, createdAt: -1 });
batchSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Batch', batchSchema);
