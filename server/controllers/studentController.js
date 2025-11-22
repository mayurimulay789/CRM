const Student = require('../models/Student');
const Admission = require('../models/Admission');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

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

    console.log('response',students);

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
    console.log('=== CREATE STUDENT STARTED ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');

    const {
      name,
      email,
      phone,
      alternateEmail,
      alternatePhone,
      dateOfBirth,
      gender,
      address,
      idProof
    } = req.body;

    // Check if student with email already exists
    const existingStudent = await Student.findOne({ 
      $or: [
        { email },
        { phone }
      ]
    });

    if (existingStudent) {
      console.log('❌ Student already exists with email/phone:', email, phone);
      return res.status(400).json({
        success: false,
        message: 'Student with this email or phone already exists'
      });
    }

    // Handle file uploads to Cloudinary from buffer
    let studentPhotoUrl = '';
    let studentSignatureUrl = '';
    let idProofPhotoUrl = '';

    if (req.files) {
      try {
        console.log('=== FILE UPLOAD PROCESS STARTED ===');
        
        if (req.files.studentPhoto && req.files.studentPhoto[0]) {
          const file = req.files.studentPhoto[0];
          console.log('📸 Uploading student photo:', {
            originalname: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            bufferLength: file.buffer.length
          });
          
          studentPhotoUrl = await uploadToCloudinary(file.buffer, 'lms/students/photos');
          console.log('✅ Student photo uploaded. URL:', studentPhotoUrl);
        } else {
          console.log('📸 No student photo provided');
        }

        if (req.files.studentSignature && req.files.studentSignature[0]) {
          const file = req.files.studentSignature[0];
          console.log('✍️ Uploading student signature:', {
            originalname: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            bufferLength: file.buffer.length
          });
          
          studentSignatureUrl = await uploadToCloudinary(file.buffer, 'lms/students/signatures');
          console.log('✅ Student signature uploaded. URL:', studentSignatureUrl);
        } else {
          console.log('✍️ No student signature provided');
        }

        if (req.files.idProofPhoto && req.files.idProofPhoto[0]) {
          const file = req.files.idProofPhoto[0];
          console.log('📄 Uploading ID proof photo:', {
            originalname: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            bufferLength: file.buffer.length
          });
          
          idProofPhotoUrl = await uploadToCloudinary(file.buffer, 'lms/students/idproofs');
          console.log('✅ ID proof photo uploaded. URL:', idProofPhotoUrl);
        } else {
          console.log('📄 No ID proof photo provided');
        }
        
        console.log('=== FILE UPLOAD PROCESS COMPLETED ===');
      } catch (uploadError) {
        console.error('❌ File upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: `File upload failed: ${uploadError.message}`
        });
      }
    } else {
      console.log('📁 No files in request');
    }

    // Parse idProof if it's a string (from form-data)
    let idProofData = idProof;
    if (typeof idProof === 'string') {
      try {
        console.log('🔄 Parsing idProof string:', idProof);
        idProofData = JSON.parse(idProof);
        console.log('✅ idProof parsed successfully:', idProofData);
      } catch (error) {
        console.log('❌ Failed to parse idProof, using empty object');
        idProofData = {};
      }
    }

    // Generate sequential studentId
    const lastStudent = await Student.findOne().sort({ studentId: -1 });
    let studentId;
    
    if (lastStudent && lastStudent.studentId) {
      const lastNumber = parseInt(lastStudent.studentId.replace('STU', ''));
      studentId = `STU${(lastNumber + 1).toString().padStart(6, '0')}`;
      console.log('🎫 Generated studentId from last student:', studentId);
    } else {
      studentId = 'STU000001';
      console.log('🎫 Generated first studentId:', studentId);
    }

    // Prepare student data
    const studentData = {
      studentId,
      name,
      email,
      phone,
      alternateEmail: alternateEmail || undefined,
      alternatePhone: alternatePhone || undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      address: address || {},
      idProof: {
        ...idProofData,
        photo: idProofPhotoUrl || idProofData?.photo || ''
      },
      studentPhoto: studentPhotoUrl || undefined,
      studentSignature: studentSignatureUrl || undefined
    };

    console.log('📦 Final student data to save:', {
      studentId: studentData.studentId,
      name: studentData.name,
      email: studentData.email,
      hasStudentPhoto: !!studentData.studentPhoto,
      hasStudentSignature: !!studentData.studentSignature,
      hasIdProofPhoto: !!studentData.idProof.photo,
      idProofType: studentData.idProof.type,
      idProofNumber: studentData.idProof.number
    });

    // Create and save student
    const student = new Student(studentData);
    console.log('💾 Saving student to database...');
    
    const savedStudent = await student.save();
    console.log('✅ Student saved successfully. ID:', savedStudent._id);

    // Remove version key from response
    const studentResponse = savedStudent.toObject();
    delete studentResponse.__v;

    console.log('=== CREATE STUDENT COMPLETED SUCCESSFULLY ===');
    
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: studentResponse
    });

  } catch (error) {
    console.error('❌ CREATE STUDENT ERROR:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.log('❌ Validation errors:', messages);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    // Handle duplicate key error (if studentId generation fails)
    if (error.code === 11000) {
      console.log('❌ Duplicate key error:', error.message);
      return res.status(400).json({
        success: false,
        message: 'Student ID already exists. Please try again.',
        error: error.message
      });
    }

    console.log('❌ Unexpected error:', error.message);
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
      isActive
      // Remove file fields from body
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

    // Handle file uploads for updates
    let fileUpdateData = {};
    if (req.files) {
      try {
        // Handle student photo update
        if (req.files.studentPhoto && req.files.studentPhoto[0]) {
          const file = req.files.studentPhoto[0];
          fileUpdateData.studentPhoto = await uploadToCloudinary(file.buffer, 'lms/students/photos');
          
          // Delete old photo if exists
          if (student.studentPhoto) {
            await deleteFromCloudinary(student.studentPhoto);
          }
        }

        // Handle student signature update
        if (req.files.studentSignature && req.files.studentSignature[0]) {
          const file = req.files.studentSignature[0];
          fileUpdateData.studentSignature = await uploadToCloudinary(file.buffer, 'lms/students/signatures');
          
          // Delete old signature if exists
          if (student.studentSignature) {
            await deleteFromCloudinary(student.studentSignature);
          }
        }

        // Handle ID proof photo update
        if (req.files.idProofPhoto && req.files.idProofPhoto[0]) {
          const file = req.files.idProofPhoto[0];
          fileUpdateData.idProofPhoto = await uploadToCloudinary(file.buffer, 'lms/students/idproofs');
          
          // Delete old ID proof photo if exists
          if (student.idProof && student.idProof.photo) {
            await deleteFromCloudinary(student.idProof.photo);
          }
        }
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: `File upload failed: ${uploadError.message}`
        });
      }
    }

    // Parse idProof if it's a string
    let idProofData = idProof;
    if (typeof idProof === 'string') {
      try {
        idProofData = JSON.parse(idProof);
      } catch (error) {
        idProofData = student.idProof;
      }
    }

    // Update student data
    const updateData = {
      name: name || student.name,
      email: email || student.email,
      phone: phone || student.phone,
      alternateEmail: alternateEmail !== undefined ? alternateEmail : student.alternateEmail,
      alternatePhone: alternatePhone !== undefined ? alternatePhone : student.alternatePhone,
      dateOfBirth: dateOfBirth || student.dateOfBirth,
      gender: gender || student.gender,
      address: address || student.address,
      idProof: {
        ...student.idProof,
        ...idProofData,
        ...(fileUpdateData.idProofPhoto && { photo: fileUpdateData.idProofPhoto })
      },
      isActive: isActive !== undefined ? isActive : student.isActive,
      ...fileUpdateData
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

    // Check if student is involved in admission then can't delete this
    const admissionCount = await Admission.countDocuments({ student: req.params.id });
    if (admissionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete student. Student has admissions records.'
      });
    }

    // Delete files from Cloudinary before deleting student
    try {
      if (student.studentPhoto) {
        await deleteFromCloudinary(student.studentPhoto);
      }
      if (student.studentSignature) {
        await deleteFromCloudinary(student.studentSignature);
      }
      if (student.idProof && student.idProof.photo) {
        await deleteFromCloudinary(student.idProof.photo);
      }
    } catch (deleteError) {
      console.error('Error deleting files from Cloudinary:', deleteError);
      // Continue with student deletion even if file deletion fails
    }

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