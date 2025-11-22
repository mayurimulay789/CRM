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
  addActivity
} = require('../controllers/enrollmentController');

const { protect, admin } = require('../middleware/auth');

// All routes are protected
router.use(protect);


router.post('/', createEnrollment);

router.get('/', getEnrollments);

router.get('/stats/overview', admin, getEnrollmentStats);

router.get('/fee-delays', getFeeDelays);

router.get('/:id', getEnrollment);

router.put('/:id', updateEnrollment);

router.post('/:id/activities', addActivity);

//detete enrollment - counsellor only
router.delete('/counsellor/:id', deleteEnrollmentByCounsellor);

router.delete('/:id', admin, deleteEnrollment);

module.exports = router;