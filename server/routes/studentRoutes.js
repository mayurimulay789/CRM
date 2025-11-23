const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // optional auth middleware
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

// // Get all students
// router.get('/', protect, getAllStudents);

// // Get student stats
// router.get('/stats/summary', protect, getStudentStats);

// // Get student by ID
// router.get('/:id', protect, getStudentById);

// // Get student by studentId
// router.get('/studentId/:studentId', protect, getStudentByStudentId);

// // Create a student (with optional notification)
// router.post('/', protect, createStudent);

// // Update a student (with optional notification)
// router.put('/:id', protect, updateStudent);

// // Delete a student
// router.delete('/:id', protect, deleteStudent);

// // Toggle active/inactive status
// router.patch('/:id/toggle-status', protect, toggleStudentStatus);

// module.exports = router;

