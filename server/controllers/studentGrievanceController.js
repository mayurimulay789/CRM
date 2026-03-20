const StudentGrievance = require("../models/StudentGrievance");
const Admission = require("../models/Admission");
const { sendMail } = require("../utils/email");

const BCC_EMAIL = process.env.BCC_EMAIL || null; // hidden admin mail

function formatDate(dateString, options = {}) {
            if (!dateString) return '';

            const date = new Date(dateString);
            // Check if date is valid
            if (isNaN(date.getTime())) return '';

            const defaultOptions = {
                year: 'numeric',
                month: 'long',   // "March"
                day: 'numeric',  // "18"
                timeZone: 'UTC'  // Use UTC to avoid offset shifts (optional)
            };

            const formatter = new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options });
            return formatter.format(date);
        }

// Student submits complaint (via counsellor)
exports.submitGrievance = async (req, res) => {
    try {
        const grievanceData = {
            ...req.body,
            counsellorId: req.user._id,
            status: "submittedToAdmin",
        };

        const grievance = await StudentGrievance.create(grievanceData);

        const populatedGrievance = await StudentGrievance.findById(grievance._id).populate("counsellorId", "FullName email");
        const counsellorName = populatedGrievance?.counsellorId?.FullName || "Your Counsellor";

        const submissionHtml = `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grievance acknowledgement – RYMA ACADEMY</title>
  <style>
    /* ===== BASE STYLES – RYMA ACADEMY CONTAINER + BLUE THEME ===== */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Roboto, Arial, sans-serif;
    }

    body {
      background-color: #f2e5e5; /* light red background outside container */
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 24px 16px;
      margin: 0;
    }

    .enrollment-container {
      max-width: 1200px;
      width: 100%;
      background-color: #ffffff;
      box-shadow: 0 12px 28px rgba(150, 30, 30, 0.2);
      overflow: hidden;
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
      color: #b13e3e; /* keep red for name contrast */
    }

    .office-line {
      color: #1e3c5c; /* blue */
      font-weight: 700;
      margin: 5px 0 15px;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .intro-text {
      font-size: 16px;
      color: #3a2a2a;
      line-height: 1.5;
      margin: 15px 0 10px;
    }

    /* ----- DETAILS GRID (blue theme) ----- */
    .details-grid {
      background-color: #f2f6fc;        /* light blue */
      border-radius: 20px;
      padding: 22px 24px;
      margin: 25px 0 28px;
      border: 1px solid #d0e0f0;
      box-shadow: 0 4px 12px rgba(30, 60, 92, 0.08);
    }

    .detail-item {
      margin-bottom: 18px;
    }

    .detail-item:last-child {
      margin-bottom: 0;
    }

    .detail-label {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #1e3c5c;                  /* dark blue */
      margin-bottom: 4px;
    }

    .detail-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: #0b2b40;                   /* dark navy */
      line-height: 1.3;
      word-break: break-word;
    }

    /* Status badge (yellow, for visibility) */
    .status-badge {
      display: inline-block;
      background-color: #ffc107;
      color: #1e1e1e;
      font-weight: 600;
      padding: 6px 16px;
      border-radius: 40px;
      font-size: 1rem;
      letter-spacing: 0.3px;
    }

    /* ----- MESSAGE BLOCKS ----- */
    .message-block {
      color: #3a2a2a;
      line-height: 1.6;
      margin: 20px 0;
      font-size: 16px;
    }

    .message-block strong {
      color: #1e3c5c;                   /* blue emphasis */
    }

    .assist-text {
      font-weight: 600;
      color: #1e3c5c;
      margin: 25px 0 10px;
      font-size: 16px;
    }

    /* ----- CONTACT TABLE (blue-themed, matching enrollment table structure) ----- */
    .contact-table {
      width: 100%;
      border-collapse: collapse;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 6px 18px rgba(30, 60, 92, 0.1);
      border: 1px solid #d0e0f0;
      margin: 20px 0 25px;
    }

    .contact-table td {
      padding: 14px 20px;
      border-bottom: 1px solid #e2eaf2;
      font-size: 16px;
    }

    .contact-table tr:last-child td {
      border-bottom: none;
    }

    .contact-table td:first-child {
      background-color: #f2f6fc;
      color: #1e3c5c;
      font-weight: 700;
      width: 38%;
      border-right: 1px solid #d0e0f0;
    }

    .contact-table td:last-child {
      background-color: #ffffff;
      color: #0b2b40;
    }

    .contact-link {
      color: #0d6efd;
      text-decoration: underline;
      font-weight: 600;
    }

    .call-now {
      font-weight: 600;
      color: #1e3c5c;
    }

    /* ----- SIGNATURE BLOCK ----- */
    .signature-block {
      margin-top: 30px;
      border-top: 1px dashed #b6c9db;
      padding-top: 22px;
    }

    .regards-line {
      font-weight: 500;
      color: #1e3c5c;
      margin-bottom: 6px;
    }

    .office-name {
      font-weight: 700;
      color: #002d4c;
      font-size: 1.1rem;
      margin-top: 6px;
    }

    /* ----- DISCLAIMER & FOOTER (RYMA red footer) ----- */
    .disclaimer {
      margin-top: 24px;
      font-size: 0.75rem;
      color: #555;
      text-align: center;
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

    /* ----- RESPONSIVE STACKING (mobile, for contact table) ----- */
    @media screen and (max-width: 600px) {
      .content {
        padding: 20px 16px;
      }

      /* Stack contact table on mobile */
      .contact-table,
      .contact-table tbody,
      .contact-table tr,
      .contact-table td {
        display: block;
        width: 100%;
        box-sizing: border-box;
      }

      .contact-table tr {
        margin-bottom: 1.5rem;
        border: 1px solid #d0e0f0;
        border-radius: 12px;
        padding: 0;
        background: #fff;
      }

      .contact-table td {
        border: none;
        border-bottom: 1px solid #e2eaf2;
        padding: 12px 16px;
        width: 100% !important;
      }

      .contact-table td:last-child {
        border-bottom: none;
      }

      .contact-table td:first-child {
        border-right: none;
        background-color: #f2f6fc;
      }

      .contact-table td:last-child {
        background-color: #ffffff;
      }

      /* Adjust details grid padding */
      .details-grid {
        padding: 18px 20px;
      }

      .detail-value {
        font-size: 1.1rem;
      }
    }
  </style>
</head>
<body>
  <div class="enrollment-container">
    <!-- Header image (same as all official templates) -->
    <img src="https://res.cloudinary.com/dk9lypgfv/image/upload/v1773463891/Screenshot_2026-03-11_141445_ar7p06.png"
      alt="RYMA ACADEMY Banner" class="imgformate">

    <div class="content">
      <!-- Greeting with placeholder (red name for emphasis) -->
      <div class="greeting">Dear <strong>${grievance.studentName}</strong>,</div>

      <!-- Office line (blue) -->
      <div class="office-line">OFFICE OF GRIEVANCE CELL</div>

      <!-- Confirmation intro -->
      <div class="intro-text">
        This is to confirm that your grievance has been successfully registered with the Office of Grievance Cell. Your
        complaint is currently under evaluation by the designated review committee.
      </div>

      <!-- Complaint details grid (blue theme) -->
      <div class="details-grid">
        <div class="detail-item">
          <div class="detail-label">COMPLAINT NUMBER</div>
          <div class="detail-value">${grievance._id}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">STATUS</div>
          <div class="detail-value"><span class="status-badge">UNDER EVALUATION</span></div>
        </div>
        <div class="detail-item">
          <div class="detail-label">SUBJECT</div>
          <div class="detail-value">${grievance.subject || 'No subject specified'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">SUBMITTED ON</div>
          <div class="detail-value">${formatDate(grievance.createdAt)}</div>
        </div>
      </div>

      <!-- Representative contact message -->
      <div class="message-block">
        A representative from the Grievance Cell may contact you at your registered mobile number or email address
        within <strong>48–72 hours</strong> should any additional information be required to facilitate the review
        process.
      </div>

      <div class="message-block" style="margin-top: 8px;">
        Should you have any queries in the interim, please do not hesitate to reach us through the channels listed
        below.
      </div>

      <!-- Assistance line -->
      <div class="assist-text">
        It would be our pleasure to assist you in case you require any help, you can connect with us through the
        following modes:
      </div>

      <!-- Contact table (blue-themed) -->
      <table class="contact-table">
        <tr>
          <td>Helpline Number</td>
          <td><span class="call-now">Call us at</span> <a href="tel:9873336133" class="contact-link">9873336133</a></td>
        </tr>
        <tr>
          <td>Email ID</td>
          <td><span class="call-now">Write to us at</span> <a href="mailto:services@rymacademy.com" class="contact-link">services@rymacademy.com</a></td>
        </tr>
        <tr>
          <td>Website</td>
          <td><a href="#" class="contact-link">Click here to know more</a></td>
        </tr>
      </table>

      <!-- Signature block -->
      <div class="signature-block">
        <div class="regards-line">Regards,</div>
        <div style="font-weight: 500; color: #1e3c5c;">Office of Grievance Cell</div>
        <div style="margin: 4px 0 2px; color: #3a2a2a;">Authorised Signatory</div>
        <div class="office-name">RYMA ACADEMY</div>
      </div>

      <!-- Disclaimer -->
      <div class="disclaimer">
        <strong>Disclaimer:</strong> This is an auto-generated email. Please do not reply directly to this message.
      </div>
    </div>
  </div>
</body>
</html>
    `;

        try {
            // Send email to student + BCC to admin (only here)
            await sendMail(grievance.studentEmail, "📋 Complaint Registered - Ryma Academy", submissionHtml, BCC_EMAIL);
        } catch (emailError) {
            console.error("Email sending failed:", emailError.message);
        }

        res.status(201).json({ message: "Complaint submitted successfully", grievance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Counsellor view their complaints
exports.getCounsellorGrievances = async (req, res) => {
    try {
        const grievances = await StudentGrievance.find({ counsellorId: req.user._id });
        res.status(200).json(grievances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin view all complaints
exports.getAllGrievances = async (req, res) => {
    try {
        const grievances = await StudentGrievance.find().populate("counsellorId", "FullName email role");
        res.status(200).json(grievances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single complaint by ID
exports.getGrievanceById = async (req, res) => {
    try {
        const grievance = await StudentGrievance.findById(req.params.id).populate("counsellorId", "FullName email role");
        if (!grievance) return res.status(404).json({ message: "Complaint not found" });
        res.status(200).json(grievance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Approve complaint
exports.approveGrievance = async (req, res) => {
    try {
        const grievance = await StudentGrievance.findById(req.params.id).populate("counsellorId", "FullName email role");
        if (!grievance) return res.status(404).json({ message: "Complaint not found" });

        grievance.status = "approved";
        grievance.adminResponse = req.body.adminResponse;
        grievance.adminId = req.user._id;
        await grievance.save();

        const approvalHtml = `
       <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grievance acknowledgement – RYMA ACADEMY</title>
  <style>
    /* ===== BASE STYLES – RYMA ACADEMY CONTAINER + BLUE THEME ===== */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Roboto, Arial, sans-serif;
    }

    body {
      background-color: #f2e5e5; /* light red background outside container */
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 24px 16px;
      margin: 0;
    }

    .enrollment-container {
      max-width: 1200px;
      width: 100%;
      background-color: #ffffff;
      box-shadow: 0 12px 28px rgba(150, 30, 30, 0.2);
      overflow: hidden;
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
      color: #b13e3e; /* keep red for name contrast */
    }

    .office-line {
      color: #1e3c5c; /* blue */
      font-weight: 700;
      margin: 5px 0 15px;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .intro-text {
      font-size: 16px;
      color: #3a2a2a;
      line-height: 1.5;
      margin: 15px 0 10px;
    }

    /* ----- DETAILS GRID (blue theme) ----- */
    .details-grid {
      background-color: #f2f6fc;        /* light blue */
      border-radius: 20px;
      padding: 22px 24px;
      margin: 25px 0 28px;
      border: 1px solid #d0e0f0;
      box-shadow: 0 4px 12px rgba(30, 60, 92, 0.08);
    }

    .detail-item {
      margin-bottom: 18px;
    }

    .detail-item:last-child {
      margin-bottom: 0;
    }

    .detail-label {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #1e3c5c;                  /* dark blue */
      margin-bottom: 4px;
    }

    .detail-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: #0b2b40;                   /* dark navy */
      line-height: 1.3;
      word-break: break-word;
    }

    /* Status badge (yellow, for visibility) */
    .status-badge {
      display: inline-block;
      background-color: #ffc107;
      color: #1e1e1e;
      font-weight: 600;
      padding: 6px 16px;
      border-radius: 40px;
      font-size: 1rem;
      letter-spacing: 0.3px;
    }

    /* ----- MESSAGE BLOCKS ----- */
    .message-block {
      color: #3a2a2a;
      line-height: 1.6;
      margin: 20px 0;
      font-size: 16px;
    }

    .message-block strong {
      color: #1e3c5c;                   /* blue emphasis */
    }

    .assist-text {
      font-weight: 600;
      color: #1e3c5c;
      margin: 25px 0 10px;
      font-size: 16px;
    }

    /* ----- CONTACT TABLE (blue-themed, matching enrollment table structure) ----- */
    .contact-table {
      width: 100%;
      border-collapse: collapse;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 6px 18px rgba(30, 60, 92, 0.1);
      border: 1px solid #d0e0f0;
      margin: 20px 0 25px;
    }

    .contact-table td {
      padding: 14px 20px;
      border-bottom: 1px solid #e2eaf2;
      font-size: 16px;
    }

    .contact-table tr:last-child td {
      border-bottom: none;
    }

    .contact-table td:first-child {
      background-color: #f2f6fc;
      color: #1e3c5c;
      font-weight: 700;
      width: 38%;
      border-right: 1px solid #d0e0f0;
    }

    .contact-table td:last-child {
      background-color: #ffffff;
      color: #0b2b40;
    }

    .contact-link {
      color: #0d6efd;
      text-decoration: underline;
      font-weight: 600;
    }

    .call-now {
      font-weight: 600;
      color: #1e3c5c;
    }

    /* ----- SIGNATURE BLOCK ----- */
    .signature-block {
      margin-top: 30px;
      border-top: 1px dashed #b6c9db;
      padding-top: 22px;
    }

    .regards-line {
      font-weight: 500;
      color: #1e3c5c;
      margin-bottom: 6px;
    }

    .office-name {
      font-weight: 700;
      color: #002d4c;
      font-size: 1.1rem;
      margin-top: 6px;
    }

    /* ----- DISCLAIMER & FOOTER (RYMA red footer) ----- */
    .disclaimer {
      margin-top: 24px;
      font-size: 0.75rem;
      color: black;
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

    /* ----- RESPONSIVE STACKING (mobile, for contact table) ----- */
    @media screen and (max-width: 600px) {
      .content {
        padding: 20px 16px;
      }

      /* Stack contact table on mobile */
      .contact-table,
      .contact-table tbody,
      .contact-table tr,
      .contact-table td {
        display: block;
        width: 100%;
        box-sizing: border-box;
      }

      .contact-table tr {
        margin-bottom: 1.5rem;
        border: 1px solid #d0e0f0;
        border-radius: 12px;
        padding: 0;
        background: #fff;
      }

      .contact-table td {
        border: none;
        border-bottom: 1px solid #e2eaf2;
        padding: 12px 16px;
        width: 100% !important;
      }

      .contact-table td:last-child {
        border-bottom: none;
      }

      .contact-table td:first-child {
        border-right: none;
        background-color: #f2f6fc;
      }

      .contact-table td:last-child {
        background-color: #ffffff;
      }

      /* Adjust details grid padding */
      .details-grid {
        padding: 18px 20px;
      }

      .detail-value {
        font-size: 1.1rem;
      }
    }
  </style>
</head>
<body>
  <div class="enrollment-container">
    <!-- Header image (same as all official templates) -->
    <img src="https://res.cloudinary.com/dk9lypgfv/image/upload/v1773463891/Screenshot_2026-03-11_141445_ar7p06.png"
      alt="RYMA ACADEMY Banner" class="imgformate">

    <div class="content">
      <!-- Greeting with placeholder (red name for emphasis) -->
      <div class="greeting">Dear <strong>${grievance.studentName}</strong>,</div>

      <!-- Office line (blue) -->
      <div class="office-line">OFFICE OF GRIEVANCE CELL</div>

      <!-- Confirmation intro -->
      <div class="intro-text">
        This is to confirm that your grievance has been successfully registered with the Office of Grievance Cell. Your
        complaint is currently approved by the designated review committee.
      </div>

      <!-- Complaint details grid (blue theme) -->
      <div class="details-grid">
        <div class="detail-item">
          <div class="detail-label">COMPLAINT NUMBER</div>
          <div class="detail-value">${grievance._id}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">STATUS</div>
          <div class="detail-value"><span class="status-badge">APPROVED</span></div>
        </div>
        <div class="detail-item">
          <div class="detail-label">SUBJECT</div>
          <div class="detail-value">${grievance.subject || 'No subject specified'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">SUBMITTED ON</div>
          <div class="detail-value">${formatDate(grievance.createdAt)}</div>
        </div>
      </div>

      <!-- Representative contact message -->
      <div class="message-block">
        A representative from the Grievance Cell may contact you at your registered mobile number or email address
        within <strong>48–72 hours</strong> should any additional information be required to facilitate the review
        process.
      </div>

      <div class="message-block" style="margin-top: 8px;">
        Should you have any queries in the interim, please do not hesitate to reach us through the channels listed
        below.
      </div>

      <!-- Assistance line -->
      <div class="assist-text">
        It would be our pleasure to assist you in case you require any help, you can connect with us through the
        following modes:
      </div>

      <!-- Contact table (blue-themed) -->
      <table class="contact-table">
        <tr>
          <td>Helpline Number</td>
          <td><span class="call-now">Call us at</span> <a href="tel:9873336133" class="contact-link">9873336133</a></td>
        </tr>
        <tr>
          <td>Email ID</td>
          <td><span class="call-now">Write to us at</span> <a href="mailto:services@rymacademy.com" class="contact-link">services@rymacademy.com</a></td>
        </tr>
        <tr>
          <td>Website</td>
          <td><a href="#" class="contact-link">Click here to know more</a></td>
        </tr>
      </table>

      <!-- Signature block -->
      <div class="signature-block">
        <div class="regards-line">Regards,</div>
        <div style="font-weight: 500; color: #1e3c5c;">Office of Grievance Cell</div>
        <div style="margin: 4px 0 2px; color: #3a2a2a;">Authorised Signatory</div>
        <div class="office-name">RYMA ACADEMY</div>
      </div>

      <!-- Disclaimer -->
      <div class="disclaimer">
        <strong>Disclaimer:</strong> This is an auto-generated email. Please do not reply directly to this message.
      </div>
    </div>
  </div>
</body>
</html>
    `;

        try {
            // Send mail to student (no BCC)
            await sendMail(grievance.studentEmail, "🎉 Student Complaint Approved - Ryma Academy", approvalHtml);

            // Notify counsellor (no BCC) — only if different from student email
            if (grievance.counsellorId?.email && grievance.counsellorId.email !== grievance.studentEmail) {
                await sendMail(grievance.counsellorId.email, "🎉 Student Complaint Approved - Ryma Academy", approvalHtml);
            }
        } catch (emailError) {
            console.error("Email sending failed:", emailError.message);
        }

        res.status(200).json({ message: "Complaint approved", grievance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reject complaint
exports.rejectGrievance = async (req, res) => {
    try {
        const grievance = await StudentGrievance.findById(req.params.id).populate("counsellorId", "FullName email role");
        if (!grievance) return res.status(404).json({ message: "Complaint not found" });

        grievance.status = "rejected";
        grievance.adminResponse = req.body.adminResponse;
        grievance.adminId = req.user._id;
        await grievance.save();

        const rejectionHtml = `
      <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RYMA ACADEMY – Complaint Status Update</title>
    <style>
        /* ===== BLUE THEME (matching grievance acknowledgement) ===== */
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
            color: #b13e3e; /* keep red for contrast */
        }

        .office-line {
            color: #1e3c5c;
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
            background: #f2f6fc;
            padding: 16px 20px;
            border-radius: 30px 10px 30px 10px;
            margin: 20px 0;
            border-left: 6px solid #1e3c5c;
            color: #0b2b40;
            font-weight: 500;
        }

        /* ----- MOBILE-FIRST SECTION TITLE (blue) ----- */
        .section-title {
            font-size: 12px;
            font-weight: 700;
            color: #1e3c5c;
            border-bottom: 3px solid #d0e0f0;
            padding-bottom: 10px;
            margin: 30px 0 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        @media (min-width: 768px) {
            .section-title {
                font-size: 20px;
            }
        }

        @media (min-width: 1200px) {
            .section-title {
                font-size: 26px;
            }
        }

        /* ----- TABLE STYLES (blue-themed) ----- */
        .enroll-table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 6px 18px rgba(30, 60, 92, 0.1);
            border: 1px solid #d0e0f0;
            margin-bottom: 25px;
        }

        .enroll-table td, .enroll-table th {
            padding: 14px 20px;
            border-bottom: 1px solid #e2eaf2;
            font-size: 16px;
        }

        .enroll-table tr:last-child td {
            border-bottom: none;
        }

        .label-cell {
            background-color: #f2f6fc;
            color: #1e3c5c;
            font-weight: 700;
            width: 42%;
            border-right: 1px solid #d0e0f0;
        }

        .value-cell {
            background-color: #ffffff;
            color: #0b2b40;
            font-weight: 500;
        }

        .value-cell strong {
            color: #1e3c5c;
        }

        .warning-note {
            padding: 18px 24px 0 0;
            color: black;
            font-size: 15px;
        }

        .help-box {
            padding: 18px 25px 0 0;
            margin: 25px 0;
            color: black;
        }

        .help-box a {
            color: #0d6efd;
            font-weight: 600;
            text-decoration: underline;
        }

        .help-box ul {
            margin: 8px 0 0 20px;
            padding-left: 0;
            color: #1e3c5c;
        }

        .quote-block {
            background: #f2f6fc;
            border-radius: 40px 12px 40px 12px;
            padding: 22px 26px;
            margin: 20px 0 25px;
            border: 1px solid #d0e0f0;
            box-shadow: 0 6px 14px rgba(30, 60, 92, 0.1);
        }

        .quote-mark {
            font-size: 40px;
            color: #1e3c5c;
            font-family: 'Times New Roman', serif;
            line-height: 0.6;
            margin-right: 4px;
        }

        .quote-block p {
            font-size: 18px;
            font-style: italic;
            color: #0b2b40;
            margin: 8px 0 10px 0;
            font-weight: 500;
        }

        .director-name {
            font-weight: 700;
            color: #1e3c5c;
            text-align: right;
            font-size: 16px;
        }

        .signature {
            margin: 30px 0 20px;
            color: #0b2b40;
        }

        .contact-footer {
            padding: 18px 50px 0 0;
            color: black;
            font-size: 15px;
            word-break: break-word;
        }

        .contact-footer a {
            color: #0d6efd;
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
            color: black;
            line-height: 1.5;
            padding-left:22px ;
            padding-bottom: 15px;
        }

        .imgformate {
            width: 100%;
            max-width: 1200px;
            height: auto;
            display: block;
        }

        /* ----- RESPONSIVE TABLE STACKING (mobile) ----- */
        @media screen and (max-width: 600px) {
            .content {
                padding: 20px 16px;
            }

            .enroll-table,
            .enroll-table tbody,
            .enroll-table tr,
            .enroll-table td {
                display: block;
                width: 100%;
                box-sizing: border-box;
            }

            .enroll-table tr {
                margin-bottom: 1.5rem;
                border: 1px solid #d0e0f0;
                border-radius: 12px;
                padding: 0;
                background: #fff;
            }

            .enroll-table td {
                border: none;
                border-bottom: 1px solid #e2eaf2;
                padding: 12px 16px;
                width: 100% !important;
            }

            .enroll-table td:last-child {
                border-bottom: none;
            }

            .label-cell {
                border-right: none;
                background-color: #f2f6fc;
            }

            .value-cell {
                background-color: #ffffff;
            }

            .help-box,
            .contact-footer {
                padding: 15px 20px;
                border-radius: 30px 8px 30px 8px;
            }
        }
    </style>
</head>
<body>
    <div class="enrollment-container">
        <!-- Header Image (fluid) -->
        <img src="https://res.cloudinary.com/dk9lypgfv/image/upload/v1773463891/Screenshot_2026-03-11_141445_ar7p06.png" alt="RYMA ACADEMY Banner" class="imgformate">

        <div class="content">
            <div class="greeting">Dear <strong>${grievance.studentName}</strong>,</div>
            <div class="office-line">Greetings from the Office of Academic Affairs, RYMA ACADEMY.</div>

            <div class="message">
                We have completed the review of your complaint. After careful consideration, we regret to inform you that your complaint has been <strong>rejected</strong>. The details of the decision are provided below.
            </div>

            <!-- Rejection status highlight (blue) -->
            <div class="warning-note">
                ❌ <strong>Status: REJECTED</strong> — Your complaint did not meet the criteria for approval at this time.
            </div>

            <!-- Subject Section -->
            <div class="section-title">📝 Subject</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Subject</td>
                    <td class="value-cell"><strong>${grievance.subject || 'No subject specified'}</strong></td>
                </tr>
            </table>

            <!-- Original Complaint Section -->
            <div class="section-title">📋 Your Complaint</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Description</td>
                    <td class="value-cell">${grievance.complaint || 'No complaint details available'}</td>
                </tr>
            </table>

            <!-- Admin Response Section -->
            <div class="section-title">💬 Admin Response</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Response</td>
                    <td class="value-cell">${grievance.adminResponse || 'No specific response provided'}</td>
                </tr>
            </table>

            <!-- Next Steps / Help Box (blue) -->
            <div class="help-box">
                <strong>📞 What You Can Do Next:</strong>
                <ul>
                    <li>Review the admin response carefully for more details.</li>
                    <li>If you have additional evidence or information, you may submit a new complaint.</li>
                    <li>Contact your counsellor to discuss your concerns further.</li>
                    <li>Reach out to student services if you need support or guidance.</li>
                </ul>
            </div>
            <!-- Signature -->
            <div class="signature">
                With sincere regards,<br>
                <strong>Student Grievance Cell</strong><br>
                RYMA ACADEMY
            </div>

            <!-- Contact Footer (blue) -->
            <div class="contact-footer">
                📞 +91-9873336133<br>
                📧 <a href="mailto:services@rymaacademy.com">services@rymaacademy.com</a><br>
                🌐 <a href="https://www.rymaacademy.com">www.rymaacademy.com</a><br>
                📍 D-7/32, 1st Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085
            </div>
        </div>

        <!-- Disclaimer and Footer (red, unchanged) -->
        <div class="disclaimer">
            <strong>Disclaimer:</strong> This is an electronically generated communication. The information contained herein reflects the official decision of the administration regarding your complaint.
        </div>
    </div>
</body>
</html>
    `;

        try {
            // Send mail to student (no BCC)
            await sendMail(grievance.studentEmail, "📋 Student Complaint Decision - Ryma Academy", rejectionHtml);

            // Notify counsellor (no BCC) — only if different from student email
            if (grievance.counsellorId?.email && grievance.counsellorId.email !== grievance.studentEmail) {
                await sendMail(grievance.counsellorId.email, "📋 Student Complaint Decision - Ryma Academy", rejectionHtml);
            }
        } catch (emailError) {
            console.error("Email sending failed:", emailError.message);
        }

        res.status(200).json({ message: "Complaint rejected", grievance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update complaint
exports.updateGrievance = async (req, res) => {
    try {
        const grievance = await StudentGrievance.findById(req.params.id);
        if (!grievance) return res.status(404).json({ message: "Complaint not found" });

        if (["approved", "rejected"].includes(grievance.status)) {
            return res.status(403).json({ message: "Cannot edit/delete after admin action" });
        }

        Object.assign(grievance, req.body);
        await grievance.save();

        const updateHtml = `
      <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RYMA ACADEMY – Complaint Updated</title>
    <style>
        /* ===== BLUE THEME (matching grievance acknowledgement) ===== */
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
            color: #b13e3e; /* keep red for contrast */
        }

        .office-line {
            color: #1e3c5c;
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
            padding: 16px 50px 0 0;
            color: black;
            font-weight: 500;
        }

        /* ----- MOBILE-FIRST SECTION TITLE (blue) ----- */
        .section-title {
            font-size: 12px;
            font-weight: 700;
            color: #1e3c5c;
            border-bottom: 3px solid #d0e0f0;
            padding-bottom: 10px;
            margin: 30px 0 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        @media (min-width: 768px) {
            .section-title {
                font-size: 18px;
            }
        }

        @media (min-width: 1200px) {
            .section-title {
                font-size: 22px;
            }
        }

        /* ----- TABLE STYLES (blue-themed) ----- */
        .enroll-table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 6px 18px rgba(30, 60, 92, 0.1);
            border: 1px solid #d0e0f0;
            margin-bottom: 25px;
        }

        .enroll-table td, .enroll-table th {
            padding: 14px 20px;
            border-bottom: 1px solid #e2eaf2;
            font-size: 16px;
        }

        .enroll-table tr:last-child td {
            border-bottom: none;
        }

        .label-cell {
            background-color: #f2f6fc;
            color: #1e3c5c;
            font-weight: 700;
            width: 42%;
            border-right: 1px solid #d0e0f0;
        }

        .value-cell {
            background-color: #ffffff;
            color: #0b2b40;
            font-weight: 500;
        }

        .value-cell strong {
            color: #1e3c5c;
        }

        .warning-note {
            background: #f2f6fc;
            padding: 18px 24px;
            border-radius: 60px 10px 60px 10px;
            margin: 28px 0 20px;
            color: #1e3c5c;
            font-size: 15px;
            text-align: center;
            border: 1px solid #d0e0f0;
        }

        .help-box {
            padding: 18px 50px 0 0;
            color: black;
        }

        .help-box a {
            color: #0d6efd;
            font-weight: 600;
            text-decoration: underline;
        }

        .help-box ul {
            margin: 8px 0 0 20px;
            padding-left: 0;
            color: #1e3c5c;
        }

        .quote-block {
            background: #f2f6fc;
            border-radius: 40px 12px 40px 12px;
            padding: 22px 26px;
            margin: 20px 0 25px;
            border: 1px solid #d0e0f0;
            box-shadow: 0 6px 14px rgba(30, 60, 92, 0.1);
        }

        .quote-mark {
            font-size: 40px;
            color: #1e3c5c;
            font-family: 'Times New Roman', serif;
            line-height: 0.6;
            margin-right: 4px;
        }

        .quote-block p {
            font-size: 18px;
            font-style: italic;
            color: #0b2b40;
            margin: 8px 0 10px 0;
            font-weight: 500;
        }

        .director-name {
            font-weight: 700;
            color: #1e3c5c;
            text-align: right;
            font-size: 16px;
        }

        .signature {
            margin: 30px 0 20px;
            color: #0b2b40;
        }

        .contact-footer {
            padding: 18px 50px 0 0;
            color: black;
            font-size: 15px;
            word-break: break-word;
        }

        .contact-footer a {
            color: #0d6efd;
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
            color: black;
            line-height: 1.5;
            padding-left:22px ;
            padding-bottom: 15px;
        }

        .imgformate {
            width: 100%;
            max-width: 1200px;
            height: auto;
            display: block;
        }

        /* ----- RESPONSIVE TABLE STACKING (mobile) ----- */
        @media screen and (max-width: 600px) {
            .content {
                padding: 20px 16px;
            }

            .enroll-table,
            .enroll-table tbody,
            .enroll-table tr,
            .enroll-table td {
                display: block;
                width: 100%;
                box-sizing: border-box;
            }

            .enroll-table tr {
                margin-bottom: 1.5rem;
                border: 1px solid #d0e0f0;
                border-radius: 12px;
                padding: 0;
                background: #fff;
            }

            .enroll-table td {
                border: none;
                border-bottom: 1px solid #e2eaf2;
                padding: 12px 16px;
                width: 100% !important;
            }

            .enroll-table td:last-child {
                border-bottom: none;
            }

            .label-cell {
                border-right: none;
                background-color: #f2f6fc;
            }

            .value-cell {
                background-color: #ffffff;
            }

            .help-box,
            .contact-footer {
                padding: 15px 20px;
                border-radius: 30px 8px 30px 8px;
            }
        }
    </style>
</head>
<body>
    <div class="enrollment-container">
        <!-- Header Image (fluid) -->
        <img src="https://res.cloudinary.com/dk9lypgfv/image/upload/v1773463891/Screenshot_2026-03-11_141445_ar7p06.png" alt="RYMA ACADEMY Banner" class="imgformate">

        <div class="content">
            <div class="greeting">Dear <strong>${grievance.studentName}</strong>,</div>
            <div class="office-line">Greetings from the Office of Academic Affairs, RYMA ACADEMY.</div>

            <div class="message">
                We confirm that your complaint has been updated successfully. The revised details have been recorded and will be reviewed by the administration. Please find the updated information below.
            </div>

            <!-- Status highlight (update confirmation) -->
            <div class="highlight">
                ♻️ <strong>Status: UPDATED</strong> — Your complaint has been modified as requested.
            </div>

            <!-- Subject Section -->
            <div class="section-title">📝 Subject</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Subject</td>
                    <td class="value-cell"><strong>${grievance.subject || 'No subject specified'}</strong></td>
                </tr>
            </table>

            <!-- Updated Complaint Section -->
            <div class="section-title">📋 Updated Complaint</div>
            <table class="enroll-table" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="label-cell">Description</td>
                    <td class="value-cell">${grievance.complaint || 'No complaint details available'}</td>
                </tr>
            </table>

            <!-- Important Note / Next Steps (styled as help-box) -->
            <div class="help-box">
                <strong>📌 Important Note:</strong>
                <ul>
                    <li>Your complaint has been successfully updated in our system.</li>
                    <li>The updated complaint is now under review by the administration.</li>
                    <li>You will receive another notification once the review is complete.</li>
                    <li>If you need to make further changes, please contact your counsellor.</li>
                </ul>
            </div>
            <!-- Signature -->
            <div class="signature">
                With sincere regards,<br>
                <strong>Student Grievance Cell</strong><br>
                RYMA ACADEMY
            </div>

            <!-- Contact Footer (blue) -->
            <div class="contact-footer">
                📞 +91-9873336133<br>
                📧 <a href="mailto:services@rymaacademy.com">services@rymaacademy.com</a><br>
                🌐 <a href="https://www.rymaacademy.com">www.rymaacademy.com</a><br>
                📍 D-7/32, 1st Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085
            </div>
        </div>

        <!-- Disclaimer and Footer (red, unchanged) -->
        <div class="disclaimer">
            <strong>Disclaimer:</strong> This is an electronically generated communication. The information contained herein reflects the current status of your complaint in our system.
        </div>
    </div>
</body>
</html>
    `;

        try {
            // Send email to student (no BCC)
            await sendMail(grievance.studentEmail, "📝 Student Complaint Updated - Ryma Academy", updateHtml);
        } catch (emailError) {
            console.error("Email sending failed:", emailError.message);
        }

        res.status(200).json({ message: "Complaint updated", grievance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete complaint
exports.deleteGrievance = async (req, res) => {
    try {
        const grievance = await StudentGrievance.findById(req.params.id);
        if (!grievance) return res.status(404).json({ message: "Complaint not found" });

        if (["approved", "rejected"].includes(grievance.status)) {
            return res.status(403).json({ message: "Cannot delete after admin action" });
        }

        await grievance.deleteOne();
        res.status(200).json({ message: "Complaint deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search students whose admission is approved by student name
exports.searchStudentByName = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ message: "Name query is required" });

        const admissions = await Admission.find({ status: "approved" })
            .populate({
                path: "student",
                match: { name: { $regex: name, $options: "i" } },
                select: "name email phone studentId",
            })
            .populate("course", "name");

        const filteredAdmissions = admissions.filter(a => a.student);

        const students = filteredAdmissions.map(a => ({
            admissionId: a._id,
            admissionNo: a.admissionNo,
            studentId: a.student._id,
            studentName: a.student.name,
            email: a.student.email,
            phone: a.student.phone,
            course: a.course?.name || "",
            counsellor: a.counsellor,
            trainingBranch: a.trainingBranch,
        }));

        res.status(200).json(students);
    } catch (error) {
        console.error("Search student error:", error);
        res.status(500).json({ message: error.message });
    }
};
