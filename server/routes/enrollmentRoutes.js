const express = require('express');
const router = express.Router();
const {
  createEnrollment,
  getEnrollments,
  getEnrollment,
  updateEnrollment,
  getEnrollmentStats,
  getFeeDelays,
  deleteEnrollment,
  addActivity,
  approveEnrollment,
  rejectEnrollment
} = require('../controllers/enrollmentController');

const { protect, admin } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Main CRUD routes
router.post('/', createEnrollment);
router.get('/', getEnrollments);
router.get('/stats/overview', admin, getEnrollmentStats);
router.get('/fee-delays', getFeeDelays);

// Approval routes (Admin only)
router.put('/:id/approve', admin, approveEnrollment);
router.put('/:id/reject', admin, rejectEnrollment);

// Individual enrollment routes
router.get('/:id', getEnrollment);
router.put('/:id', updateEnrollment);
router.post('/:id/activities', addActivity);

// Delete routes
router.delete('/:id', admin, deleteEnrollment);

module.exports = router;