const CampusGrievance = require("../models/campusGrievanceModel");
const { sendMail } = require("../utils/email");

// ✅ Create new grievance
exports.createGrievance = async (req, res) => {
  try {
    const grievanceData = {
      ...req.body,
      submittedBy: req.user._id,
    };
    const grievance = await CampusGrievance.create(grievanceData);
    res.status(201).json(grievance);
  } catch (err) {
    res.status(500).json({ message: "Failed to create grievance", error: err.message });
  }
};

// ✅ Get all grievances
exports.getAllGrievances = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "admin") {
      const User = require("../models/User");
      const counsellorIds = await User.find({ role: "Counsellor" }).select("_id");
      query.submittedBy = { $in: counsellorIds };
    } else if (req.user.role === "Counsellor") {
      query.submittedBy = req.user._id;
    }

    const grievances = await CampusGrievance.find(query)
      .populate("submittedBy", "FullName email role")
      .sort({ createdAt: -1 });

    res.json(grievances);
  } catch (err) {
    console.error("Get grievances error:", err);
    res.status(500).json({ message: "Failed to fetch grievances", error: err.message });
  }
};

// ✅ Update grievance
exports.updateGrievance = async (req, res) => {
  try {
    const grievance = await CampusGrievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    // Allow admin to update any grievance, or counsellor to update their own if status is submittedToAdmin
    if (req.user.role !== 'admin' && (!req.user._id.equals(grievance.submittedBy) || grievance.status !== 'submittedToAdmin')) {
      return res.status(403).json({ message: "Not authorized to update this grievance" });
    }

    const updatedGrievance = await CampusGrievance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedGrievance);
  } catch (err) {
    console.error("Update grievance error:", err);
    res.status(500).json({ message: "Failed to update grievance", error: err.message });
  }
};

// ✅ Delete grievance
exports.deleteGrievance = async (req, res) => {
  try {
    const grievance = await CampusGrievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    // Allow admin to delete any grievance, or counsellor to delete their own if status is submittedToAdmin
    if (req.user.role !== 'admin' && (!req.user._id.equals(grievance.submittedBy) || grievance.status !== 'submittedToAdmin')) {
      return res.status(403).json({ message: "Not authorized to delete this grievance" });
    }

    await CampusGrievance.findByIdAndDelete(req.params.id);
    res.json({ message: "Grievance deleted successfully" });
  } catch (err) {
    console.error("Delete grievance error:", err);
    res.status(500).json({ message: "Failed to delete grievance", error: err.message });
  }
};

