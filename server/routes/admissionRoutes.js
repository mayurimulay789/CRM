const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admissionController');
const { protect,admin } = require('../middleware/auth');

router.use(protect);

router.post('/admissions', admissionController.createAdmission);
router.get('/admissions', admissionController.getAdmissions);
router.get('/admissions/:admissionNo', admissionController.getAdmission);
router.put('/admissions/:admissionNo', admissionController.updateAdmission);
router.delete('/admissions/:admissionNo', admissionController.deleteAdmission);
router.patch('/admissions/:admissionNo/verify-email', admissionController.verifyEmail);

module.exports = router;