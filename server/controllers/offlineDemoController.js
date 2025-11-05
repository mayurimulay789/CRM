const OfflineDemo = require("../models/OfflineDemo");

// ✅ Create
exports.createOfflineDemo = async (req, res) => {
  try {
    const demo = new OfflineDemo(req.body);
    await demo.save();
    res.status(201).json(demo);
  } catch (error) {
    res.status(400).json({ error: "Error creating offline demo", details: error.message });
  }
};

// ✅ Get All
exports.getOfflineDemos = async (req, res) => {
  try {
    const demos = await OfflineDemo.find();
    res.status(200).json(demos);
  } catch (error) {
    res.status(500).json({ error: "Error fetching offline demos" });
  }
};

// ✅ Update
exports.updateOfflineDemo = async (req, res) => {
  try {
    const demo = await OfflineDemo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(demo);
  } catch (error) {
    res.status(400).json({ error: "Error updating offline demo" });
  }
};

// ✅ Delete
exports.deleteOfflineDemo = async (req, res) => {
  try {
    await OfflineDemo.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Offline demo deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting offline demo" });
  }
};
