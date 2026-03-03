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
  deleteEnrollmentByCounsellor,
  addActivity,
  applyLateFees, // New
  getEnrollmentsWithLateFees, // New
  getEnrollmentsWithUpfrontPayment // New
} = require('../controllers/enrollmentController');

const { protect, admin } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Main CRUD routes
router.post('/', createEnrollment);
router.get('/', getEnrollments);
router.get('/stats/overview', admin, getEnrollmentStats);
router.get('/fee-delays', getFeeDelays);

// New routes for late fees and upfront payments
router.get('/late-fees', getEnrollmentsWithLateFees);
router.get('/upfront-payments', getEnrollmentsWithUpfrontPayment);
router.post('/:id/late-fees', applyLateFees);

// Individual enrollment routes
router.get('/:id', getEnrollment);
router.put('/:id', updateEnrollment);
router.post('/:id/activities', addActivity);

// Delete routes
router.delete('/counsellor/:id', deleteEnrollmentByCounsellor);
router.delete('/:id', admin, deleteEnrollment);

module.exports = router;