const Trainer = require('../models/Trainer');

// @desc    Create a new trainer
// @route   POST /api/trainers
// @access  Private (Admin/Counsellor)
const createTrainer = async (req, res) => {
  try {
    const trainerData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const trainer = await Trainer.create(trainerData);

    res.status(201).json({
      success: true,
      data: trainer,
      message: 'Trainer created successfully'
    });
  } catch (error) {
    console.error('Create trainer error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during trainer creation'
    });
  }
};

// @desc    Get all trainers
// @route   GET /api/trainers
// @access  Private (Admin/Counsellor)
const getTrainers = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;

    const trainers = await Trainer.find(query)
      .populate('createdBy', 'FullName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Trainer.countDocuments(query);

    res.status(200).json({
      success: true,
      data: trainers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTrainers: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get trainers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trainers'
    });
  }
};

// @desc    Get single trainer
// @route   GET /api/trainers/:id
// @access  Private (Admin/Counsellor)
const getTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate('createdBy', 'FullName email');

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: trainer
    });
  } catch (error) {
    console.error('Get trainer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trainer'
    });
  }
};

// @desc    Update trainer
// @route   PUT /api/trainers/:id
// @access  Private (Admin/Counsellor)
const updateTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'FullName email');

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: trainer,
      message: 'Trainer updated successfully'
    });
  } catch (error) {
    console.error('Update trainer error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during trainer update'
    });
  }
};

// @desc    Delete trainer
// @route   DELETE /api/trainers/:id
// @access  Private (Admin/Counsellor)
const deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Trainer deleted successfully'
    });
  } catch (error) {
    console.error('Delete trainer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during trainer deletion'
    });
  }
};

module.exports = {
  createTrainer,
  getTrainers,
  getTrainer,
  updateTrainer,
  deleteTrainer
};
