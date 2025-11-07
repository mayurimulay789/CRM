const express = require('express');
const router = express.Router();
const enrolledStudentController = require('../controllers/enrolledStudentController');

router.post('/enroll/:admissionNo', enrolledStudentController.enrollStudent);
router.get('/enrolled-students', enrolledStudentController.getEnrolledStudents);
router.get('/enrolled-students/:admissionNo', enrolledStudentController.getEnrolledStudent);
router.put('/enrolled-students/:admissionNo', enrolledStudentController.updateEnrolledStudent);
router.patch('/enrolled-students/:admissionNo/emi/:emiType', enrolledStudentController.updateEMI);

module.exports = router;