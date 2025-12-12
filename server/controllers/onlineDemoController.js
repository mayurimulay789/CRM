// const OnlineDemo = require("../models/OnlineDemo");

// // ➕ Create new demo
// exports.createOnlineDemo = async (req, res) => {
//   try {
//     const demo = await OnlineDemo.create(req.body);
//     res.status(201).json(demo);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // 🔹 Get all demos
// exports.getAllOnlineDemos = async (req, res) => {
//   try {
//     const demos = await OnlineDemo.find().sort({ createdAt: -1 });
//     res.status(200).json(demos);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ✏️ Update demo
// exports.updateOnlineDemo = async (req, res) => {
//   try {
//     const demo = await OnlineDemo.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.status(200).json(demo);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // ❌ Delete demo
// exports.deleteOnlineDemo = async (req, res) => {
//   try {
//     await OnlineDemo.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: "Demo deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


const OnlineDemo = require("../models/OnlineDemo");

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
    const demo = await OnlineDemo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(demo);
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