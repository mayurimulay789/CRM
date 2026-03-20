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

        // Send approval email to the counsellor who submitted the grievance
        try {
            const counsellorEmail = grievance.submittedBy?.email;
            if (counsellorEmail) {
                const approvalHtml = ` <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grievance acknowledgement – RYMAC ACADEMY</title>
  <style>
    /* reset & base styles – suitable for email clients and modern browsers */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Roboto, Arial, sans-serif;
    }

    body {
      background-color: #e9ecef;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 24px 16px;
      margin: 0;
    }

    .card {
      max-width: 1200px;        /* 🔹 increased from 600px to 800px for a wider layout */
      width: 100%;
      background-color: #ffffff;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      border: 1px solid #dee2e6;
    }

    .content {
      padding: 32px 32px 28px;
    }

    .header-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: #1e3c5c;
      letter-spacing: 0.3px;
      margin-top: 4px;
      margin-bottom: 12px;
      text-transform: uppercase;
      border-left: 5px solid #0d6efd;
      padding-left: 16px;
    }

    .greeting {
      font-size: 1.1rem;
      font-weight: 500;
      color: #212529;
      margin-bottom: 16px;
    }

    .intro-text {
      line-height: 1.5;
      margin-bottom: 28px;
      font-size: 0.98rem;
      padding-top: 14px;
      padding-right: 50px;
    }

    /* details grid – exactly like screenshot: label above value */
    .details-grid {
      background-color: #f2f6fc;
      border-radius: 5px;
      padding: 22px 24px;
      margin-bottom: 28px;
      border: 1px solid #d0e0f0;
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
      color: #3a5f7a;
      margin-bottom: 4px;
    }

    .detail-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: #0b2b40;
      line-height: 1.3;
      word-break: break-word;
    }

    .detail-value.small-mobile {
      font-size: 1.1rem;
    }

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

    /* override for status to keep consistent but we keep inside detail-value */
    .message-block {
      color: #2b3e4f;
      line-height: 1.6;
      margin: 24px 0 20px;
      font-size: 0.98rem;
    }

    .message-block strong {
      color: #1e3c5c;
    }

    .contact-table {
      width: 100%;
      border-collapse: collapse;
      margin: 22px 0 18px;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      border: 1px solid #dee7ef;
    }

    .contact-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #e2eaf2;
      vertical-align: top;
    }

    .contact-table tr:last-child td {
      border-bottom: none;
    }

    .contact-table td:first-child {
      font-weight: 650;
      color: #1f4973;
      width: 38%;
      background-color: #f9fcff;
    }

    .contact-table td:last-child {
      color: #1a2e44;
      background-color: #ffffff;
    }

    .contact-link {
      color: #0d6efd;
      text-decoration: none;
      font-weight: 500;
      border-bottom: 1px dotted #0d6efd;
    }

    .contact-link:hover {
      color: #0b5ed7;
    }

    .signature-block {
      margin-top: 32px;
      border-top: 1px dashed #b6c9db;
      padding-top: 22px;
    }

    .regards-line {
      font-weight: 500;
      color: #1d3a5c;
      margin-bottom: 6px;
    }

    .office-name {
      font-weight: 700;
      color: #002d4c;
      font-size: 1.1rem;
      margin-top: 6px;
    }
.disclaimer {
            font-size: 14px;
            color: black;
            padding-top: 15px;
            line-height: 1.5;
        }
    hr {
      border: none;
      border-top: 1px solid #d9e2ec;
      margin: 24px 0 18px;
    }

    .assist-text {
      font-weight: 500;
      color: #1d3a5c;
      margin-bottom: 6px;
    }

    .mobile-email-highlight {
      font-weight: 600;
      color: #003f6f;
    }

    /* small tweak for inline with original table layout */
    .call-now {
      font-weight: 600;
      color: #1b4c7c;
    }
  </style>
</head>

<body>
  <div class="card">
    <!-- image included as per your template (cloudinary link) -->
    <img src="https://res.cloudinary.com/dk9lypgfv/image/upload/v1773463891/Screenshot_2026-03-11_141445_ar7p06.png"
      alt="" class="imgformate" style="max-width:100%; height:auto; display:block;">
    <div class="content">
      <!-- Dear student (placeholder) -->
      <div class="greeting">Dear ${grievance.submittedBy?.FullName || grievance.name},</div>

      <!-- confirmation intro (exactly as screenshot) -->
      <div class="intro-text">
        This is to confirm that your grievance has been successfully registered with the Office of Grievance Cell. Your
        complaint is currently approved by the designated review committee.
      </div>

      <!-- complaint details block – label above value style, like image -->
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

      <!-- contact / representative paragraph (exact wording) -->
      <div class="message-block">
        A representative from the Grievance Cell may contact you at your registered mobile number or email address
        within <strong>48–72 hours</strong> should any additional information be required to facilitate the review
        process.
      </div>

      <div class="message-block" style="margin-top: 8px;">
        Should you have any queries in the interim, please do not hesitate to reach us through the channels listed
        below.
      </div>

      <!-- assistance line before table -->
      <div class="assist-text" style="margin-top: 28px;">
        It would be our pleasure to assist you in case you require any help, you can connect with us through the
        following modes:
      </div>

      <!-- TABLE exactly matching the markdown-style layout from screenshot -->
      <table class="contact-table">
        <tr>
          <td>Helpline Number</td>
          <td><span class="call-now">Call us at</span> <a href="tel:9873336133" class="contact-link"
              style="font-weight:600;">9873336133</a></td>
        </tr>
        <tr>
          <td>Email ID</td>
          <td><span class="call-now">Write to us at</span> <a href="mailto:services@rymacademy.com"
              class="contact-link">services@rymacademy.com</a></td>
        </tr>
        <tr>
          <td>Website</td>
          <td><a href="#" class="contact-link" style="font-weight:500;">Click here to know more</a>
            <!-- # is placeholder, actual would be link --></td>
        </tr>
      </table>

      <!-- signature block (as in original) -->
      <div class="signature-block">
        <div class="regards-line">Regards,</div>
        <div style="font-weight: 500; color: #1f4973;">Office of Grievance Cell</div>
        <div style="margin: 4px 0 2px; color: #2c3e50;">Authorised Signatory</div>
        <div class="office-name">RYMA ACADEMY</div>
      </div>

      <!-- disclaimer (exact wording, auto-generated) -->
      <div class="disclaimer">
        Disclaimer: This is an auto-generated email. Please do not reply directly to this message.
      </div>
    </div>
  </div>

</html>`; // (your long HTML, unchanged)
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

// ✅ Reject grievance (FIXED)
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

        // ---------- FIX: Add formatDate helper ----------
        function formatDate(dateString, options = {}) {
            if (!dateString) return '';

            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';

            const defaultOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC'
            };

            const formatter = new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options });
            return formatter.format(date);
        }

        // Send rejection email to the counsellor who submitted the grievance
        try {
            const counsellorEmail = grievance.submittedBy?.email;
            if (counsellorEmail) {
                const rejectionHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grievance Rejection – RYMAC ACADEMY</title>
  <style>
    /* (your full CSS, unchanged) */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Roboto, Arial, sans-serif;
    }
    body {
      background-color: #e9ecef;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 24px 16px;
      margin: 0;
    }
    .card {
      max-width: 1200px;
      width: 100%;
      background-color: #ffffff;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      border: 1px solid #dee2e6;
    }
    .content {
      padding: 32px 32px 28px;
    }
    .greeting {
      font-size: 1.1rem;
      font-weight: 500;
      color: #212529;
      margin-bottom: 16px;
    }
    .intro-text {
      line-height: 1.5;
      font-size: 0.98rem;
      padding-top: 14px;
      padding-right:50px;
    }
    .details-grid {
      background-color: #f2f6fc;
      border-radius: 5px;
      padding: 22px 24px;
      margin-bottom: 28px;
      border: 1px solid #d0e0f0;
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
      color: #3a5f7a;
      margin-bottom: 4px;
    }
    .detail-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: #0b2b40;
      line-height: 1.3;
      word-break: break-word;
    }
    .status-badge.rejected {
      display: inline-block;
      background-color: #dc3545;
      color: #ffffff;
      font-weight: 600;
      padding: 6px 16px;
      border-radius: 40px;
      font-size: 1rem;
      letter-spacing: 0.3px;
    }
    .message-block {
      color: #2b3e4f;
      line-height: 1.6;
      margin: 24px 0 20px;
      font-size: 0.98rem;
    }
    .contact-table {
      width: 100%;
      border-collapse: collapse;
      margin: 22px 0 18px;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      border: 1px solid #dee7ef;
    }
    .contact-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #e2eaf2;
      vertical-align: top;
    }
    .contact-table tr:last-child td {
      border-bottom: none;
    }
    .contact-table td:first-child {
      font-weight: 650;
      color: #1f4973;
      width: 38%;
      background-color: #f9fcff;
    }
    .contact-table td:last-child {
      color: #1a2e44;
      background-color: #ffffff;
    }
    .contact-link {
      color: #0d6efd;
      text-decoration: none;
      font-weight: 500;
      border-bottom: 1px dotted #0d6efd;
    }
    .signature-block {
      margin-top: 32px;
      border-top: 1px dashed #b6c9db;
      padding-top: 22px;
    }
    .regards-line {
      font-weight: 500;
      color: #1d3a5c;
      margin-bottom: 6px;
    }
    .office-name {
      font-weight: 700;
      color: #002d4c;
      font-size: 1.1rem;
      margin-top: 6px;
    }
    .disclaimer {
      font-size: 14px;
      color: black;
      padding-top: 15px;
      line-height: 1.5;
    }
    .assist-text {
      font-weight: 500;
      color: #1d3a5c;
      margin-bottom: 6px;
    }
    .call-now {
      font-weight: 600;
      color: #1b4c7c;
    }
  </style>
