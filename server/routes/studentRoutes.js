const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  getStudentByStudentId,
  createStudent,
  updateStudent,
  deleteStudent,
  toggleStudentStatus,
  getStudentStats
} = require('../controllers/studentController');
const { uploadStudentFiles, handleUploadErrors } = require('../middleware/uploadMiddleware');

router.get('/', getAllStudents);
router.get('/stats/summary', getStudentStats);
router.get('/:id', getStudentById);
router.get('/studentId/:studentId', getStudentByStudentId);

// Add upload middleware directly to routes with error handling
router.post('/', uploadStudentFiles, handleUploadErrors, createStudent);
router.put('/:id', uploadStudentFiles, handleUploadErrors, updateStudent);

router.delete('/:id', deleteStudent);
router.patch('/:id/toggle-status', toggleStudentStatus);

module.exports = router;