
const Admission = require('../models/Admission');
const Student = require('../models/Student');
const Course = require('../models/Course');

const getAllAdmissions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      status,
      counsellor,
      trainingBranch,
      sortBy = 'admissionDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Search filter
    if (search) {
      filter.$or = [
        { admissionNo: { $regex: search, $options: 'i' } },
        { counsellor: { $regex: search, $options: 'i' } },
        { trainingBranch: { $regex: search, $options: 'i' } },
        { appliedBatch: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Counsellor filter
    if (counsellor) {
      filter.counsellor = { $regex: counsellor, $options: 'i' };
    }

    // Training branch filter
    if (trainingBranch) {
      filter.trainingBranch = { $regex: trainingBranch, $options: 'i' };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const admissions = await Admission.find(filter)
      .populate('student', 'studentId name email phone alternateEmail alternatePhone dateOfBirth gender')
      .populate('course', 'name code fee duration')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    // Get total count for pagination
    const total = await Admission.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: admissions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: admissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admissions',
      error: error.message
    });
  }
};

const getAdmissionById = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id)
      .populate('student')
      .populate('course')
      .select('-__v');

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admission',
      error: error.message
    });
  }
};

const getAdmissionByAdmissionNo = async (req, res) => {
  try {
    const admission = await Admission.findOne({ admissionNo: req.params.admissionNo })
      .populate('student')
      .populate('course')
      .select('-__v');

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admission',
      error: error.message
    });
  }
};

const getAdmissionsByStudent = async (req, res) => {
  try {
    const admissions = await Admission.find({ student: req.params.studentId })
      .populate('course', 'name code fee duration')
      .sort({ admissionDate: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: admissions.length,
      data: admissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student admissions',
      error: error.message
    });
  }
};

const getAdmissionsByCourse = async (req, res) => {
  try {
    const admissions = await Admission.find({ course: req.params.courseId })
      .populate('student', 'studentId name email phone')
      .sort({ admissionDate: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: admissions.length,
      data: admissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course admissions',
      error: error.message
    });
  }
};

