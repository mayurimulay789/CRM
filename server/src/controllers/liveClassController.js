const LiveClass = require("../models/LiveClass");

// Get all
const getLiveClasses = async (req, res) => {
  try {
    const classes = await LiveClass.find().sort({ date: -1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add
const addLiveClass = async (req, res) => {
  try {
    const newClass = new LiveClass(req.body);
    await newClass.save();
    res.status(201).json(newClass);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update
const updateLiveClass = async (req, res) => {
  try {
    const updated = await LiveClass.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
const deleteLiveClass = async (req, res) => {
  try {
    await LiveClass.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getLiveClasses, addLiveClass, updateLiveClass, deleteLiveClass };