// ✅ Approve grievance
exports.approveGrievance = async (req, res) => {
  try {
    console.log("Approve request by:", req.user);
    console.log("Grievance ID:", req.params.id);

    const { adminResponse } = req.body;

    // First update the grievance
    const updated = await CampusGrievance.findByIdAndUpdate(
      req.params.id,
      { status: "approved", adminResponse },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    // Then fetch with populate separately (more reliable)
    const grievance = await CampusGrievance.findById(updated._id)
      .populate("submittedBy", "FullName email");

    console.log("Populated submittedBy:", grievance.submittedBy);

    // Send approval email to the counsellor who submitted the grievance
    try {
      const counsellorEmail = grievance.submittedBy?.email;
      if (counsellorEmail) {
        const approvalHtml = `
          <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RYMA ACADEMY – Campus Grievance Status Update</title>
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
            display: block;
        }

        @media (max-width: 600px) {
            .imgformate {
                width: 100%;
                height: auto;
            }
            .content {
                padding: 20px;
            }
            .enroll-table td, .enroll-table th {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="enrollment-container">
        <!-- Header Image (same as official template) -->
        <img src="https://res.cloudinary.com/dk9lypgfv/image/upload/v1773463891/Screenshot_2026-03-11_141445_ar7p06.png" alt="RYMA ACADEMY Banner" class="imgformate">

        <div class="content">
            <div class="greeting">Dear <strong>${grievance.submittedBy?.FullName || grievance.name}</strong>,</div>
            <div class="office-line">Greetings from the Office of Academic Affairs, RYMA ACADEMY.</div>

            <div class="message">
                We are pleased to inform you that your campus grievance has been reviewed and <strong>approved</strong>. The details of the resolution are provided below.
            </div>

            <!-- Status highlight (positive message) -->
            <div class="highlight">
                ✅ <strong>Status: APPROVED</strong> — Your grievance has been resolved in your favor.
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

            <!-- Next Steps / Help Box (styled as help-box) -->
            <div class="help-box">
                <strong>📋 What's Next:</strong>
                <ul style="margin: 8px 0 0 20px; padding-left: 0; color: #6d3131;">
                    <li>Your grievance has been resolved in your favor.</li>
                    <li>The necessary actions will be taken as indicated in the admin response.</li>
                    <li>If you have any follow-up questions, please contact the administration.</li>
                    <li>Keep this email for your records.</li>
                </ul>
            </div>

            <!-- Quote Block (adapted for approval context) -->
            <div class="quote-block">
                <span class="quote-mark">“</span>
                <p>We thank you for your patience and trust. Your feedback is a gift that helps us grow stronger together.</p>
                <div class="director-name">~ Mr. Parveen Jain | Director, RYMA ACADEMY</div>
            </div>

            <!-- Signature -->
            <div class="signature">
                With sincere regards,<br>
                <strong>Student Grievance Cell</strong><br>
                RYMA ACADEMY
            </div>

            <!-- Contact Footer (exactly as original, but in the new red style) -->
            <div class="contact-footer">
                📞 +91-9873336133<br>
                📧 <a href="mailto:services@rymaacademy.com">services@rymaacademy.com</a><br>
                🌐 <a href="https://www.rymaacademy.com">www.rymaacademy.com</a><br>
                📍 D-7/32, 1st Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085
            </div>
        </div>

        <!-- Disclaimer and Footer -->
        <div class="disclaimer">
            <strong>Disclaimer:</strong> This is an electronically generated communication. The information contained herein reflects the official decision of the administration regarding your grievance.
        </div>
        <div class="footer-red">
            © RYMA ACADEMY – Official Correspondence
        </div>
    </div>
</body>
</html>
        `;
        
        await sendMail(counsellorEmail, "🎉 Campus Grievance Approved - Ryma Academy", approvalHtml);
        console.log("✅ Approval email sent to:", counsellorEmail);
      } else {
        console.error("❌ No email found on submittedBy user for grievance:", grievance._id);
      }
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
    }

    res.json({ message: "Grievance approved successfully", grievance });
  } catch (err) {
    console.error("Approve grievance error:", err);
    res.status(500).json({ message: "Failed to approve grievance", error: err.message });
  }
};

// ✅ Reject grievance
exports.rejectGrievance = async (req, res) => {
  try {
    console.log("Reject request by:", req.user);
    console.log("Grievance ID:", req.params.id);

    const adminResponse = req.body.adminResponse || '';

    // Validate grievance ID
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid grievance ID" });
    }

    // First update the grievance
    const updated = await CampusGrievance.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", adminResponse },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    // Then fetch with populate separately (more reliable)
    const grievance = await CampusGrievance.findById(updated._id)
      .populate("submittedBy", "FullName email");

    console.log("Populated submittedBy:", grievance.submittedBy);

    // Send rejection email to the counsellor who submitted the grievance
    try {
      const counsellorEmail = grievance.submittedBy?.email;
      if (counsellorEmail) {
        const rejectionHtml = `
          <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RYMA ACADEMY – Campus Grievance Status Update</title>
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
            display: block;
        }

        @media (max-width: 600px) {
            .imgformate {
                width: 100%;
                height: auto;
            }
            .content {
                padding: 20px;
            }
            .enroll-table td, .enroll-table th {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="enrollment-container">
        <!-- Header Image (same as official template) -->
        <img src="https://res.cloudinary.com/dk9lypgfv/image/upload/v1773463891/Screenshot_2026-03-11_141445_ar7p06.png" alt="RYMA ACADEMY Banner" class="imgformate">

        <div class="content">
            <div class="greeting">Dear <strong>${grievance.submittedBy?.FullName || grievance.name}</strong>,</div>
            <div class="office-line">Greetings from the Office of Academic Affairs, RYMA ACADEMY.</div>

            <div class="message">
                We have completed the review of your campus grievance. After careful consideration, we regret to inform you that your grievance has been <strong>rejected</strong>. The details of the decision are provided below.
            </div>

            <!-- Rejection status highlight (warning-note style) -->
            <div class="warning-note">
                ❌ <strong>Status: REJECTED</strong> — Your grievance did not meet the criteria for approval at this time.
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
                    <td class="value-cell">${adminResponse || 'No specific response provided'}</td>
                </tr>
            </table>

            <!-- Next Steps / Help Box (styled as help-box) -->
            <div class="help-box">
                <strong>📞 What You Can Do Next:</strong>
                <ul style="margin: 8px 0 0 20px; padding-left: 0; color: #6d3131;">
                    <li>Review the admin response carefully for more details.</li>
                    <li>If you have additional evidence or information, you may submit a new grievance.</li>
                    <li>Contact the administration directly if you need clarification.</li>
                    <li>Keep this email for your records.</li>
                </ul>
            </div>

            <!-- Quote Block (adapted for rejection context) -->
            <div class="quote-block">
                <span class="quote-mark">“</span>
                <p>We understand that this may be disappointing. Please know that every concern is taken seriously, and we encourage you to continue sharing your feedback. Your voice is important to us.</p>
                <div class="director-name">~ Mr. Parveen Jain | Director, RYMA ACADEMY</div>
            </div>

            <!-- Signature -->
            <div class="signature">
                With sincere regards,<br>
                <strong>Student Grievance Cell</strong><br>
                RYMA ACADEMY
            </div>

            <!-- Contact Footer (exactly as original) -->
            <div class="contact-footer">
                📞 +91-9873336133<br>
                📧 <a href="mailto:services@rymaacademy.com">services@rymaacademy.com</a><br>
                🌐 <a href="https://www.rymaacademy.com">www.rymaacademy.com</a><br>
                📍 D-7/32, 1st Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085
            </div>
        </div>

        <!-- Disclaimer and Footer -->
        <div class="disclaimer">
            <strong>Disclaimer:</strong> This is an electronically generated communication. The information contained herein reflects the official decision of the administration regarding your grievance.
        </div>
        <div class="footer-red">
            © RYMA ACADEMY – Official Correspondence
        </div>
    </div>
</body>
</html>
        `;
        
        await sendMail(counsellorEmail, "📋 Campus Grievance Decision - Ryma Academy", rejectionHtml);
        console.log("✅ Rejection email sent to:", counsellorEmail);
      } else {
        console.error("❌ No email found on submittedBy user for grievance:", grievance._id);
      }
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
    }

    res.json({ message: "Grievance rejected successfully", grievance });
  } catch (err) {
    console.error("Reject grievance error:", err);
    res.status(500).json({ message: "Failed to reject grievance", error: err.message });
  }
};