</head>
<body>
  <div class="card">
    <img src="https://res.cloudinary.com/dk9lypgfv/image/upload/v1773463891/Screenshot_2026-03-11_141445_ar7p06.png"
      alt="RYMAC ACADEMY" style="max-width:100%; height:auto; display:block;">
    <div class="content">
      <div class="greeting">Dear ${grievance.submittedBy?.FullName || grievance.name},</div>
      <div class="intro-text">
        We have completed the review of your grievance (Ref. No. <strong>${grievance._id}</strong>). After careful evaluation by the Grievance Cell, we regret to inform you that your grievance has been <strong>rejected</strong> for the following reason(s):
      </div>
      <!-- FIX: Use adminResponse instead of rejectionReason -->
      <div style="padding: 16px 50px 0 0; margin-bottom: 28px;">
        <div style="font-weight: 600; color: #a11d2b; margin-bottom: 6px;">Rejection Reason</div>
        <div style="color: #2d2d2d;">${adminResponse || 'No specific reason provided.'}</div>
      </div>
      <div class="details-grid">
        <div class="detail-item">
          <div class="detail-label">COMPLAINT NUMBER</div>
          <div class="detail-value">${grievance._id}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">STATUS</div>
          <div class="detail-value"><span class="status-badge rejected">REJECTED</span></div>
        </div>
        <div class="detail-item">
          <div class="detail-label">SUBJECT</div>
          <div class="detail-value">${grievance.subject || 'No subject specified'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">SUBMITTED ON</div>
          <div class="detail-value">${formatDate(grievance.createdAt)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">DECIDED ON</div>
          <!-- FIX: Use current date instead of undefined decisionDate -->
          <div class="detail-value">${formatDate(new Date())}</div>
        </div>
      </div>
      <div class="message-block">
        This decision is final and concludes the grievance process at this level. If you believe there is new evidence or wish to appeal, please refer to the academy's grievance appeal policy available on our website.
      </div>
      <div class="message-block" style="margin-top: 8px;">
        Should you have any questions regarding this decision, you may contact us through the channels below.
      </div>
      <div class="assist-text" style="margin-top: 28px;">
        It would be our pleasure to assist you in case you require any help. You can connect with us through the following modes:
      </div>
      <table class="contact-table">
        <tr>
          <td>Helpline Number</td>
          <td><span class="call-now">Call us at</span> <a href="tel:9873336133" class="contact-link" style="font-weight:600;">9873336133</a></td>
        </tr>
        <tr>
          <td>Email ID</td>
          <td><span class="call-now">Write to us at</span> <a href="mailto:services@rymacademy.com" class="contact-link">services@rymacademy.com</a></td>
        </tr>
        <tr>
          <td>Website</td>
          <td><a href="#" class="contact-link" style="font-weight:500;">Click here to know more</a></td>
        </tr>
      </table>
      <div class="signature-block">
        <div class="regards-line">Regards,</div>
        <div style="font-weight: 500; color: #1f4973;">Office of Grievance Cell</div>
        <div style="margin: 4px 0 2px; color: #2c3e50;">Authorised Signatory</div>
        <div class="office-name">RYMA ACADEMY</div>
      </div>
      <div class="disclaimer">
        Disclaimer: This is an auto-generated email. Please do not reply directly to this message.
      </div>
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