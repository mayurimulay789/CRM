const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Admission = require('../models/Admission');
const Course = require('../models/Course');
const Batch = require('../models/Batch');

const createEnrollment = async (req, res) => {
  console.log("re body", req.body);
  try {
    const {
      admission,
      batch,
      trainingBranch,
      mode,
      totalAmount,
      discount = 0,
      feeType,
      firstEMI,
      secondEMI,
      thirdEMI,
      dueDate,
      lateFees = 0, // Changed from charges to lateFees
      leadDate,
      leadSource,
      call,
      upfrontPayment // New field
    } = req.body;

    // Check if enrollment already exists for this admission
    const existingEnrollment = await Enrollment.findOne({ admission });
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment already exists for this admission'
      });
    }

    // Extract student and course from admission details
    const admissionDetails = await Admission.findById(admission);
    if (!admissionDetails) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    // Verify admission is approved
    if (admissionDetails.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot create enrollment for non-approved admission'
      });
    }

    // Generate enrollment number
    const currentYear = new Date().getFullYear();
    const latestEnrollment = await Enrollment.findOne(
      {
        enrollmentNo: new RegExp(`^ENR${currentYear}`)
      },
      {},
      { sort: { enrollmentNo: -1 } }
    );

    let sequenceNumber = 1;
    if (latestEnrollment && latestEnrollment.enrollmentNo) {
      const lastSequence = parseInt(latestEnrollment.enrollmentNo.slice(-4));
      sequenceNumber = lastSequence + 1;
    }

    const enrollmentNo = `ENR${currentYear}${sequenceNumber.toString().padStart(4, '0')}`;

    // Prepare enrollment data
    const enrollmentData = {
      enrollmentNo,
      admission,
      student: admissionDetails.student.toString(),
      course: admissionDetails.course.toString(),
      batch,
      trainingBranch,
      mode,
      totalAmount,
      discount,
      feeType,
      firstEMI,
      secondEMI,
      thirdEMI,
      dueDate,
      lateFees: lateFees || 0,
      leadDate,
      leadSource,
      call,
      counsellor: req.user.id
    };

    // Add upfront payment if provided
    if (upfrontPayment && upfrontPayment.amount > 0) {
      enrollmentData.upfrontPayment = {
        amount: upfrontPayment.amount,
        date: upfrontPayment.date || new Date(),
        pending: 0,
        status: 'pending'
      };
    }

    // Create enrollment
    const enrollment = new Enrollment(enrollmentData);

    console.log("Enrollment to be saved:", enrollment);
    await enrollment.save();
    
    // Populate the saved enrollment
    await enrollment.populate([
      { path: 'student', select: 'studentId name email phone' },
      { path: 'course', select: 'name fee duration' },
      { path: 'batch', select: 'name timing' },
      { path: 'admission', select: 'admissionNo' }
    ]);

    // Add activity log
    await enrollment.addActivity(
      'status_update',
      'Enrollment created successfully',
      req.user.id
    );

    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating enrollment',
      error: error.message
    });
  }
};

const getEnrollments = async (req, res) => {
  try {
    const {
      status,
      trainingBranch,
      counsellor,
      page = 1,
      limit = 10,
      search,
      hasLateFees, // New filter
      hasUpfrontPayment // New filter
    } = req.query;

    let query = {};

    // Counsellor can only see their own enrollments
    if (req.user.role === 'Counsellor') {
      query.counsellor = req.user.id;
    }

    // Admin can filter by counsellor
    if (req.user.role === 'admin' && counsellor) {
      query.counsellor = counsellor;
    }

    if (status) query.status = status;
    if (trainingBranch) query.trainingBranch = trainingBranch;

    // Filter by late fees
    if (hasLateFees === 'true') {
      query.lateFees = { $gt: 0 };
      query.totalLateFeesPending = { $gt: 0 };
    }

    // Filter by upfront payment
    if (hasUpfrontPayment === 'true') {
      query['upfrontPayment.amount'] = { $gt: 0 };
    }

    // Search functionality
    if (search) {
      const students = await Student.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      query.$or = [
        { enrollmentNo: { $regex: search, $options: 'i' } },
        { student: { $in: students.map(s => s._id) } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const enrollments = await Enrollment.find(query)
      .populate('student', 'studentId name email phone')
      .populate('course', 'name fee duration')
      .populate('batch', 'name timing')
      .populate('counsellor', 'name email')
      .populate('admission', 'admissionNo')
      .sort({ enrollmentDate: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Enrollment.countDocuments(query);

    res.json({
      success: true,
      data: enrollments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching enrollments',
      error: error.message
    });
  }
};

const getEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('student', 'studentId name email phone alternateEmail alternatePhone dateOfBirth gender address')
      .populate('course', 'name fee duration description')
      .populate('batch', 'name timing startDate endDate status')
      .populate('counsellor', 'name email phone')
      .populate('admission', 'admissionNo admissionDate');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if counsellor owns this enrollment
    if (req.user.role === 'Counsellor' && enrollment.counsellor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this enrollment'
      });
    }

    // Get payment history for this enrollment
    const payments = await Payment.find({ enrollment: enrollment._id })
      .populate('receivedBy', 'name email')
      .populate('verifiedBy', 'name email')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: {
        enrollment,
        payments
      }
    });
  } catch (error) {
    console.error('Get enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching enrollment',
      error: error.message
    });
  }
};

