const { sendMail } = require('../utils/email');
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
     
      mode,
      totalAmount,
      feeType,
      dueDate,
      leadDate,
      leadSource,
      call,
      admissionRegistrationPayment = 0
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

    // Calculate actual total including registration payment
    const actualTotal = (totalAmount || 0) + (admissionRegistrationPayment || 0);

    // EMI and dueDate validation removed

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

    // Create enrollment
    const enrollment = new Enrollment({
      enrollmentNo,
      admission,
      student: admissionDetails.student.toString(),
      course: admissionDetails.course.toString(),
      batch,
      mode,
      totalAmount,
      feeType,
      dueDate: dueDate || null,
      leadDate,
      leadSource,
      call,
      admissionRegistrationPayment,
      counsellor: req.user.id
    });

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

    // Send mail to student on enrollment creation (accept)
    try {
      if (enrollment.student && enrollment.student.email) {
        console.log(`📧 Sending enrollment acceptance email to: ${enrollment.student.email}`);
        
        // Calculate actual total including all fees
        const actualTotal = (enrollment.totalAmount || 0) + (enrollment.charges || 0) + (enrollment.admissionRegistrationPayment || 0);
        const pendingAmount = actualTotal - (enrollment.amountReceived || 0);

        // Generate styled enrollment email
        const enrollmentHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Enrollment Confirmation</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
              }
              .content {
                padding: 30px;
              }
              .congrats {
                text-align: center;
                margin-bottom: 30px;
              }
              .congrats h2 {
                color: #007bff;
                font-size: 24px;
                margin-bottom: 10px;
              }
              .enrollment-details {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e9ecef;
              }
              .detail-row:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
              }
              .detail-label {
                font-weight: 600;
                color: #495057;
              }
              .detail-value {
                color: #212529;
                text-align: right;
              }
              .status-badge {
                background-color: #28a745;
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                text-align: center;
                margin: 20px 0;
                font-weight: 600;
              }
              .next-steps {
                background-color: #e7f3ff;
                border-left: 4px solid #007bff;
                padding: 15px 20px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .footer {
                text-align: center;
                padding: 20px;
                background-color: #f8f9fa;
                color: #6c757d;
                font-size: 14px;
              }
              .amount-highlight {
                font-size: 20px;
                font-weight: bold;
                color: #007bff;
                text-align: center;
                margin: 15px 0;
              }
              .fee-breakdown-total {
                font-weight: bold;
                font-size: 16px;
                color: #007bff;
                border-top: 2px solid #007bff;
                padding-top: 10px;
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 Enrollment Confirmed</h1>
              </div>
              
              <div class="content">
                <div class="congrats">
                  <h2>Welcome to Ryma Academy! 🎉</h2>
                  <p>Dear ${enrollment.student.name || 'Student'}, your enrollment has been successfully <strong>approved</strong>.</p>
                </div>

                <div class="status-badge">
                  ✅ Enrollment No: ${enrollment.enrollmentNo}
                </div>

                <!-- Enrollment Details Section -->
                <div class="enrollment-details">
                  <h3 style="color: #495057; margin-bottom: 15px; text-align: center;">📋 Enrollment Details</h3>
                  <div class="detail-row">
                    <span class="detail-label">Student Name:</span>
                    <span class="detail-value">${enrollment.student.name || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Student ID:</span>
                    <span class="detail-value">${enrollment.student.studentId || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Course:</span>
                    <span class="detail-value">${enrollment.course?.name || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Batch:</span>
                    <span class="detail-value">${enrollment.batch?.name || 'N/A'}</span>
                  </div>
                  <!-- Training Branch removed -->
                  <div class="detail-row">
                    <span class="detail-label">Mode:</span>
                    <span class="detail-value">${enrollment.mode || 'N/A'}</span>
                  </div>
                </div>

                <!-- Fee Breakdown Section -->
                <div class="enrollment-details">
                  <h3 style="color: #495057; margin-bottom: 15px; text-align: center;">💰 Fee Breakdown</h3>
                  <div class="detail-row">
                    <span class="detail-label">Course Fee:</span>
                    <span class="detail-value">₹${(enrollment.totalAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  ${enrollment.charges > 0 ? `
                  <div class="detail-row">
                    <span class="detail-label">Late Fees:</span>
                    <span class="detail-value">₹${(enrollment.charges || 0).toLocaleString('en-IN')}</span>
                  </div>` : ''}
                  ${enrollment.admissionRegistrationPayment > 0 ? `
                  <div class="detail-row">
                    <span class="detail-label">Registration Fee:</span>
                    <span class="detail-value">₹${(enrollment.admissionRegistrationPayment || 0).toLocaleString('en-IN')}</span>
                  </div>` : ''}
                  <div class="detail-row fee-breakdown-total">
                    <span class="detail-label">Total Amount:</span>
                    <span class="detail-value">₹${actualTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Amount Received:</span>
                    <span class="detail-value">₹${(enrollment.amountReceived || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div class="detail-row fee-breakdown-total">
                    <span class="detail-label">Pending Amount:</span>
                    <span class="detail-value" style="color: ${pendingAmount > 0 ? '#dc3545' : '#28a745'};">₹${pendingAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <!-- Fee Payment Information -->
                <!-- EMI Schedule and Due Date removed -->

                <div class="next-steps">
                  <h4 style="margin-top: 0; color: #007bff;">📝 Next Steps:</h4>
                  <ul style="margin: 0;">
                    <li>Keep this email for your records</li>
                    <li>${pendingAmount > 0 ? `Complete your fee payment as per the schedule above` : 'Your fees are fully paid - Welcome aboard!'}</li>
                    <li>Check your student portal for class schedules and materials</li>
                    <li>Contact our support team if you have any questions</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <p><strong>Thank you for choosing Ryma Academy!</strong></p>
                  <p>We look forward to supporting your learning journey.</p>
                </div>
              </div>

              <div class="footer">
                <p><strong>Ryma Academy</strong></p>
                <p>For support, contact us at: <a href="mailto:support@rymaacademy.com">support@rymaacademy.com</a></p>
                <p>This is an automated message. Please do not reply directly to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await sendMail(
          enrollment.student.email,
          `🎓 Enrollment Confirmed - Welcome to Ryma Academy | ${enrollment.enrollmentNo}`,
          enrollmentHtml,
          true // Include BCC for enrollment notifications
        );
        console.log('✅ Enrollment acceptance email sent successfully to:', enrollment.student.email);
      } else {
        console.error('❌ No student email found for enrollment:', {
          enrollmentId: enrollment._id,
          studentId: enrollment.student?._id,
          studentEmail: enrollment.student?.email,
          studentName: enrollment.student?.name
        });
      }
    } catch (err) {
      console.error('❌ Failed to send enrollment acceptance email:', {
        error: err.message,
        studentEmail: enrollment.student?.email,
        enrollmentId: enrollment._id,
        stack: err.stack
      });
    }

    res.status(201).json({
      success: true,
      data: enrollment
    });
  // Helper: Send rejection mail
  async function sendEnrollmentRejectionMail(student, admissionRegistrationPayment, charges = 0, totalAmount = 0) {
    try {
      if (student && student.email) {
        console.log(`📧 Sending enrollment rejection email to: ${student.email}`);
        
        // Calculate amounts  
        const actualTotal = (totalAmount || 0) + (charges || 0) + (admissionRegistrationPayment || 0);
        
        const rejectionHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Enrollment Status Update</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
              }
              .content {
                padding: 30px;
              }
              .message {
                text-align: center;
                margin-bottom: 30px;
              }
              .message h2 {
                color: #dc3545;
                font-size: 24px;
                margin-bottom: 10px;
              }
              .details {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e9ecef;
              }
              .detail-row:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
              }
              .detail-label {
                font-weight: 600;
                color: #495057;
              }
              .detail-value {
                color: #212529;
                text-align: right;
              }
              .status-badge {
                background-color: #dc3545;
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                text-align: center;
                margin: 20px 0;
                font-weight: 600;
              }
              .support-info {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px 20px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .footer {
                text-align: center;
                padding: 20px;
                background-color: #f8f9fa;
                color: #6c757d;
                font-size: 14px;
              }
              .fee-breakdown-total {
                font-weight: bold;
                font-size: 16px;
                color: #dc3545;
                border-top: 2px solid #dc3545;
                padding-top: 10px;
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📋 Enrollment Update</h1>
              </div>
              
              <div class="content">
                <div class="message">
                  <h2>Enrollment Status Update</h2>
                  <p>Dear ${student.name || 'Student'}, we regret to inform you that your enrollment application has been <strong>rejected</strong>.</p>
                </div>

                <div class="status-badge">
                  ❌ Enrollment Rejected
                </div>

                <!-- Student Details Section -->
                <div class="details">
                  <h3 style="color: #495057; margin-bottom: 15px; text-align: center;">👤 Student Information</h3>
                  <div class="detail-row">
                    <span class="detail-label">Student Name:</span>
                    <span class="detail-value">${student.name || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Student ID:</span>
                    <span class="detail-value">${student.studentId || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${student.email || 'N/A'}</span>
                  </div>
                </div>

                <!-- Fee Information Section -->
                ${actualTotal > 0 ? `
                <div class="details">
                  <h3 style="color: #495057; margin-bottom: 15px; text-align: center;">💰 Fee Information</h3>
                  ${totalAmount > 0 ? `
                  <div class="detail-row">
                    <span class="detail-label">Course Fee:</span>
                    <span class="detail-value">₹${totalAmount.toLocaleString('en-IN')}</span>
                  </div>` : ''}
                  ${charges > 0 ? `
                  <div class="detail-row">
                    <span class="detail-label">Late Fees:</span>
                    <span class="detail-value">₹${charges.toLocaleString('en-IN')}</span>
                  </div>` : ''}
                  ${admissionRegistrationPayment > 0 ? `
                  <div class="detail-row">
                    <span class="detail-label">Registration Payment:</span>
                    <span class="detail-value">₹${admissionRegistrationPayment.toLocaleString('en-IN')}</span>
                  </div>` : ''}
                  ${actualTotal > admissionRegistrationPayment ? `
                  <div class="detail-row fee-breakdown-total">
                    <span class="detail-label">Total Amount:</span>
                    <span class="detail-value">₹${actualTotal.toLocaleString('en-IN')}</span>
                  </div>` : ''}
                </div>` : ''}

                <div class="support-info">
                  <h4 style="margin-top: 0; color: #856404;">📞 Need Help?</h4>
                  <p style="margin: 0;">If you have any questions about this decision or would like to discuss your application, please contact our admissions team.</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <p>We appreciate your interest in Ryma Academy.</p>
                  <p>You may reapply in the future when you meet the required criteria.</p>
                </div>
              </div>

              <div class="footer">
                <p><strong>Ryma Academy</strong></p>
                <p>For support, contact us at: <a href="mailto:support@rymaacademy.com">support@rymaacademy.com</a></p>
                <p>This is an automated message. Please do not reply directly to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await sendMail(
          student.email,
          '📋 Enrollment Status Update - Ryma Academy',
          rejectionHtml,
          true // Include BCC for enrollment notifications
        );
        console.log('✅ Enrollment rejection email sent successfully to:', student.email);
      } else {
        console.error('❌ No student email found for rejection notification:', {
          studentId: student?._id,
          studentEmail: student?.email,
          studentName: student?.name
        });
      }
    } catch (err) {
      console.error('❌ Failed to send enrollment rejection email:', {
        error: err.message,
        studentEmail: student?.email,
        studentId: student?._id,
        stack: err.stack
      });
    }
  }
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
      search
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
      .populate('counsellor', 'FullName email')
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
      .populate('counsellor', 'FullName email phone')
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
        'batch', 'mode', 'charges', 'call', 'feeType', 'dueDate',
        'totalAmount', 'actualAmount', 'discount', 'leadDate', 'leadSource', 'admissionRegistrationPayment'
      ];
    } else if (userRole === 'admin') {
      allowedUpdates = [
        'batch', 'mode', 'status', 'charges', 'call', 'feeType', 'dueDate',
        'totalAmount', 'actualAmount', 'discount', 'leadDate', 'leadSource', 'counsellor', 'admissionRegistrationPayment'
      ];
    } else {
      console.log('❓ Unknown user role:', userRole);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized role for updating enrollment'
      });
    }

    console.log('✅ Allowed updates for', userRole + ':', allowedUpdates);

    // For counsellors: Filter out status and counsellor fields instead of throwing error
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
    let statusChanged = false;
    let newStatus = enrollment.status;
    let oldStatus = enrollment.status;
    validUpdates.forEach(update => {
      const oldValue = enrollment[update];
      const newValue = req.body[update];
      if (update === 'status' && newValue !== oldValue) {
        statusChanged = true;
        newStatus = newValue;
        oldStatus = oldValue;
      }
      enrollment[update] = newValue;
      console.log(`   🔄 ${update}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`);
    });

    

    await enrollment.save();
    console.log('💾 Enrollment saved successfully');

    // Add activity log if changes were made - FIXED ACTIVITY TYPE
    if (validUpdates.length > 0) {
      console.log('📝 Logging activity for updates:', validUpdates);
      // Use a valid enum value for activity type
      const activityType = 'status_update';
      await enrollment.addActivity(
        activityType,
        `Enrollment updated: ${validUpdates.join(', ')}`,
        req.user.id
      );
      console.log('✅ Activity logged successfully');
    }

    // Send mail if status changed to accepted or rejected
    if (statusChanged) {
      await enrollment.populate({ path: 'student', select: 'name email' });
      if (newStatus === 'active') {
        try {
          await sendMail(
            enrollment.student.email,
            'Enrollment Accepted',
            `<p>Dear ${enrollment.student.name || 'Student'},</p>
            <p>Your enrollment has been <b>accepted</b>.</p>
            <p>Admission Registration Payment: <b>₹${enrollment.admissionRegistrationPayment || 0}</b></p>
            <p>Thank you.</p>`
          );
        } catch (err) {
          console.error('Failed to send enrollment acceptance email:', err.message);
        }
      } else if (newStatus === 'rejected' || newStatus === 'cancelled') {
        try {
          await sendEnrollmentRejectionMail(enrollment.student, enrollment.admissionRegistrationPayment, enrollment.charges, enrollment.totalAmount);
        } catch (err) {
          console.error('Failed to send enrollment rejection email:', err.message);
        }
      }
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
    // if (enrollment.counsellor.toString() !== req.user.id) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Access denied to delete this enrollment'
    //   });
    // }
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
  addActivity
};