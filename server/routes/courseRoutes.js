const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  toggleCourseStatus
} = require('../controllers/courseController');

const { protect,admin } = require('../middleware/auth');

router.use(protect);

router.post('/',admin, createCourse);

router.get('/', getAllCourses);

router.get('/:id', getCourseById);

router.put('/:id',admin, updateCourse);

router.delete('/:id',admin, deleteCourse);

router.patch('/:id/toggle-status',admin, toggleCourseStatus);

module.exports = router;