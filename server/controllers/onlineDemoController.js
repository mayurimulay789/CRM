const OnlineDemo = require("../models/OnlineDemo");
const OfflineDemo = require("../models/OfflineDemo");

// ➕ Create new demo
exports.createOnlineDemo = async (req, res) => {
  try {
    const demo = await OnlineDemo.create(req.body);
    res.status(201).json(demo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 🔹 Get all demos
exports.getAllOnlineDemos = async (req, res) => {
  try {
    const demos = await OnlineDemo.find().sort({ createdAt: -1 });
    res.status(200).json(demos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update demo
exports.updateOnlineDemo = async (req, res) => {
  try {
    const demo = await OnlineDemo.findById(req.params.id);
    if (!demo) {
      return res.status(404).json({ message: "Demo not found" });
    }

    // Check if mode is being changed to offline
    if (req.body.mode && req.body.mode.toLowerCase() === "offline" && demo.mode.toLowerCase() === "online") {
      // Create new demo in OfflineDemo collection
      const newOfflineDemo = new OfflineDemo({
        course: req.body.course || demo.course,
        branch: req.body.branch || "N/A", // branch is required for offline demos
        date: req.body.date || demo.date,
        time: req.body.time || demo.time,
        mode: req.body.mode,
        medium: req.body.medium || demo.medium,
        trainer: req.body.trainer || demo.trainer,
      });
      await newOfflineDemo.save();

      // Delete from OnlineDemo collection
      await OnlineDemo.findByIdAndDelete(req.params.id);

      return res.status(200).json({
        message: "Demo mode changed from online to offline. Demo moved to offline section.",
        demo: newOfflineDemo,
      });
    }

    // If mode stays online, just update
    const updatedDemo = await OnlineDemo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedDemo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ❌ Delete demo
exports.deleteOnlineDemo = async (req, res) => {
  try {
    await OnlineDemo.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Demo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
