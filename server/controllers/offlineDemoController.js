// const OfflineDemo = require("../models/OfflineDemo");

// // ✅ Create
// exports.createOfflineDemo = async (req, res) => {
//   try {
//     const demo = new OfflineDemo(req.body);
//     await demo.save();
//     res.status(201).json(demo);
//   } catch (error) {
//     res.status(400).json({ error: "Error creating offline demo", details: error.message });
//   }
// };

// // ✅ Get All
// exports.getOfflineDemos = async (req, res) => {
//   try {
//     const demos = await OfflineDemo.find();
//     res.status(200).json(demos);
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching offline demos" });
//   }
// };

// // ✅ Update
// exports.updateOfflineDemo = async (req, res) => {
//   try {
//     const demo = await OfflineDemo.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.status(200).json(demo);
//   } catch (error) {
//     res.status(400).json({ error: "Error updating offline demo" });
//   }
// };

// // ✅ Delete
// exports.deleteOfflineDemo = async (req, res) => {
//   try {
//     await OfflineDemo.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: "Offline demo deleted" });
//   } catch (error) {
//     res.status(500).json({ error: "Error deleting offline demo" });
//   }
// };


const OfflineDemo = require("../models/OfflineDemo");
const OnlineDemo = require("../models/OnlineDemo");

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
    const demo = await OfflineDemo.findById(req.params.id);
    if (!demo) {
      return res.status(404).json({ error: "Demo not found" });
    }

    // Check if mode is being changed to online
    if (req.body.mode && req.body.mode.toLowerCase() === "online" && demo.mode.toLowerCase() === "offline") {
      // Create new demo in OnlineDemo collection
      const newOnlineDemo = new OnlineDemo({
        course: req.body.course || demo.course,
        date: req.body.date || demo.date,
        time: req.body.time || demo.time,
        mode: req.body.mode,
        medium: req.body.medium || demo.medium,
        trainer: req.body.trainer || demo.trainer,
      });
      await newOnlineDemo.save();

      // Delete from OfflineDemo collection
      await OfflineDemo.findByIdAndDelete(req.params.id);

      return res.status(200).json({
        message: "Demo mode changed from offline to online. Demo moved to online section.",
        demo: newOnlineDemo,
      });
    }

    // If mode stays offline, just update
    const updatedDemo = await OfflineDemo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedDemo);
  } catch (error) {
    res.status(400).json({ error: "Error updating offline demo", details: error.message });
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