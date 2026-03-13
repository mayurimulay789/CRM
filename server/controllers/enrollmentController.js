const { sendMail } = require('../utils/email');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Admission = require('../models/Admission');

// Helper function for date formatting
function formatDateToDDMMYYYY(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

// Helper function to send enrollment approval email
// Helper function to send enrollment approval email
async function sendEnrollmentApprovalMail(enrollment) {
  try {
    if (enrollment.student && enrollment.student.email) {
      console.log(`📧 Sending enrollment approval email to: ${enrollment.student.email}`);

      // Generate installment table HTML if fee type is installment
      const installmentTableHTML = enrollment.feeType === 'installment' && enrollment.installments && enrollment.installments.length > 0 
        ? `
          <div class="section-title">INSTALLMENT SCHEDULE</div>
          <table class="enroll-table" cellpadding="0" cellspacing="0">
            <thead>
              <tr>
                <th class="label-cell" style="text-align: center;">#</th>
                <th class="label-cell" style="text-align: center;">Amount (₹)</th>
                <th class="label-cell" style="text-align: center;">Due Date</th>
              </tr>
            </thead>
            <tbody>
              ${enrollment.installments.map(inst => `
                <tr>
                  <td class="value-cell" style="text-align: center;"><strong>${inst.installmentNumber}</strong></td>
                  <td class="value-cell" style="text-align: center;"><strong>₹${inst.amount}</strong></td>
                  <td class="value-cell" style="text-align: center;"><strong>${formatDateToDDMMYYYY(inst.dueDate)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `
        : '';

      const enrollmentHtml = `
       <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RYMA ACADEMY – Official Enrollment Record</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f2e5e5;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .enrollment-container {
            max-width: 1200px;
            margin: auto;
            background-color: #ffffff;
            overflow: hidden;
            box-shadow: 0 12px 28px rgba(150, 30, 30, 0.2);
        }

        .content {
            padding: 28px 32px 32px;
        }

        .greeting {
            font-size: 18px;
            font-weight: 500;
            color: #3b2323;
            margin-bottom: 8px;
        }

        .greeting strong {
            color: #b13e3e;
        }

        .office-line {
            color: #7e3939;
            font-weight: 600;
            margin: 5px 0 15px;
            font-size: 16px;
        }

        .message {
            font-size: 16px;
            color: #3a2a2a;
            line-height: 1.5;
            margin: 15px 0 10px;
        }

        .highlight {
            background: #fef0f0;
            padding: 16px 20px;
            border-radius: 30px 10px 30px 10px;
            margin: 20px 0;
            border-left: 6px solid #b13e3e;
            color: #572626;
            font-weight: 500;
        }

        .section-title {
            font-size: 22px;
            font-weight: 700;
            color: #aa2929;
            border-bottom: 3px solid #e0adad;
            padding-bottom: 10px;
            margin: 30px 0 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .enroll-table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 6px 18px rgba(150, 40, 40, 0.1);
            border: 1px solid #e9c1c1;
            margin-bottom: 25px;
        }

        .enroll-table td, .enroll-table th {
            padding: 14px 20px;
            border-bottom: 1px solid #f2d6d6;
            font-size: 16px;
        }

        .enroll-table tr:last-child td {
            border-bottom: none;
        }

        .label-cell {
            background-color: #fde5e5;
            color: #892b2b;
            font-weight: 700;
            width: 42%;
            border-right: 1px solid #e2b2b2;
        }

        .value-cell {
            background-color: #fffbfb;
            color: #2e1c1c;
            font-weight: 500;
        }

        .value-cell strong {
            color: #b33838;
        }

        .warning-note {
            background: #ffebeb;
            padding: 18px 24px;
            border-radius: 60px 10px 60px 10px;
            margin: 28px 0 20px;
            color: #792e2e;
            font-size: 15px;
            text-align: center;
            border: 1px solid #e2acac;
        }

        .help-box {
            background-color: #fadfdf;
            border-radius: 30px;
            padding: 18px 25px;
            margin: 25px 0;
            border: 1px solid #d69494;
            color: #6d3131;
        }

        .help-box a {
            color: #a23131;
            font-weight: 600;
            text-decoration: underline;
        }

        .quote-block {
            background: #fff3f3;
            border-radius: 40px 12px 40px 12px;
            padding: 22px 26px;
            margin: 20px 0 25px;
            border: 1px solid #e6b2b2;
            box-shadow: 0 6px 14px rgba(170, 60, 60, 0.1);
        }

        .quote-mark {
            font-size: 40px;
            color: #b44848;
            font-family: 'Times New Roman', serif;
            line-height: 0.6;
            margin-right: 4px;
        }

        .quote-block p {
            font-size: 18px;
            font-style: italic;
            color: #592b2b;
            margin: 8px 0 10px 0;
            font-weight: 500;
        }

        .director-name {
            font-weight: 700;
            color: #862b2b;
            text-align: right;
            font-size: 16px;
        }

        .signature {
            margin: 30px 0 20px;
            color: #592525;
        }

        .contact-footer {
            background: #fae1e1;
            padding: 18px 25px;
            border-radius: 30px;
            color: #6d3131;
            font-size: 15px;
            margin: 20px 0;
            word-break: break-word;
        }

        .contact-footer a {
            color: #a13030;
            text-decoration: underline;
        }

        .footer-red {
            background-color: #8f2626;
            padding: 18px 28px;
            text-align: center;
            color: #ffd7d7;
            font-size: 14px;
            border-top: 3px solid #b33a3a;
        }

        .disclaimer {
            font-size: 12px;
            color: #ffe5e5;
            background-color: #6d2b2b;
            padding: 16px 24px;
            text-align: left;
            line-height: 1.5;
            border-top: 1px solid #b27373;
        }

        .disclaimer a {
            color: #ffd6d6;
        }

        .imgformate {
            width: 1200px;
        }
        
        .fee-summary {
            background: #f0f7ff;
            padding: 16px 20px;
            border-radius: 12px;
            margin: 20px 0;
            border-left: 6px solid #3498db;
        }
    </style>
</head>
<body>
    <div class="enrollment-container">
        <img src="https://res.cloudinary.com/dpyry0mh1/image/upload/v1773287825/Screenshot_2026-03-11_141445_ibusnj.png" alt="" class="imgformate">

        <div class="content">
            <div class="greeting">Dear <strong>${enrollment.student?.name || 'Student'}</strong>,</div>
            <div class="office-line">Greetings from the Office of Academic Affairs, RYMA ACADEMY.</div>

            <div class="message">
                Congratulations! Your enrollment has been <strong>approved</strong>. You have now been formally enrolled as an official student of RYMA ACADEMY. Your unique
                Enrollment ID has been issued — <strong>${enrollment.enrollmentNo}</strong>. This is your academic identity and will
                be required for all academic, administrative, and certification purposes throughout your program.
            </div>

            <div class="highlight">
                ⚡ Kindly save this email permanently. It is your official enrollment record.
            </div>

            <div class="section-title">OFFICIAL ENROLLMENT RECORD — RYMA ACADEMY</div>

            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Student Name</td>
                    <td class="value-cell"><strong>${enrollment.student?.name || 'Student'}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Enrollment ID</td>
                    <td class="value-cell"><strong>${enrollment.enrollmentNo}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Date of Birth</td>
                    <td class="value-cell"><strong>${formatDateToDDMMYYYY(enrollment.student?.dateOfBirth)}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Registered Mobile</td>
                    <td class="value-cell"><strong>${enrollment.student?.phone}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Registered Email</td>
                    <td class="value-cell"><strong>${enrollment.student?.email}</strong></td>
                </tr>
            </table>

            <div class="section-title">PROGRAM DETAILS</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Program Enrolled</td>
                    <td class="value-cell"><strong>${enrollment.course?.name || 'N/A'}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Program Duration</td>
                    <td class="value-cell"><strong>${enrollment.course?.duration}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Batch Code</td>
                    <td class="value-cell"><strong>${enrollment.batch?.code}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Batch Timings</td>
                    <td class="value-cell"><strong>${enrollment.batch?.timing}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Mode of Learning</td>
                    <td class="value-cell"><strong>${enrollment.mode || 'N/A'}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Campus</td>
                    <td class="value-cell"><strong>${enrollment.admission?.trainingBranch || 'N/A'}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Enrollment Date</td>
                    <td class="value-cell"><strong>${formatDateToDDMMYYYY(enrollment.enrollmentDate)}</strong></td>
                </tr>
            </table>

            <div class="section-title">FEE DETAILS</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Program Fee (Total Amount)</td>
                    <td class="value-cell"><strong>₹${enrollment.totalAmount || 0}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Registration Payment</td>
                    <td class="value-cell"><strong>₹${enrollment.admissionRegistrationPayment || 0}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Amount to Pay</td>
                    <td class="value-cell"><strong>₹${(enrollment.totalAmount || 0) - (enrollment.admissionRegistrationPayment || 0)}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Fee Type</td>
                    <td class="value-cell"><strong>${enrollment.feeType === 'one-time' ? 'One Time Payment' : 'Installment'}</strong></td>
                </tr>
            </table>

            ${installmentTableHTML}

            <div class="warning-note">
                ⚠️ <strong>Please verify all details carefully.</strong> Any discrepancy must be reported to your
                Education Counsellor within 48 hours.
            </div>

            <div class="help-box">
                <strong>⚠️ Need assistance?</strong> Contact us at <strong>+91-9873336133</strong> | <a
                    href="mailto:services@rymaacademy.com">services@rymaacademy.com</a>
            </div>

            <div class="quote-block">
                <span class="quote-mark">“</span>
                <p>At RYMA ACADEMY, we believe every great journey begins with a single, courageous step forward. You
                    have taken that step. Now let us walk the rest of this path — together.</p>
                <div class="director-name">~ Mr. Parveen Jain | Director, RYMA ACADEMY</div>
            </div>

            <div class="signature">
                With the highest regards & warmest welcome,<br>
                <strong>Team of Admissions & Student Services</strong><br>
                RYMA ACADEMY
            </div>

            <div class="contact-footer">
                📞 +91-9873336133<br>
                📧 <a href="mailto:services@rymaacademy.com">services@rymaacademy.com</a><br>
                🌐 <a href="https://www.rymaacademy.com">www.rymaacademy.com</a><br>
                📍 D-7/32, 1st Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085
            </div>
        </div>

        <div class="disclaimer">
            <strong>Disclaimer:</strong> This is an electronically generated communication.
        </div>
        <div class="footer-red">
            © RYMA ACADEMY – Official Enrollment Record
        </div>
    </div>
</body>
</html>
      `;

      await sendMail(
        enrollment.student.email,
        `🎓 Enrollment Approved - Welcome to Ryma Academy | ${enrollment.enrollmentNo}`,
        enrollmentHtml,
        true
      );
      console.log('✅ Enrollment approval email sent successfully');
    }
  } catch (err) {
    console.error('❌ Failed to send enrollment approval email:', err.message);
  }
}

// Helper function to send enrollment rejection email
async function sendEnrollmentRejectionMail(student, enrollment) {
  try {
    if (student && student.email) {
      console.log(`📧 Sending enrollment rejection email to: ${student.email}`);

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

              <div class="support-info">
                <h4 style="margin-top: 0; color: #856404;">📞 Need Help?</h4>
                <p style="margin: 0;">If you have any questions about this decision, please contact our admissions team.</p>
              </div>
            </div>

            <div class="footer">
              <p><strong>Ryma Academy</strong></p>
              <p>Contact: <a href="mailto:support@rymaacademy.com">support@rymaacademy.com</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendMail(
        student.email,
        '📋 Enrollment Status Update - Ryma Academy',
        rejectionHtml,
        true
      );
      console.log('✅ Enrollment rejection email sent successfully');
    }
  } catch (err) {
    console.error('❌ Failed to send enrollment rejection email:', err.message);
  }
}

// Create Enrollment
const createEnrollment = async (req, res) => {
  console.log("req body", req.body);
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
      installments,
      admissionRegistrationPayment = 0
    } = req.body;

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({ admission });
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment already exists for this admission'
      });
    }

    // Get admission details
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

    // Validate installments for installment fee type
    if (feeType === 'installment') {
      if (!installments || installments.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Installments are required for installment fee type'
        });
      }

      // Calculate total installment amount
      const totalInstallmentAmount = installments.reduce((sum, inst) => sum + (inst.amount || 0), 0);
      const expectedTotal = totalAmount - admissionRegistrationPayment;

      if (Math.abs(totalInstallmentAmount - expectedTotal) > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Total installment amount (₹${totalInstallmentAmount}) must equal course fee (₹${expectedTotal})`
        });
      }

      // Validate each installment has required fields
      for (let i = 0; i < installments.length; i++) {
        const inst = installments[i];
        if (!inst.amount || inst.amount <= 0) {
          return res.status(400).json({
            success: false,
            message: `Installment ${i + 1} amount is required and must be greater than 0`
          });
        }
        if (!inst.dueDate) {
          return res.status(400).json({
            success: false,
            message: `Installment ${i + 1} due date is required`
          });
        }
      }
    }

    // Generate enrollment number
    const currentYear = new Date().getFullYear();
    const latestEnrollment = await Enrollment.findOne(
      { enrollmentNo: new RegExp(`^ENR${currentYear}`) },
      {},
      { sort: { enrollmentNo: -1 } }
    );

    let sequenceNumber = 1;
    if (latestEnrollment && latestEnrollment.enrollmentNo) {
      const lastSequence = parseInt(latestEnrollment.enrollmentNo.slice(-4));
      sequenceNumber = lastSequence + 1;
    }

    const enrollmentNo = `ENR${currentYear}${sequenceNumber.toString().padStart(4, '0')}`;

    // ✅ Calculate amountReceived and pendingAmount explicitly
    const amountReceived = admissionRegistrationPayment;
    const pendingAmount = totalAmount - amountReceived;

    // Create enrollment with explicit values
    const enrollment = new Enrollment({
      enrollmentNo,
      admission,
      student: admissionDetails.student.toString(),
      course: admissionDetails.course.toString(),
      batch,
      mode,
      totalAmount,
      amountReceived,           // ✅ Set explicitly
      pendingAmount,            // ✅ Set explicitly
      feeType,
      dueDate: dueDate || null,
      leadDate,
      leadSource,
      call,
      installments: feeType === 'installment' ? installments : [],
      admissionRegistrationPayment,
      counsellor: req.user.id,
      enrollmentStatus: 'pending'
    });

    await enrollment.save();

    // Populate the saved enrollment
    await enrollment.populate([
      { path: 'student', select: 'studentId name email phone dateOfBirth' },
      { path: 'course', select: 'name fee duration' },
      { path: 'batch', select: 'name timing code' },
      { path: 'admission', select: 'admissionNo trainingBranch' }
    ]);

    // Add activity log
    await enrollment.addActivity(
      'status_update',
      'Enrollment created successfully - Pending admin approval',
      req.user.id
    );

    res.status(201).json({
      success: true,
      data: enrollment,
      message: 'Enrollment created successfully and pending admin approval'
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

// Get all enrollments
const getEnrollments = async (req, res) => {
  try {
    const {
      status,
      enrollmentStatus,
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
    if (enrollmentStatus) query.enrollmentStatus = enrollmentStatus;
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
      .populate('admission', 'admissionNo trainingBranch')
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

// Get single enrollment
const getEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('student', 'studentId name email phone alternateEmail alternatePhone dateOfBirth gender address')
      .populate('course', 'name fee duration description')
      .populate('batch', 'name timing startDate endDate status')
      .populate('counsellor', 'FullName email phone')
      .populate('admission', 'admissionNo admissionDate trainingBranch');

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

// Update enrollment
const updateEnrollment = async (req, res) => {
  try {
    console.log('🔄 ========== UPDATE ENROLLMENT STARTED ==========');
    console.log('📝 Enrollment ID to update:', req.params.id);
    console.log('🛠️  Update Data:', req.body);

    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Authorization check
    const userRole = req.user.role;
    if (userRole === 'Counsellor' && enrollment.counsellor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to update this enrollment'
      });
    }

    // Check if enrollment is approved - counsellors cannot edit approved/rejected enrollments
    if (userRole === 'Counsellor' && enrollment.enrollmentStatus !== 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Cannot edit enrollment that is already approved or rejected'
      });
    }

    // Fee type change validation
    if (req.body.feeType && req.body.feeType !== enrollment.feeType) {
      const approvedPayments = await Payment.find({
        enrollment: enrollment._id,
        verificationStatus: 'approved'
      });

      if (approvedPayments.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change fee type once payments have been approved'
        });
      }
    }

    // Define allowed updates based on user role
    let allowedUpdates = [];
    if (userRole === 'Counsellor') {
      allowedUpdates = [
        'batch', 'mode', 'dueDate', 'call', 'feeType',
        'totalAmount', 'discount', 'leadDate', 'leadSource', 
        'admissionRegistrationPayment', 'installments'
      ];
    } else if (userRole === 'admin') {
      allowedUpdates = [
        'batch', 'mode', 'status', 'dueDate', 'call', 'feeType',
        'totalAmount', 'discount', 'leadDate', 'leadSource', 
        'counsellor', 'admissionRegistrationPayment', 'installments',
        'enrollmentStatus'
      ];
    } else {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized role for updating enrollment'
      });
    }

    // Filter updates
    let updates = Object.keys(req.body);
    if (userRole === 'Counsellor') {
      updates = updates.filter(update => update !== 'status' && update !== 'counsellor' && update !== 'enrollmentStatus');
    }

    const validUpdates = updates.filter(update => allowedUpdates.includes(update));

    if (validUpdates.length === 0) {
      return res.json({
        success: true,
        data: enrollment,
        message: 'No valid fields to update'
      });
    }

    // Validate installments if provided
    if (validUpdates.includes('installments') || validUpdates.includes('feeType')) {
      const feeType = req.body.feeType || enrollment.feeType;
      const installments = req.body.installments || enrollment.installments;
      const totalAmount = req.body.totalAmount || enrollment.totalAmount;
      const admissionRegistrationPayment = req.body.admissionRegistrationPayment || enrollment.admissionRegistrationPayment;

      if (feeType === 'installment') {
        if (!installments || installments.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Installments are required for installment fee type'
          });
        }

        const totalInstallmentAmount = installments.reduce((sum, inst) => sum + (inst.amount || 0), 0);
        const expectedTotal = totalAmount - admissionRegistrationPayment;

        if (Math.abs(totalInstallmentAmount - expectedTotal) > 0.01) {
          return res.status(400).json({
            success: false,
            message: `Total installment amount (₹${totalInstallmentAmount}) must equal course fee (₹${expectedTotal})`
          });
        }
      }
    }

    // Apply updates with explicit amount calculations
    validUpdates.forEach(update => {
      enrollment[update] = req.body[update];
    });

    // ✅ Recalculate amounts if totalAmount or admissionRegistrationPayment changed
    if (validUpdates.includes('totalAmount') || validUpdates.includes('admissionRegistrationPayment')) {
      const newTotal = req.body.totalAmount !== undefined ? req.body.totalAmount : enrollment.totalAmount;
      const newRegPayment = req.body.admissionRegistrationPayment !== undefined ? req.body.admissionRegistrationPayment : enrollment.admissionRegistrationPayment;
      
      // If amountReceived is not being updated, keep it as is
      // But recalculate pendingAmount
      enrollment.pendingAmount = newTotal - enrollment.amountReceived;
    }

    await enrollment.save();

    // Add activity log
    await enrollment.addActivity(
      'status_update',
      `Enrollment updated: ${validUpdates.join(', ')}`,
      req.user.id
    );

    await enrollment.populate([
      { path: 'student', select: 'studentId name email phone' },
      { path: 'course', select: 'name fee duration' },
      { path: 'batch', select: 'name timing' },
      { path: 'counsellor', select: 'FullName email' }
    ]);

    res.json({
      success: true,
      data: enrollment,
      message: `Enrollment updated successfully (${validUpdates.length} fields)`,
      updatedFields: validUpdates
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

// Approve enrollment (Admin only)
const approveEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('student', 'name email dateOfBirth phone')
      .populate('course', 'name duration')
      .populate('batch', 'code timing')
      .populate('admission', 'trainingBranch');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    if (enrollment.enrollmentStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Enrollment is already approved'
      });
    }

    enrollment.enrollmentStatus = 'approved';
    await enrollment.save();

    // Add activity log
    await enrollment.addActivity(
      'status_update',
      'Enrollment approved by admin',
      req.user.id
    );

    // Send approval email
    await sendEnrollmentApprovalMail(enrollment);

    res.json({
      success: true,
      data: enrollment,
      message: 'Enrollment approved successfully'
    });
  } catch (error) {
    console.error('Approve enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving enrollment',
      error: error.message
    });
  }
};

