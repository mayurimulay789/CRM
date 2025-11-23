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






// server/routes/studentGrievanceRoutes.js
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
  searchStudentByName,
} = require("../controllers/studentGrievanceController");

// ✅ Student submits grievance
router.post("/submit", protect, submitGrievance);

// ✅ Counsellor view their grievances
router.get("/counsellor", protect, getCounsellorGrievances);

// ✅ Admin view all grievances
router.get("/", protect, getAllGrievances);

// ✅ Get grievance by ID
router.get("/:id", protect, getGrievanceById);

// ✅ Approve grievance
router.put("/:id/approve", protect, approveGrievance);

// ✅ Reject grievance
router.put("/:id/reject", protect, rejectGrievance);

// ✅ Update grievance
router.put("/:id", protect, updateGrievance);

// ✅ Delete grievance
router.delete("/:id", protect, deleteGrievance);

// ✅ Search approved students (used by dropdown)
router.get("/search-student", protect, searchStudentByName);

module.exports = router;
