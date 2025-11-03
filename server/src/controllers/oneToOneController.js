// server/src/controllers/oneToOneController.js
const OneToOneDemo = require("../models/OneToOneDemo");

exports.createOneToOne = async (req, res) => {
  try {
    const demo = new OneToOneDemo(req.body);
    await demo.save();
    res.status(201).json(demo);
  } catch (error) {
    res.status(400).json({ error: "Error creating one-to-one demo", details: error.message });
  }
};

exports.getOneToOne = async (req, res) => {
  try {
    const demos = await OneToOneDemo.find().sort({ createdAt: -1 });
    res.status(200).json(demos);
  } catch (error) {
    res.status(500).json({ error: "Error fetching one-to-one demos" });
  }
};

exports.updateOneToOne = async (req, res) => {
  try {
    const demo = await OneToOneDemo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(demo);
  } catch (error) {
    res.status(400).json({ error: "Error updating one-to-one demo" });
  }
};

exports.deleteOneToOne = async (req, res) => {
  try {
    await OneToOneDemo.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "One-to-one demo deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting one-to-one demo" });
  }
};
