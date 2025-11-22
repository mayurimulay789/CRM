const express = require('express');
const router = express.Router();
const {
  recordPayment,
  getPayments,
  getPendingApprovals,
  approvePayment,
  rejectPayment,
  getPaymentStats,
  getPayment,
  deleteAllPayments,
  bulkApprovePayments
} = require('../controllers/paymentController');

const { protect, admin } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.delete('/deleteAll',admin,deleteAllPayments);

router.post('/', recordPayment);

router.get('/', getPayments);

router.get('/pending-approval', admin, getPendingApprovals);

router.get('/stats/overview', admin, getPaymentStats);

router.get('/:id', getPayment);

router.put('/:id/approve', admin, approvePayment);

router.put('/:id/reject', admin, rejectPayment);

router.post('/bulk-approve',admin, bulkApprovePayments);

//delete all payment for temparory


module.exports = router;