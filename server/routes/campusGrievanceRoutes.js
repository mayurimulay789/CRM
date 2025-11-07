const express = require('express');
const router = express.Router();
const {
  createGrievance,
  getAllGrievances,
  approveGrievance,
  rejectGrievance,
  deleteGrievance,
  updateGrievance, // ✅ import update function
} = require('../controllers/campusGrievanceController');

// Routes for both Admin & Counsellor
router.post('/', createGrievance);        // Counsellor adds
router.get('/', getAllGrievances);        // Both view
router.put('/:id', updateGrievance);      // ✅ Counsellor/Admin can edit grievance

// Admin routes
router.put('/:id/approve', approveGrievance);
router.put('/:id/reject', rejectGrievance);
router.delete('/:id', deleteGrievance);

module.exports = router;
