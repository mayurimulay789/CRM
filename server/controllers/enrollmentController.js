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
                <th class="label-cell" style="text-align: center;">Sr.</th>
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
    /* ===== EXACT STYLES FROM ADMISSION TEMPLATE ===== */
    body {
      margin: 0;
      padding: 0;
      background-color: #f3e5e5;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    .email-container {
      max-width: 1200px;
      margin: auto;
      background-color: #ffffff;
      overflow: hidden;
      box-shadow: 0 12px 28px rgba(150, 30, 30, 0.2);
    }

    /* Gradient header (from admission) */
    .header {
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
      margin-bottom: 16px;
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

    .congrats-big {
      font-size: 20px;
      font-weight: 800;
      color: #aa2d2d;
      margin: 5px 0 10px;
      text-transform: uppercase;
      line-height: 1.2;
    }

    .message {
      font-size: 16px;
      color: #3a2a2a;
      line-height: 1.5;
      margin: 15px 0 10px;
    }

    /* Highlight block (styled like .family-block) */
    .family-block {
      padding: 16px 20px;
      margin: 20px 0;
      color: #572626;
      font-weight: 500;

    }

    .director-quote {
      padding: 22px 26px;
      margin: 20px 0 25px;
    }

    .quote-mark {
      font-size: 40px;
      color: #b44848;
      font-family: 'Times New Roman', serif;
      line-height: 0.6;
      margin-right: 4px;
    }

    .director-quote p {
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

    .section-title {
      font-weight: 700;
      color: #aa2929;
      border-bottom: 3px solid #e0adad;
      padding-bottom: 10px;
      margin: 30px 0 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .section-title {
      font-size: 12px;
    }

    @media (min-width: 768px) {
      .section-title {
        font-size: 22px;
      }
    }

    @media (min-width: 1200px) {
      .section-title {
        font-size: 28px;
      }
    }

    /* Table styles (admission-table) */
    .admission-table {
      width: 100%;
      border-collapse: collapse;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 6px 18px rgba(150, 40, 40, 0.1);
      border: 1px solid #e9c1c1;
      margin-bottom: 25px;
    }

    .admission-table td {
      padding: 14px 20px;
      border-bottom: 1px solid #f2d6d6;
      font-size: 16px;
    }

    .admission-table tr:last-child td {
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

    /* Responsive stacking for mobile (from enrollment) */
    @media screen and (max-width: 600px) {

      .admission-table,
      .admission-table tbody,
      .admission-table tr,
      .admission-table td {
        display: block;
        width: 100%;
        box-sizing: border-box;
      }

      .admission-table tr {
        margin-bottom: 1.5rem;
        border: 1px solid #e9c1c1;
        border-radius: 12px;
        padding: 0.25rem 0;
        background: #fff;
      }

      .admission-table td {
        border: none;
        border-bottom: 1px solid #f2d6d6;
        padding: 12px 16px;
        width: 100% !important;
      }

      .admission-table td:last-child {
        border-bottom: none;
      }

      .label-cell {
        border-right: none;
        background-color: #fde5e5;
        font-weight: 700;
      }

      .value-cell {
        background-color: #fffbfb;
      }
    }

    /* Documents section (exactly as admission) */
    .documents-section {
      background: #fef0f0;
      border-radius: 20px;
      padding: 20px;
      margin: 25px 0;
      border: 1px solid #e6b2b2;
    }

    .documents-section h3 {
      color: #aa2929;
      margin-top: 0;
      border-bottom: 2px solid #e0adad;
      padding-bottom: 8px;
    }

    .documents-section ul {
      list-style: none;
      padding: 0;
      margin: 10px 0 0;
    }

    .documents-section li {
      margin: 12px 0;
      padding: 10px;
      background: white;
      border-radius: 8px;
      border-left: 5px solid #b13e3e;
    }

    .documents-section a {
      color: #b13e3e;
      text-decoration: none;
      font-weight: bold;
    }

    .footnote {
      padding: 18px 24px;
      margin: 28px 0 20px;
      color: #792e2e;
      font-size: 15px;
      text-align: center;
    }

    hr {
      border: none;
      height: 2px;
      background: linear-gradient(to right, #efc2c2, #c96666, #efc2c2);
      margin: 28px 0;
    }

    /* Email-safe contact table (from admission) */
    .contact-table {
      width: 100%;
      margin: 20px 0;
    }

    .contact-table td {
      padding: 18px 25px;


      color: #6d3131;
      font-size: 15px;
      text-align: center;
    }

    .contact-table a {
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

    .imgformate {
      width: 100%;
      max-width: 1200px;
      height: auto;
      display: block;
    }

    /* Additional styles from enrollment */
    .warning-note {

      padding: 18px 24px;

      margin: 28px 0 20px;
      color: #792e2e;
      font-size: 15px;
      text-align: center;

    }

    .signature {
      margin: 30px 0 20px;
      color: #592525;
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
  </style>
</head>

<body>
  <div class="email-container">
    <!-- Gradient header (from admission) -->
    <div class="header">
      RYMA ACADEMY
    </div>

    <!-- Header image (from admission) -->
    <img src="https://res.cloudinary.com/dk9lypgfv/image/upload/v1773463891/Screenshot_2026-03-11_141445_ar7p06.png"
      alt="RYMA Academy Banner" class="imgformate">

    <div class="content">
      <!-- Greeting and intro (enrollment content) -->
      <div class="greeting">Dear <strong>${enrollment.student?.name || 'Student'}</strong>,</div>
      <div class="office-line">Greetings from the Office of Academic Affairs, RYMA ACADEMY.</div>

      <div class="message">
        Congratulations! Your enrollment has been <strong>approved</strong>. You have now been formally enrolled as an
        official student of RYMA ACADEMY. Your unique
        Enrollment ID has been issued — <strong>${enrollment.enrollmentNo}</strong>. This is your academic identity and
        will
        be required for all academic, administrative, and certification purposes throughout your program.
      </div>

      <!-- Highlight block (styled like family-block) -->
      <div class="family-block">
        ⚡ Kindly save this email permanently. It is your official enrollment record.
      </div>

      <!-- SECTION 1: OFFICIAL ENROLLMENT RECORD -->
      <div class="section-title">OFFICIAL ENROLLMENT RECORD — RYMA ACADEMY</div>
      <table class="admission-table" cellpadding="0" cellspacing="0">
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

      <!-- SECTION 2: PROGRAM DETAILS -->
      <div class="section-title">PROGRAM DETAILS</div>
      <table class="admission-table" cellpadding="0" cellspacing="0">
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

      <!-- SECTION 3: FEE DETAILS -->
      <div class="section-title">FEE DETAILS</div>
      <table class="admission-table" cellpadding="0" cellspacing="0">
        <tr>
          <td class="label-cell">Program Fee (Total Amount)</td>
          <td class="value-cell"><strong>₹${enrollment.totalAmount || 0}</strong></td>
        </tr>
        <tr>
          <td class="label-cell">Registration Payment</td>
          <td class="value-cell"><strong>₹${enrollment.admissionRegistrationPayment || 0}</strong></td>
        </tr>
        <tr>
          <td class="label-cell">Due amount to Pay</td>
          <td class="value-cell"><strong>₹${(enrollment.totalAmount || 0) - (enrollment.admissionRegistrationPayment ||
              0)}</strong></td>
        </tr>
        <tr>
          <td class="label-cell">Fee Type</td>
          <td class="value-cell"><strong>${enrollment.feeType === 'one-time' ? 'One Time Payment' :
              'Installment'}</strong></td>
        </tr>
      </table>

      <!-- Installment table (if any) -->
      ${installmentTableHTML}

      <!-- DOCUMENTS SECTION (from admission, with policy document) -->
      <div class="documents-section">
        <h3>📄 Your Enrollment Documents</h3>
        <ul>
          <li>
            <strong>Policy Document</strong><br>
            <a href='https://res.cloudinary.com/dk9lypgfv/image/upload/fl_attachment/v1773464584/RYMA_ACADEMY_PRIVACY_POLICIES_xjurml.pdf'
              download="RYMA_ACADEMY_Privacy_Policies.pdf" target="_blank" rel="noopener noreferrer">
              📥 Download Privacy Policies (PDF)
            </a>
          </li>
        </ul>
        <p style="font-size:0.9em; color:#666;">Right-click and "Save As" if the download does not start automatically.
        </p>
      </div>

      <!-- Verification warning -->
      <div class="warning-note">
        ⚠️ <strong>Please verify all details carefully.</strong> Any discrepancy must be reported to your
        Education Counsellor within 48 hours.
      </div>

      <!-- Director's quote (from enrollment) -->
      <div class="director-quote">
        <span class="quote-mark">“</span>
        <p>At RYMA ACADEMY, we believe every great journey begins with a single, courageous step forward. You
          have taken that step. Now let us walk the rest of this path — together.</p>
        <div class="director-name">~ Mr. Parveen Jain | Director, RYMA ACADEMY</div>
      </div>

      <!-- Signature block -->
      <div class="signature">
        With the highest regards & warmest welcome,<br>
        <strong>Team of Admissions & Student Services</strong><br>
        RYMA ACADEMY
      </div>

      <!-- Contact footer (table-based, email-safe) -->
      <table class="contact-table" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            📞 +91-9873336133<br>
            📧 <a href="mailto:services@rymaacademy.com">services@rymaacademy.com</a><br>
            🌐 <a href="https://www.rymaacademy.com">www.rymaacademy.com</a><br>
            📍 D-7/32, 1st Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085
          </td>
        </tr>
      </table>
    </div> <!-- end content -->

    <!-- Disclaimer and footer -->
    <div class="disclaimer">
      <strong>Disclaimer:</strong> This is an electronically generated communication.
    </div>
    <div class="footer-red">
      © RYMA ACADEMY – Official Enrollment Record
    </div>
  </div> <!-- end email-container -->
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
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RYMA ACADEMY – Application Status</title>
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
           
            padding: 18px 24px;
           
            margin: 28px 0 20px;
            color: #792e2e;
            font-size: 15px;
            text-align: center;
           
        }

        .help-box {
           
          
            padding: 18px 25px;
            margin: 25px 0;
        
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
           
            padding: 18px 25px;
           
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
            display: block;
        }

        /* ----- RESPONSIVE STACKING FOR TABLES ----- */
        @media screen and (max-width: 600px) {
            /* Make header image fluid */
            .imgformate {
                width: 100%;
                height: auto;
                max-width: 100%;
            }

            /* Adjust content padding */
            .content {
                padding: 20px 16px;
            }

            /* Convert tables to block layout */
            .enroll-table,
            .enroll-table tbody,
            .enroll-table tr,
            .enroll-table td {
                display: block;
                width: 100%;
                box-sizing: border-box;
            }

            /* Each row becomes a card */
            .enroll-table tr {
                margin-bottom: 1.5rem;
                border: 1px solid #e9c1c1;
                border-radius: 12px;
                padding: 0;
                background: #fff;
            }

            /* Cells stack vertically */
            .enroll-table td {
                border: none;
                border-bottom: 1px solid #f2d6d6;
                padding: 12px 16px;
                width: 100% !important;
            }

            .enroll-table td:last-child {
                border-bottom: none;
            }

            /* Adjust label cell for mobile */
            .label-cell {
                border-right: none;
                background-color: #fde5e5;
                font-weight: 700;
            }

            .value-cell {
                background-color: #fffbfb;
            }

            /* Optional: keep section titles readable */
            .section-title {
                font-size: 20px;
                margin: 25px 0 15px;
            }

            /* Adjust warning/help boxes */
            .warning-note,
            .help-box {
                padding: 15px 20px;
                border-radius: 30px 8px 30px 8px;
            }

            .contact-footer {
                padding: 15px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="enrollment-container">
        <!-- Same header image as original (or could be replaced with a rejection-specific one) -->
        <img src="https://res.cloudinary.com/dk9lypgfv/image/upload/v1773463891/Screenshot_2026-03-11_141445_ar7p06.png" alt="RYMA ACADEMY Banner" class="imgformate">

        <div class="content">
            <div class="greeting">Dear <strong>${enrollment.student?.name || 'Student'}</strong>,</div>
            <div class="office-line">Greetings from the Office of Academic Affairs, RYMA ACADEMY.</div>

            <div class="message">
                We have completed the review of your enrollment application. After careful consideration, we regret to inform you that your application has been <strong>rejected</strong>.
            </div>

            <!-- Rejection status badge (styled like the highlight but with different emphasis) -->
            <div class="warning-note">
                ⛔ <strong>Enrollment Rejected</strong> — Your application did not meet the required criteria at this time.
            </div>

            <!-- Optional: Show submitted details for reference -->
            <div class="section-title">Application Summary</div>
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
            <!-- services / Next steps box (like help-box) -->
            <div class="help-box">
                <strong>📞 Need assistance?</strong> If you have questions about this decision or would like to discuss alternative programs, please contact our admissions team. We're here to help you explore your options.
            </div>
            <div class="signature">
                With sincere regards,<br>
                <strong>Admissions & Student Services</strong><br>
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
            <strong>Disclaimer:</strong> This is an electronically generated communication. The information contained herein reflects the official decision of the admissions committee.
        </div>
        <div class="footer-red">
            © RYMA ACADEMY – Official Correspondence
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