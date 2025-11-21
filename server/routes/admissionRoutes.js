const express = require('express');
const router = express.Router();
const {
  getAllAdmissions,
  getAdmissionById,
  getAdmissionByAdmissionNo,
  getAdmissionsByStudent,
  getAdmissionsByCourse,
  createAdmission,
  updateAdmission,
  updateAdmissionStatus,
  deleteAdmission,
  verifyAdmissionEmail,
  getAdmissionStats,
  searchApprovedStudents
} = require('../controllers/admissionController');

const { protect,admin } = require('../middleware/auth');

router.use(protect);

router.get('/', getAllAdmissions);

router.get('/stats/summary', getAdmissionStats);


router.get('/:id', getAdmissionById);

router.get('/admissionNo/:admissionNo', getAdmissionByAdmissionNo);

router.get('/student/:studentId', getAdmissionsByStudent);

router.get('/course/:courseId', getAdmissionsByCourse);

router.get('/search-approved-students', searchApprovedStudents);

router.post('/', createAdmission);

router.put('/:id', updateAdmission);

router.patch('/:id/status', updateAdmissionStatus);

router.patch('/:id/verify-email', verifyAdmissionEmail);

router.delete('/:id', deleteAdmission);

module.exports = router;
