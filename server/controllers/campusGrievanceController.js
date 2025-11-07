const CampusGrievance = require("../models/campusGrievanceModel");

// ✅ Create new grievance
exports.createGrievance = async (req, res) => {
  try {
    const grievance = await CampusGrievance.create(req.body);
    res.status(201).json(grievance);
  } catch (err) {
    res.status(500).json({ message: "Failed to create grievance", error: err.message });
  }
};

// ✅ Get all grievances
exports.getAllGrievances = async (req, res) => {
  try {
    const grievances = await CampusGrievance.find().sort({ createdAt: -1 });
    res.json(grievances);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch grievances" });
  }
};

// ✅ Update grievance
exports.updateGrievance = async (req, res) => {
  try {
    const grievance = await CampusGrievance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }
    res.json(grievance);
  } catch (err) {
    res.status(500).json({ message: "Failed to update grievance" });
  }
};

// ✅ Delete grievance
exports.deleteGrievance = async (req, res) => {
  try {
    await CampusGrievance.findByIdAndDelete(req.params.id);
    res.json({ message: "Grievance deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete grievance" });
  }
};

// ✅ Approve grievance
exports.approveGrievance = async (req, res) => {
  try {
    const { adminResponse } = req.body;
    const grievance = await CampusGrievance.findByIdAndUpdate(req.params.id, { status: 'approved', adminResponse }, { new: true });
    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }
    res.json(grievance);
  } catch (err) {
    res.status(500).json({ message: "Failed to approve grievance", error: err.message });
  }
};

// ✅ Reject grievance
exports.rejectGrievance = async (req, res) => {
  try {
    const { adminResponse } = req.body;
    const grievance = await CampusGrievance.findByIdAndUpdate(req.params.id, { status: 'rejected', adminResponse }, { new: true });
    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }
    res.json(grievance);
  } catch (err) {
    res.status(500).json({ message: "Failed to reject grievance", error: err.message });
  }
};
