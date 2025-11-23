const EnrolledStudent = require('../models/EnrolledStudent');
const Admission = require('../models/Admission');

// Enroll student from admission
exports.enrollStudent = async (req, res) => {
  try {
    const admission = await Admission.findOne({ admissionNo: req.params.admissionNo });
    
    if (!admission) {
      return res.status(404).json({
        success: false,
        error: 'Admission not found'
      });
    }
    
    // Check if already enrolled
    const existingEnrollment = await EnrolledStudent.findOne({ admissionNo: req.params.admissionNo });
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: 'Student already enrolled'
      });
    }
    
    // Convert admission to enrollment
    const enrollmentData = {
      admissionNo: admission.admissionNo,
      admissionDate: admission.admissionDate,
      name: admission.name,
      email: admission.email,
      mobile: admission.phoneNo,
      alternateEmail: admission.alternateEmail,
      alternateMobile: admission.alternateNumber,
      primaryEmail: admission.primaryEmail,
      primaryMobile: admission.primaryNumber,
      course: admission.course,
      courseFee: admission.courseFee,
      trainingBranch: admission.trainingBranch,
      counsellor: admission.counsellor,
      totalAmount: admission.courseFee,
      actualAmount: admission.courseFee,
      pendingAmount: admission.courseFee
    };
    
    const enrolledStudent = new EnrolledStudent(enrollmentData);
    await enrolledStudent.save();
    
    // Update admission status
    await Admission.findOneAndUpdate(
      { admissionNo: req.params.admissionNo },
      { status: 'enrolled' }
    );
    
    res.status(201).json({
      success: true,
      data: enrolledStudent
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all enrolled students
exports.getEnrolledStudents = async (req, res) => {
  try {
    const students = await EnrolledStudent.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: students
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get single enrolled student
exports.getEnrolledStudent = async (req, res) => {
  try {
    const student = await EnrolledStudent.findOne({ admissionNo: req.params.admissionNo });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Enrolled student not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update enrolled student
exports.updateEnrolledStudent = async (req, res) => {
  try {
    const student = await EnrolledStudent.findOneAndUpdate(
      { admissionNo: req.params.admissionNo },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Enrolled student not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update EMI details
exports.updateEMI = async (req, res) => {
  try {
    const { emiType } = req.params;
    const student = await EnrolledStudent.findOne({ admissionNo: req.params.admissionNo });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Enrolled student not found'
      });
    }
    
    const updateField = `${emiType}EMI`;
    student[updateField] = req.body;
    
    await student.save();
    
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};