const updateEnrollment = async (req, res) => {
  try {
    console.log('🔄 ========== UPDATE ENROLLMENT STARTED ==========');
    console.log('📝 Enrollment ID to update:', req.params.id);
    console.log('🛠️  Update Data:', req.body);
    
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      console.log('❌ Enrollment not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    console.log('✅ Enrollment found');

    // Authorization check with proper case handling
    const userRole = req.user.role;
    console.log('👤 User role:', userRole, 'User ID:', req.user.id);
    console.log('👤 Enrollment counsellor:', enrollment.counsellor.toString());

    if (userRole === 'Counsellor' && enrollment.counsellor.toString() !== req.user.id) {
      console.log('🚫 ACCESS DENIED - Counsellor does not own this enrollment');
      return res.status(403).json({
        success: false,
        message: 'Access denied to update this enrollment'
      });
    }

    // FEE TYPE CHANGE VALIDATION
    if (req.body.feeType && req.body.feeType !== enrollment.feeType) {
      console.log('🔄 Fee type change detected:', enrollment.feeType, '->', req.body.feeType);
      const approvedPayments = await Payment.find({
        enrollment: enrollment._id,
        verificationStatus: 'approved'
      });
      
      if (approvedPayments.length > 0) {
        console.log('🚫 FEE TYPE CHANGE BLOCKED - Approved payments exist');
        return res.status(400).json({
          success: false,
          message: 'Cannot change fee type once payments have been approved for this enrollment'
        });
      }
    }

    // Define allowed updates based on user role
    let allowedUpdates = [];
    
    console.log('🔍 User role for update permissions:', userRole);
    
    if (userRole === 'Counsellor') {
      allowedUpdates = [
        'batch', 'mode', 'firstEMI', 'secondEMI', 'thirdEMI', 
        'dueDate', 'lateFees', 'call', 'trainingBranch', 'feeType',
        'totalAmount', 'discount', 'leadDate', 'leadSource', 'upfrontPayment'
      ];
    } else if (userRole === 'admin') {
      allowedUpdates = [
        'batch', 'mode', 'status', 'firstEMI', 'secondEMI', 'thirdEMI', 
        'dueDate', 'lateFees', 'call', 'trainingBranch', 'feeType',
        'totalAmount', 'discount', 'leadDate', 'leadSource', 'counsellor',
        'upfrontPayment', 'totalLateFeesPaid', 'totalLateFeesPending'
      ];
    } else {
      console.log('❓ Unknown user role:', userRole);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized role for updating enrollment'
      });
    }

    console.log('✅ Allowed updates for', userRole + ':', allowedUpdates);

    // For counsellors: Filter out status and counsellor fields
    let updates = Object.keys(req.body);
    console.log('📋 Requested updates:', updates);
    
    if (userRole === 'Counsellor') {
      const originalLength = updates.length;
      updates = updates.filter(update => 
        update !== 'status' && update !== 'counsellor'
      );
      console.log('👤 Counsellor - Filtered updates (status/counsellor removed):', updates);
      console.log(`   Removed ${originalLength - updates.length} restricted fields`);
    }

    const validUpdates = updates.filter(update => allowedUpdates.includes(update));
    const invalidUpdates = updates.filter(update => !allowedUpdates.includes(update));

    // Log what will be updated and what will be ignored
    if (validUpdates.length > 0) {
      console.log('✅ Valid updates to apply:', validUpdates);
      console.log('📊 Update details:');
      validUpdates.forEach(field => {
        console.log(`   ${field}: ${JSON.stringify(req.body[field])}`);
      });
    }
    if (invalidUpdates.length > 0) {
      console.log('⚠️ Invalid updates (will be ignored):', invalidUpdates);
    }

    if (validUpdates.length === 0) {
      console.log('⚠️ No valid fields to update - enrollment unchanged');
      
      await enrollment.populate([
        { path: 'student', select: 'studentId name email phone' },
        { path: 'course', select: 'name fee duration' },
        { path: 'batch', select: 'name timing' },
        { path: 'counsellor', select: 'name email' }
      ]);

      return res.json({
        success: true,
        data: enrollment,
        message: 'No valid fields to update - enrollment unchanged',
        invalidFields: invalidUpdates,
        allowedFields: allowedUpdates,
        userRole: userRole
      });
    }

    // Apply updates
    console.log('🛠️  Applying updates to enrollment...');
    validUpdates.forEach(update => {
      const oldValue = enrollment[update];
      const newValue = req.body[update];
      enrollment[update] = newValue;
      console.log(`   🔄 ${update}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`);
    });

    await enrollment.save();
    console.log('💾 Enrollment saved successfully');

    // Add activity log if changes were made
    if (validUpdates.length > 0) {
      console.log('📝 Logging activity for updates:', validUpdates);
      
      await enrollment.addActivity(
        'status_update',
        `Enrollment updated: ${validUpdates.join(', ')}`,
        req.user.id
      );
      console.log('✅ Activity logged successfully');
    }

    await enrollment.populate([
      { path: 'student', select: 'studentId name email phone' },
      { path: 'course', select: 'name fee duration' },
      { path: 'batch', select: 'name timing' },
      { path: 'counsellor', select: 'name email' }
    ]);

    console.log('✅ Enrollment update completed successfully');

    res.json({
      success: true,
      data: enrollment,
      message: `Enrollment updated successfully (${validUpdates.length} fields)`,
      updatedFields: validUpdates,
      ignoredFields: invalidUpdates
    });

  } catch (error) {
    console.error('💥 UPDATE ENROLLMENT FAILED:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating enrollment',
      error: error.message
    });
  }
};

