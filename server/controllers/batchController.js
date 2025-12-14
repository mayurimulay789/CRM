const Batch = require('../models/Batch');
const Enrollment = require('../models/Enrollment');

// @desc    Create a new batch
// @route   POST /api/batches
// @access  Private (Admin/Counsellor)
const createBatch = async (req, res) => {
  try {
    const batchData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const batch = await Batch.create(batchData);

    res.status(201).json({
      success: true,
      data: batch,
      message: 'Batch created successfully'
    });
  } catch (error) {
    console.error('Create batch error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during batch creation'
    });
  }
};

// @desc    Get all batches
// @route   GET /api/batches
// @access  Private (Admin/Counsellor)
const getBatches = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;

    const batches = await Batch.find(query)
      .populate('createdBy', 'FullName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Compute dynamic enrollment counts per batch (all statuses, not just active)
    const batchIds = batches.map((b) => b._id);
    console.log('🔍 Counting enrollments for batches:', batchIds.map(id => id.toString()));
    
    const enrollmentCounts = await Enrollment.aggregate([
      { $match: { batch: { $in: batchIds } } },
      { $group: { _id: '$batch', count: { $sum: 1 } } },
    ]);

    console.log('📊 Enrollment counts by batch (all statuses):', enrollmentCounts);

    const countMap = enrollmentCounts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const batchesWithCounts = batches.map((b) => {
      const enrolledCount = countMap[b._id.toString()] || 0;
      console.log(`Batch ${b.name} (${b._id}): ${enrolledCount} enrolled students`);
      return {
        ...b,
        enrolledCount,
      };
    });

    const total = await Batch.countDocuments(query);

    res.status(200).json({
      success: true,
        data: batchesWithCounts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBatches: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching batches'
    });
  }
};

// @desc    Get single batch
// @route   GET /api/batches/:id
// @access  Private (Admin/Counsellor)
const getBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('createdBy', 'FullName email');

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    res.status(200).json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Get batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching batch'
    });
  }
};

// @desc    Update batch
// @route   PUT /api/batches/:id
// @access  Private (Admin/Counsellor)
const updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'FullName email');

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    res.status(200).json({
      success: true,
      data: batch,
      message: 'Batch updated successfully'
    });
  } catch (error) {
    console.error('Update batch error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during batch update'
    });
  }
};

// @desc    Delete batch
// @route   DELETE /api/batches/:id
// @access  Private (Admin/Counsellor)
const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Batch deleted successfully'
    });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during batch deletion'
    });
  }
};

// @desc    Get batch statistics
// @route   GET /api/batches/stats
// @access  Private (Admin/Counsellor)
const getBatchStats = async (req, res) => {
  try {
    const stats = await Batch.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalStudents: { $sum: '$studentsActive' }
        }
      }
    ]);

    const totalBatches = await Batch.countDocuments();
    const activeStudents = await Batch.aggregate([
      { $match: { status: 'Running' } },
      { $group: { _id: null, total: { $sum: '$studentsActive' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBatches,
        statusBreakdown: stats,
        activeStudents: activeStudents[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get batch stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching batch statistics'
    });
  }
};

module.exports = {
  createBatch,
  getBatches,
  getBatch,
  updateBatch,
  deleteBatch,
  getBatchStats
};
