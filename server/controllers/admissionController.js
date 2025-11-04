const Admission = require('../models/Admission');
const EnrolledStudent = require('../models/EnrolledStudent');

// Create new admission
exports.createAdmission = async (req, res) => {
  try {
    const admissionData = req.body;
    
    // Generate admission number
    const lastAdmission = await Admission.findOne().sort({ admissionNo: -1 });
    let admissionNo = 'DIDM001';
    if (lastAdmission) {
      const lastNumber = parseInt(lastAdmission.admissionNo.replace('DIDM', ''));
      admissionNo = `DIDM${(lastNumber + 1).toString().padStart(3, '0')}`;
    }
    
    admissionData.admissionNo = admissionNo;
    admissionData.admissionDate = new Date();
    
    const admission = new Admission(admissionData);
    await admission.save();
    
    res.status(201).json({
      success: true,
      data: admission
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all admissions
exports.getAdmissions = async (req, res) => {
  console.log('Fetching admissions');
  try {
    const admissions = await Admission.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: admissions
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get single admission
exports.getAdmission = async (req, res) => {
  try {
    const admission = await Admission.findOne({ admissionNo: req.params.admissionNo });
    
    if (!admission) {
      return res.status(404).json({
        success: false,
        error: 'Admission not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: admission
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};


// Update admission
exports.updateAdmission = async (req, res) => {
  try {
    if(!req.body){
      return res.status(400).json({
        success: false,
        error: 'No data provided for update'
      });
    }
    
    // i want remove admissionNo from req.body if exists to avoid updating it
    if(req.body.admissionNo){
      delete req.body.admissionNo;
    }

    const admission = await Admission.findOneAndUpdate(
      { admissionNo: req.params.admissionNo },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!admission) {
      return res.status(404).json({
        success: false,
        error: 'Admission not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: admission
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete admission
exports.deleteAdmission = async (req, res) => {
  try {
    const admission = await Admission.findOneAndDelete({ admissionNo: req.params.admissionNo });
    
    if (!admission) {
      return res.status(404).json({
        success: false,
        error: 'Admission not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Admission deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const admission = await Admission.findOneAndUpdate(
      { admissionNo: req.params.admissionNo },
      { emailVerified: true },
      { new: true }
    );
    
    if (!admission) {
      return res.status(404).json({
        success: false,
        error: 'Admission not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: admission
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};