// New controller to apply late fees
const applyLateFees = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if counsellor owns this enrollment
    if (req.user.role === 'Counsellor' && enrollment.counsellor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to apply late fees to this enrollment'
      });
    }

    await enrollment.applyLateFees(amount, reason, req.user.id);

    res.json({
      success: true,
      data: enrollment,
      message: `Late fee of ₹${amount} applied successfully`
    });
  } catch (error) {
    console.error('Apply late fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error applying late fees',
      error: error.message
    });
  }
};

// New controller to get enrollments with late fees
const getEnrollmentsWithLateFees = async (req, res) => {
  try {
    let query = {
      lateFees: { $gt: 0 },
      totalLateFeesPending: { $gt: 0 }
    };

    // Counsellor can only see their own enrollments with late fees
    if (req.user.role === 'Counsellor') {
      query.counsellor = req.user.id;
    }

    const enrollments = await Enrollment.find(query)
      .populate('student', 'studentId name email phone')
      .populate('course', 'name fee')
      .populate('counsellor', 'name email')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Get enrollments with late fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching enrollments with late fees',
      error: error.message
    });
  }
};

// New controller to get enrollments with upfront payment
const getEnrollmentsWithUpfrontPayment = async (req, res) => {
  try {
    let query = {
      'upfrontPayment.amount': { $gt: 0 }
    };

    // Counsellor can only see their own enrollments
    if (req.user.role === 'Counsellor') {
      query.counsellor = req.user.id;
    }

    const enrollments = await Enrollment.find(query)
      .populate('student', 'studentId name email phone')
      .populate('course', 'name fee')
      .populate('counsellor', 'name email')
      .sort({ enrollmentDate: -1 });

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Get enrollments with upfront payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching enrollments with upfront payment',
      error: error.message
    });
  }
};

const getEnrollmentStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { branch, startDate, endDate } = req.query;

    let matchStage = {};
    if (branch) matchStage.trainingBranch = branch;
    if (startDate && endDate) {
      matchStage.enrollmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Enrollment.getStatistics(branch);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get enrollment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching enrollment statistics',
      error: error.message
    });
  }
};

const getFeeDelays = async (req, res) => {
  try {
    let query = {
      dueDate: { $lt: new Date() },
      pendingAmount: { $gt: 0 }
    };

    // Counsellor can only see their own fee delays
    if (req.user.role === 'Counsellor') {
      query.counsellor = req.user.id;
    }

    const enrollments = await Enrollment.find(query)
      .populate('student', 'studentId name email phone')
      .populate('course', 'name')
      .populate('counsellor', 'name email')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Get fee delays error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching fee delays',
      error: error.message
    });
  }
};

const addActivity = async (req, res) => {
  try {
    const { type, description } = req.body;
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if counsellor owns this enrollment
    if (req.user.role === 'Counsellor' && enrollment.counsellor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to add activity to this enrollment'
      });
    }

    await enrollment.addActivity(type, description, req.user.id);

    res.json({
      success: true,
      message: 'Activity added successfully'
    });
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding activity',
      error: error.message
    });
  }
};

const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);  
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    res.json({
      success: true,
      message: 'Enrollment deleted successfully'
    });
  } catch (error) {
    console.error('Delete enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting enrollment',
      error: error.message
    });
  }
};

// Allow to delete only those enrollments whose never done any payment 
const deleteEnrollmentByCounsellor = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);  
    console.log("Enrollment to delete:", req.params.id);
    if (!enrollment) {
      console.log("Enrollment not found:", req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    // Check if counsellor owns this enrollment
    if (enrollment.counsellor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to delete this enrollment'
      });
    }
    // Check if any payments exist for this enrollment
    const payments = await Payment.find({ enrollment: enrollment._id });
    if (payments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete enrollment with existing payments'
      });
    }
    await Enrollment.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Enrollment deleted successfully'
    });

  } catch (error) {
    console.error('Delete enrollment by counsellor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting enrollment',
      error: error.message
    });
  }
};

module.exports = {
  createEnrollment,
  getEnrollments,
  getEnrollment,
  updateEnrollment,
  getEnrollmentStats,
  getFeeDelays,
  deleteEnrollment,
  deleteEnrollmentByCounsellor,
  addActivity,
  applyLateFees, // New
  getEnrollmentsWithLateFees, // New
  getEnrollmentsWithUpfrontPayment // New
};