// Reject enrollment (Admin only)
const rejectEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('student', 'name email');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    if (enrollment.enrollmentStatus === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Enrollment is already rejected'
      });
    }

    enrollment.enrollmentStatus = 'rejected';
    await enrollment.save();

    // Add activity log
    await enrollment.addActivity(
      'status_update',
      'Enrollment rejected by admin',
      req.user.id
    );

    // Send rejection email
    await sendEnrollmentRejectionMail(enrollment.student, enrollment);

    res.json({
      success: true,
      data: enrollment,
      message: 'Enrollment rejected successfully'
    });
  } catch (error) {
    console.error('Reject enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting enrollment',
      error: error.message
    });
  }
};

// Get enrollment stats (Admin only)
const getEnrollmentStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { branch } = req.query;
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

// Get fee delays
const getFeeDelays = async (req, res) => {
  try {
    let query = {
      dueDate: { $lt: new Date() },
      pendingAmount: { $gt: 0 }
    };

    if (req.user.role === 'Counsellor') {
      query.counsellor = req.user.id;
    }

    const enrollments = await Enrollment.find(query)
      .populate('student', 'studentId name email phone')
      .populate('course', 'name')
      .populate('counsellor', 'FullName email')
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

// Add activity
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

// Delete enrollment (Admin only)
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

module.exports = {
  createEnrollment,
  getEnrollments,
  getEnrollment,
  updateEnrollment,
  approveEnrollment,
  rejectEnrollment,
  getEnrollmentStats,
  getFeeDelays,
  deleteEnrollment,
  addActivity
};