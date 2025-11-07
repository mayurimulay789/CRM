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



router.get('/', getAllStudents);

router.get('/stats/summary', getStudentStats);

router.get('/:id', getStudentById);

router.get('/studentId/:studentId', getStudentByStudentId);

router.post('/', createStudent);

router.put('/:id', updateStudent);

router.delete('/:id', deleteStudent);

router.patch('/:id/toggle-status', toggleStudentStatus);

module.exports = router;