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
      trainingBranch,
      mode,
      totalAmount,
      discount = 0,
      feeType,
      firstEMI,
      secondEMI,
      thirdEMI,
      dueDate,
      charges,
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

    // Calculate actual total including late fees and registration payment
    const actualTotal = (totalAmount || 0) + (charges || 0) + (admissionRegistrationPayment || 0);

    // EMI validation for installment fee type
    if (feeType === 'installment') {
      const firstEMIAmount = firstEMI?.amount || 0;
      const secondEMIAmount = secondEMI?.amount || 0;
      const thirdEMIAmount = thirdEMI?.amount || 0;
      const totalEMI = firstEMIAmount + secondEMIAmount + thirdEMIAmount;

      if (totalEMI !== actualTotal) {
        return res.status(400).json({
          success: false,
          message: `EMI total (₹${totalEMI}) must match total amount (₹${actualTotal}). [Base: ₹${totalAmount} + Late Fees: ₹${charges || 0} + Registration: ₹${admissionRegistrationPayment || 0}]`
        });
      }

      // Validate EMI dates if amounts are provided
      const emis = [
        { name: 'First EMI', data: firstEMI },
        { name: 'Second EMI', data: secondEMI },
        { name: 'Third EMI', data: thirdEMI }
      ];

      for (const emi of emis) {
        if (emi.data?.amount > 0 && !emi.data?.date) {
          return res.status(400).json({
            success: false,
            message: `${emi.name} date is required when amount is provided`
          });
        }
      }
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

    // Create enrollment
    const enrollment = new Enrollment({
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
      charges: charges || 0,
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
    function formatDateToDDMMYYYY(isoString) {
      const date = new Date(isoString);
      // Use UTC methods to avoid timezone shifts
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    }

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

        /* header image area – placeholder */
        .header-image {
            width: 100%;
            background-color: #b31b1b;
            /* fallback */
            text-align: center;
            line-height: 0;
        }

        .header-image img {
            width: 100%;
            height: auto;
            display: block;
            max-height: 180px;
            object-fit: cover;
            background-color: #8a1e1e;
        }

        .img-placeholder {
            display: inline-block;
            width: 100%;
            background: linear-gradient(145deg, #b22222, #8b1a1a);
            color: white;
            font-size: 32px;
            font-weight: 800;
            text-align: center;
            padding: 40px 20px;
            box-sizing: border-box;
            letter-spacing: 4px;
            text-transform: uppercase;
            border-bottom: 4px solid #f3c3c3;
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

        .enroll-table td {
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

        .contact-block {
            background: #fae1e1;
            padding: 14px 18px;
            border-radius: 30px;
            color: #6d3131;
            font-size: 15px;
            margin: 20px 0;
            word-break: break-word;
        }

        .contact-block a {
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

        hr {
            border: none;
            height: 2px;
            background: linear-gradient(to right, #efc2c2, #c96666, #efc2c2);
            margin: 28px 0;
        }

        .note-placeholder {
            font-size: 13px;
            color: #946060;
            background: #faf0f0;
            padding: 6px 10px;
            border-radius: 50px;
            margin-top: 8px;
            text-align: center;
        }
    </style>
</head>

<body>
    <div class="enrollment-container">
        <img src=${server/assets/header.png} alt="RYMA ACADEMY" style="width: 100%; max-width: 1200px;">
        <!-- Header image area: replace src with your actual banner/logo -->

        <div class="content">
            <!-- Dear student -->
            <div class="greeting">Dear <strong>${enrollment.student.name || 'Student'}</strong>,</div>
            <div class="office-line">Greetings from the Office of Academic Affairs, RYMA ACADEMY.</div>

            <!-- enrollment intro -->
            <div class="message">
                You have now been formally enrolled in system as an official student of RYMA ACADEMY. Your unique
                Enrollment ID has been issued — <strong>${enrollment.enrollmentNo}</strong>. This is your academic identity and will
                be required for all academic, administrative, and certification purposes throughout your program.
            </div>

            <div class="highlight">
                ⚡ Kindly save this email permanently. It is your official enrollment record.
            </div>

            <!-- OFFICIAL ENROLLMENT RECORD section -->
            <div class="section-title">OFFICIAL ENROLLMENT RECORD — RYMA ACADEMY</div>

            <!-- Personal details table -->
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Student Name</td>
                    <td class="value-cell"><strong>${enrollment.student.name || 'Student'}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Enrollment ID</td>
                    <td class="value-cell"><strong>${enrollment.enrollmentNo}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Date of Birth</td>
                    <td class="value-cell"><strong>${enrollment.student.dateOfBirth}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Registered Mobile</td>
                    <td class="value-cell"><strong>${enrollment.student.phone}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Registered Email</td>
                    <td class="value-cell"><strong>${enrollment.student.email}</strong></td>
                </tr>
            </table>

            <!-- PROGRAM DETAILS section -->
            <div class="section-title">PROGRAM DETAILS</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Program Enrolled</td>
                    <td class="value-cell"><strong>${enrollment.course?.name || 'N/A'}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Program Duration</td>
                    <td class="value-cell"><strong>${enrollment.course.duration}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Batch Code</td>
                    <td class="value-cell"><strong>${enrollment.batch.code}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Batch Timings</td>
                    <td class="value-cell"><strong>${enrollment.batch.timing}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Mode of Learning</td>
                    <td class="value-cell"><strong>${enrollment.mode || 'N/A'}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Campus</td>
                    <td class="value-cell"><strong>${enrollment.trainingBranch || 'N/A'}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">Enrollment Date</td>
                    <td class="value-cell"><strong> ${formatDateToDDMMYYYY(enrollment.enrollmentDate)}</strong></td>
                </tr>
            </table>

            <!-- verification warning (exact wording) -->
            <div class="warning-note">
                ⚠️ <strong>Please verify all details carefully.</strong> Any discrepancy must be reported to your
                Education Counsellor within 48 hours. RYMA ACADEMY shall not be held responsible for errors arising from
                unverified or incorrect information submitted at the time of admission.
            </div>

            <!-- need assistance box -->
            <div class="help-box">
                <strong>⚠️ Need assistance?</strong> We are always here to help — reach out to your Education Counsellor
                or contact us at <strong>+91-9873336133</strong> | <a
                    href="mailto:services@rymaacademy.com">services@rymaacademy.com</a>
            </div>

            <!-- inspirational quote (from both screenshots) -->
            <div class="quote-block">
                <span class="quote-mark">“</span>
                <p>At RYMA ACADEMY, we believe every great journey begins with a single, courageous step forward. You
                    have taken that step. Now let us walk the rest of this path — together.</p>
                <div class="director-name">~ Mr. Parveen Jain | Director, RYMA ACADEMY</div>
            </div>

            <!-- signature -->
            <div class="signature">
                With the highest regards & warmest welcome,<br>
                <strong>Team of Admissions & Student Services</strong><br>
                RYMA ACADEMY
            </div>

            <!-- contact block (with icons as text) -->
            <div
                style="background: #fae1e1; padding: 18px 25px; border-radius: 30px; color: #6d3131; font-size: 15px; margin: 20px 0;display:flex;flex-direction:row; justify-content:center ;align-items: center;">
                +91-9873336133 <a href="mailto:services@rymaacademy.com"
                    style="color: #a13030; margin-left: 8px;">services@rymaacademy.com</a> <a href="#"
                    style="color: #a13030;margin-left: 8px; margin-right: 5px;">www.rymaacademy.com</a> 📍 D-7/32, 1st
                Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085
            </div>

            <!-- small note about image placeholder (can be removed in production) -->
            <div class="note-placeholder">
                ⚡ Replace the header image source with your actual logo.
            </div>
        </div>

        <!-- disclaimer footer (red dark) -->
        <div class="disclaimer">
            <strong>Disclaimer:</strong> This is an electronically generated communication and does not require a
            physical signature or stamp. Please do not print this email unless it is absolutely necessary. The
            information contained in this email is confidential to the addressee and may be protected by legal
            privilege. If you are not the intended recipient, please note that you may not disseminate, retransmit, or
            make any other use of any material in this message. If you have received this email in error, please delete
            it and notify us immediately by telephone or email.
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
        'batch', 'mode', 'firstEMI', 'secondEMI', 'thirdEMI',
        'dueDate', 'charges', 'call', 'trainingBranch', 'feeType',
        'totalAmount', 'actualAmount', 'discount', 'leadDate', 'leadSource', 'admissionRegistrationPayment'
      ];
    } else if (userRole === 'admin') {
      allowedUpdates = [
        'batch', 'mode', 'status', 'firstEMI', 'secondEMI', 'thirdEMI',
        'dueDate', 'charges', 'call', 'trainingBranch', 'feeType',
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

    // EMI validation for installment fee type (before saving)
    if (enrollment.feeType === 'installment') {
      // Calculate actual total including late fees and registration payment
      const actualTotal = (enrollment.totalAmount || 0) + (enrollment.charges || 0) + (enrollment.admissionRegistrationPayment || 0);

      const firstEMIAmount = enrollment.firstEMI?.amount || 0;
      const secondEMIAmount = enrollment.secondEMI?.amount || 0;
      const thirdEMIAmount = enrollment.thirdEMI?.amount || 0;
      const totalEMI = firstEMIAmount + secondEMIAmount + thirdEMIAmount;

      if (totalEMI !== actualTotal) {
        console.log('❌ EMI validation failed - Total mismatch:', {
          totalEMI,
          actualTotal,
          baseAmount: enrollment.totalAmount,
          charges: enrollment.charges,
          registrationPayment: enrollment.admissionRegistrationPayment
        });
        return res.status(400).json({
          success: false,
          message: `EMI total (₹${totalEMI}) must match total amount (₹${actualTotal}). [Base: ₹${enrollment.totalAmount} + Late Fees: ₹${enrollment.charges || 0} + Registration: ₹${enrollment.admissionRegistrationPayment || 0}]`
        });
      }

      // Validate EMI dates if amounts are provided
      const emis = [
        { name: 'First EMI', data: enrollment.firstEMI },
        { name: 'Second EMI', data: enrollment.secondEMI },
        { name: 'Third EMI', data: enrollment.thirdEMI }
      ];

      for (const emi of emis) {
        if (emi.data?.amount > 0 && !emi.data?.date) {
          console.log('❌ EMI validation failed - Missing date for:', emi.name);
          return res.status(400).json({
            success: false,
            message: `${emi.name} date is required when amount is provided`
          });
        }
      }
    }

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