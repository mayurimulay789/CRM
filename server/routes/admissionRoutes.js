<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admissionController');
=======

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
  getAdmissionStats
} = require('../controllers/admissionController');

>>>>>>> 796f7396510349a3599e146e7987a6e0c9dcc0ef
const { protect,admin } = require('../middleware/auth');

router.use(protect);

<<<<<<< HEAD
router.post('/admissions', admissionController.createAdmission);
router.get('/admissions', admissionController.getAdmissions);
router.get('/admissions/:admissionNo', admissionController.getAdmission);
router.put('/admissions/:admissionNo', admissionController.updateAdmission);
router.delete('/admissions/:admissionNo', admissionController.deleteAdmission);
router.patch('/admissions/:admissionNo/verify-email', admissionController.verifyEmail);
=======
router.get('/', getAllAdmissions);

router.get('/stats/summary', getAdmissionStats);

router.get('/:id', getAdmissionById);

router.get('/admissionNo/:admissionNo', getAdmissionByAdmissionNo);

router.get('/student/:studentId', getAdmissionsByStudent);

router.get('/course/:courseId', getAdmissionsByCourse);

router.post('/', createAdmission);

router.put('/:id', updateAdmission);

router.patch('/:id/status', updateAdmissionStatus);

router.patch('/:id/verify-email', verifyAdmissionEmail);

router.delete('/:id', deleteAdmission);
>>>>>>> 796f7396510349a3599e146e7987a6e0c9dcc0ef

module.exports = router;