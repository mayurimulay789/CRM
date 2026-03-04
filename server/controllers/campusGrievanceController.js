const CampusGrievance = require("../models/campusGrievanceModel");
const sendMail = require("../utils/email");

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
        const message = `Hello ${grievance.submittedBy.FullName || grievance.name},<br/>
          Your campus grievance regarding <b>"${grievance.subject}"</b> has been <b>approved</b>.<br/>
          <b>Admin Response:</b> ${grievance.adminResponse || 'N/A'}
        `;
        await sendMail(counsellorEmail, "Campus Grievance Approved", message);
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
        const message = `Hello ${grievance.submittedBy.FullName || grievance.name},<br/>
          Your campus grievance regarding <b>"${grievance.subject}"</b> has been <b>rejected</b>.<br/>
          <b>Admin Response:</b> ${adminResponse || 'N/A'}
        `;
        await sendMail(counsellorEmail, "Campus Grievance Rejected", message);
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