const createAdmission = async (req, res) => {
  try {
    const {
      student,
      course,
      trainingBranch,
      counsellor,
      admissionFrontPage,
      admissionBackPage,
      studentStatement,
      confidentialForm,
      termsCondition,
      priority,
      appliedBatch,
      source,
      notes
    } = req.body;


    // Check if student exists
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if student already has a pending admission for this course
    const existingAdmission = await Admission.findOne({
      student,
      course,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingAdmission) {
      return res.status(400).json({
        success: false,
        message: 'Student already has an active admission for this course'
      });
    }

    // Generate admission number
    const generateAdmissionNo = async () => {
      const year = new Date().getFullYear();
      const count = await Admission.countDocuments({
        admissionDate: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      });
      return `ADM${year}${(count + 1).toString().padStart(4, '0')}`;
    };

    const admissionNo = await generateAdmissionNo();

    const admissionData = {
      admissionNo, // Add the generated admission number
      student,
      course,
      trainingBranch,
      counsellor: req.user.FullName,
      admissionFrontPage,
      admissionBackPage,
      studentStatement,
      confidentialForm,
      termsCondition: termsCondition || false,
      priority: priority || 'medium',
      appliedBatch,
      source: source || 'website',
      notes
    };

    const admission = new Admission(admissionData);
    const savedAdmission = await admission.save();

    // Populate the saved admission
    await savedAdmission.populate('student', 'studentId name email phone');
    await savedAdmission.populate('course', 'name code fee duration');

    // Remove version key from response
    const admissionResponse = savedAdmission.toObject();
    delete admissionResponse.__v;

    res.status(201).json({
      success: true,
      message: 'Admission created successfully',
      data: admissionResponse
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    // Handle duplicate admission number error
    if (error.code === 11000 && error.keyPattern?.admissionNo) {
      return res.status(400).json({
        success: false,
        message: 'Admission number already exists. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating admission',
      error: error.message
    });
  }
};

const updateAdmission = async (req, res) => {
  try {
    const {
      trainingBranch,
      counsellor=req.user.FullName,
      admissionFrontPage,
      admissionBackPage,
      studentStatement,
      confidentialForm,
      termsCondition,
      status,
      priority,
      appliedBatch,
      source,
      notes
    } = req.body;

    

    // Check if admission exists
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    // Update admission fields
    const updateData = {
      trainingBranch: trainingBranch || admission.trainingBranch,
      counsellor: req.user.FullName,
      admissionFrontPage: admissionFrontPage !== undefined ? admissionFrontPage : admission.admissionFrontPage,
      admissionBackPage: admissionBackPage !== undefined ? admissionBackPage : admission.admissionBackPage,
      studentStatement: studentStatement !== undefined ? studentStatement : admission.studentStatement,
      confidentialForm: confidentialForm !== undefined ? confidentialForm : admission.confidentialForm,
      termsCondition: termsCondition !== undefined ? termsCondition : admission.termsCondition,
      status: status || admission.status,
      priority: priority || admission.priority,
      appliedBatch: appliedBatch !== undefined ? appliedBatch : admission.appliedBatch,
      source: source || admission.source,
      notes: notes !== undefined ? notes : admission.notes
    };

    const updatedAdmission = await Admission.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    )
    .populate('student', 'studentId name email phone')
    .populate('course', 'name code fee duration')
    .select('-__v');

    res.status(200).json({
      success: true,
      message: 'Admission updated successfully',
      data: updatedAdmission
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating admission',
      error: error.message
    });
  }
};

const updateAdmissionStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    // Check if admission exists
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'waiting_list'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, approved, rejected, waiting_list'
      });
    }

    const updateData = {
      status,
      notes: notes !== undefined ? notes : admission.notes
    };

    const updatedAdmission = await Admission.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('student', 'studentId name email phone')
    .populate('course', 'name code fee duration')
    .select('-__v');

    res.status(200).json({
      success: true,
      message: `Admission ${status} successfully`,
      data: updatedAdmission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating admission status',
      error: error.message
    });
  }
};

const deleteAdmission = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    // Check if admission can be deleted (only pending admissions can be deleted)
    if (admission.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending admissions can be deleted'
      });
    }

    await Admission.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Admission deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting admission',
      error: error.message
    });
  }
};

const verifyAdmissionEmail = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    admission.emailVerified = true;
    await admission.save();

    await admission.populate('student', 'studentId name email phone');
    await admission.populate('course', 'name code fee duration');

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: admission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message
    });
  }
};

const getAdmissionStats = async (req, res) => {
  try {
    // Get total counts by status
    const statusStats = await Admission.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get admissions by counsellor
    const counsellorStats = await Admission.aggregate([
      {
        $group: {
          _id: '$counsellor',
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

    // Get admissions by training branch
    const branchStats = await Admission.aggregate([
      {
        $group: {
          _id: '$trainingBranch',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get monthly admission stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Admission.aggregate([
      {
        $match: {
          admissionDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$admissionDate' },
            month: { $month: '$admissionDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get total counts
    const totalAdmissions = await Admission.countDocuments();
    const pendingAdmissions = await Admission.countDocuments({ status: 'pending' });
    const approvedAdmissions = await Admission.countDocuments({ status: 'approved' });

    res.status(200).json({
      success: true,
      data: {
        total: totalAdmissions,
        pending: pendingAdmissions,
        approved: approvedAdmissions,
        statusDistribution: statusStats,
        counsellorPerformance: counsellorStats,
        branchDistribution: branchStats,
        monthlyTrends: monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admission statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllAdmissions,
  getAdmissionById,
  getAdmissionByAdmissionNo,
  getAdmissionsByStudent,
  getAdmissionsByCourse,
  createAdmission,
  updateAdmission,
  updateAdmissionStatus,
  deleteAdmission,
  verifyAdmissionEmail,
  getAdmissionStats
};