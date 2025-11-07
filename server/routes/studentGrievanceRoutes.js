// const express = require("express");
// const router = express.Router();
// const { protect } = require("../middleware/auth");
// const {
//   submitGrievance,
//   getAllGrievances,
//   getCounsellorGrievances,
//   getGrievanceById,
//   approveGrievance,
//   rejectGrievance,
//   updateGrievance,
//   deleteGrievance,
// } = require("../controllers/studentGrievanceController");

// // Student submits complaint
// router.post("/submit", protect, submitGrievance);

// // Admin view all complaints
// router.get("/", protect, getAllGrievances);

// // Counsellor view their complaints
// router.get("/counsellor", protect, getCounsellorGrievances);

// // Admin view single complaint
// router.get("/:id", protect, getGrievanceById);

// // Admin approve/reject complaint
// router.put("/:id/approve", protect, approveGrievance);
// router.put("/:id/reject", protect, rejectGrievance);

// // Counsellor can edit/delete before admin action
// router.put("/:id", protect, updateGrievance);
// router.delete("/:id", protect, deleteGrievance);

// module.exports = router;


const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  submitGrievance,
  getAllGrievances,
  getCounsellorGrievances,
  getGrievanceById,
  approveGrievance,
  rejectGrievance,
  updateGrievance,
  deleteGrievance,
} = require("../controllers/studentGrievanceController");

// Counsellor submits complaint
router.post("/submit", protect, submitGrievance);

// Counsellor view their complaints
router.get("/counsellor", protect, getCounsellorGrievances);

// Admin view all complaints
router.get("/", protect, getAllGrievances);

// Admin view single complaint
router.get("/:id", protect, getGrievanceById);

// Admin approve/reject complaint
router.put("/:id/approve", protect, approveGrievance);
router.put("/:id/reject", protect, rejectGrievance);

// Counsellor update/delete before admin action
router.put("/:id", protect, updateGrievance);
router.delete("/:id", protect, deleteGrievance);

module.exports = router;
