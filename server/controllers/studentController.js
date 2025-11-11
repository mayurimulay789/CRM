const Student = require('../models/Student');

const getAllStudents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    // Active status filter
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const students = await Student.find(filter)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    // Get total count for pagination
    const total = await Student.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-__v');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message
    });
  }
};

const getStudentByStudentId = async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId }).select('-__v');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message
    });
  }
};

const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      alternateEmail,
      alternatePhone,
      dateOfBirth,
      gender,
      address,
      idProof,
      studentPhoto,
      studentSignature
    } = req.body;

    // Check if student with email already exists
    const existingStudent = await Student.findOne({ 
      $or: [
        { email },
        { phone }
      ]
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email or phone already exists'
      });
    }

    // Generate sequential studentId
    const lastStudent = await Student.findOne().sort({ studentId: -1 });
    let studentId;
    
    if (lastStudent && lastStudent.studentId) {
      const lastNumber = parseInt(lastStudent.studentId.replace('STU', ''));
      studentId = `STU${(lastNumber + 1).toString().padStart(6, '0')}`;
    } else {
      studentId = 'STU000001';
    }

    const studentData = {
      studentId,
      name,
      email,
      phone,
      alternateEmail,
      alternatePhone,
      dateOfBirth,
      gender,
      address,
      idProof,
      studentPhoto,
      studentSignature
    };

    const student = new Student(studentData);
    const savedStudent = await student.save();

    // Remove version key from response
    const studentResponse = savedStudent.toObject();
    delete studentResponse.__v;

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: studentResponse
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

    // Handle duplicate key error (if studentId generation fails)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Student ID already exists. Please try again.',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating student',
      error: error.message
    });
  }
};

const updateStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      alternateEmail,
      alternatePhone,
      dateOfBirth,
      gender,
      address,
      idProof,
      studentPhoto,
      studentSignature,
      isActive
    } = req.body;

    // Check if student exists
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if email or phone is being changed and conflicts with existing student
    if (email && email !== student.email) {
      const existingStudent = await Student.findOne({ 
        email,
        _id: { $ne: req.params.id }
      });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Student with this email already exists'
        });
      }
    }

    if (phone && phone !== student.phone) {
      const existingStudent = await Student.findOne({ 
        phone,
        _id: { $ne: req.params.id }
      });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Student with this phone already exists'
        });
      }
    }

    // Update student fields
    const updateData = {
      name: name || student.name,
      email: email || student.email,
      phone: phone || student.phone,
      alternateEmail: alternateEmail !== undefined ? alternateEmail : student.alternateEmail,
      alternatePhone: alternatePhone !== undefined ? alternatePhone : student.alternatePhone,
      dateOfBirth: dateOfBirth || student.dateOfBirth,
      gender: gender || student.gender,
      address: address || student.address,
      idProof: idProof || student.idProof,
      studentPhoto: studentPhoto !== undefined ? studentPhoto : student.studentPhoto,
      studentSignature: studentSignature !== undefined ? studentSignature : student.studentSignature,
      isActive: isActive !== undefined ? isActive : student.isActive
    };

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-__v');

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
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
      message: 'Error updating student',
      error: error.message
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if student has any admissions (you might want to add this check)
    // const admissionCount = await Admission.countDocuments({ student: req.params.id });
    // if (admissionCount > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Cannot delete student. Student has admissions records.'
    //   });
    // }

    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message
    });
  }
};

const toggleStudentStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    student.isActive = !student.isActive;
    await student.save();

    res.status(200).json({
      success: true,
      message: `Student ${student.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: student._id,
        studentId: student.studentId,
        name: student.name,
        isActive: student.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling student status',
      error: error.message
    });
  }
};

// @desc    Get student statistics
// @route   GET /api/students/stats/summary
// @access  Private
const getStudentStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ isActive: true });
    const inactiveStudents = await Student.countDocuments({ isActive: false });

    // Get students by gender
    const genderStats = await Student.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly student registration stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Student.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalStudents,
        active: activeStudents,
        inactive: inactiveStudents,
        genderDistribution: genderStats,
        monthlyRegistrations: monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  getStudentByStudentId,
  createStudent,
  updateStudent,
  deleteStudent,
  toggleStudentStatus,
  getStudentStats
};