const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
  createGrievance,
  getAllGrievances,
  approveGrievance,
  rejectGrievance,
  deleteGrievance,
  updateGrievance,
} = require("../controllers/campusGrievanceController");

// Routes for both Admin & Counsellor
router.post("/", protect, createGrievance);
router.get("/", protect, getAllGrievances);
router.put("/:id", protect, updateGrievance);

// Admin-only routes
router.put("/:id/approve", protect, admin, approveGrievance);
router.put("/:id/reject", protect, admin, rejectGrievance);
router.delete("/:id", protect, deleteGrievance);

module.exports = router;
