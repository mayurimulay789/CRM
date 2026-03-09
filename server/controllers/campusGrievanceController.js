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
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Campus Grievance Status Update</title>
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
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
              .status-message {
                text-align: center;
                margin-bottom: 30px;
              }
              .status-message h2 {
                color: #28a745;
                font-size: 24px;
                margin-bottom: 10px;
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
              .grievance-details {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .section-title {
                color: #495057;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 15px;
                padding-bottom: 8px;
                border-bottom: 2px solid #28a745;
              }
              .detail-content {
                background-color: #ffffff;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid #28a745;
                margin-top: 10px;
              }
              .footer {
                text-align: center;
                padding: 20px;
                background-color: #f8f9fa;
                color: #6c757d;
                font-size: 14px;
              }
              .next-steps {
                background-color: #e7f3ff;
                border-left: 4px solid #007bff;
                padding: 15px 20px;
                margin: 20px 0;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Grievance Approved</h1>
              </div>
              
              <div class="content">
                <div class="status-message">
                  <h2>Great News!</h2>
                  <p>Dear ${grievance.submittedBy?.FullName || grievance.name}, your campus grievance has been <strong>approved</strong>.</p>
                </div>

                <div class="status-badge">
                  ✅ Status: APPROVED
                </div>

                <!-- Subject Section -->
                <div class="grievance-details">
                  <div class="section-title">📝 Subject</div>
                  <div class="detail-content">
                    ${grievance.subject || 'No subject specified'}
                  </div>
                </div>

                <!-- Original Complaint Section -->
                <div class="grievance-details">
                  <div class="section-title">📋 Your Complaint</div>
                  <div class="detail-content">
                    ${grievance.complaint || 'No complaint details available'}
                  </div>
                </div>

                <!-- Admin Response Section -->
                <div class="grievance-details">
                  <div class="section-title">💬 Admin Response</div>
                  <div class="detail-content">
                    ${grievance.adminResponse || 'No specific response provided'}
                  </div>
                </div>

                <div class="next-steps">
                  <h4 style="margin-top: 0; color: #007bff;">📋 What's Next:</h4>
                  <ul style="margin: 0;">
                    <li>Your grievance has been resolved in your favor</li>
                    <li>The necessary actions will be taken as indicated in the admin response</li>
                    <li>If you have any follow-up questions, please contact the administration</li>
                    <li>Keep this email for your records</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <p><strong>Thank you for bringing this matter to our attention.</strong></p>
                  <p>We appreciate your patience during the review process.</p>
                </div>
              </div>

              <div class="footer">
                <p><strong>Ryma Academy - Administration</strong></p>
                <p>For support, contact us at: <a href="mailto:admin@rymaacademy.com">admin@rymaacademy.com</a></p>
                <p>This is an automated message. Please do not reply directly to this email.</p>
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
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Campus Grievance Status Update</title>
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
              .status-message {
                text-align: center;
                margin-bottom: 30px;
              }
              .status-message h2 {
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
              .grievance-details {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .section-title {
                color: #495057;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 15px;
                padding-bottom: 8px;
                border-bottom: 2px solid #dc3545;
              }
              .detail-content {
                background-color: #ffffff;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid #dc3545;
                margin-top: 10px;
              }
              .footer {
                text-align: center;
                padding: 20px;
                background-color: #f8f9fa;
                color: #6c757d;
                font-size: 14px;
              }
              .next-steps {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px 20px;
                margin: 20px 0;
                border-radius: 4px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📋 Grievance Decision</h1>
              </div>
              
              <div class="content">
                <div class="status-message">
                  <h2>Grievance Review Complete</h2>
                  <p>Dear ${grievance.submittedBy?.FullName || grievance.name}, we have completed the review of your campus grievance.</p>
                </div>

                <div class="status-badge">
                  ❌ Status: REJECTED
                </div>

                <!-- Subject Section -->
                <div class="grievance-details">
                  <div class="section-title">📝 Subject</div>
                  <div class="detail-content">
                    ${grievance.subject || 'No subject specified'}
                  </div>
                </div>

                <!-- Original Complaint Section -->
                <div class="grievance-details">
                  <div class="section-title">📋 Your Complaint</div>
                  <div class="detail-content">
                    ${grievance.complaint || 'No complaint details available'}
                  </div>
                </div>

                <!-- Admin Response Section -->
                <div class="grievance-details">
                  <div class="section-title">💬 Admin Response</div>
                  <div class="detail-content">
                    ${adminResponse || 'No specific response provided'}
                  </div>
                </div>

                <div class="next-steps">
                  <h4 style="margin-top: 0; color: #856404;">📞 What You Can Do Next:</h4>
                  <ul style="margin: 0;">
                    <li>Review the admin response carefully for more details</li>
                    <li>If you have additional evidence or information, you may submit a new grievance</li>
                    <li>Contact the administration directly if you need clarification</li>
                    <li>Keep this email for your records</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <p><strong>We appreciate you bringing this matter to our attention.</strong></p>
                  <p>All grievances are taken seriously and reviewed thoroughly.</p>
                </div>
              </div>

              <div class="footer">
                <p><strong>Ryma Academy - Administration</strong></p>
                <p>For support, contact us at: <a href="mailto:admin@rymaacademy.com">admin@rymaacademy.com</a></p>
                <p>This is an automated message. Please do not reply directly to this email.</p>
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
