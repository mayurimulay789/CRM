const express = require('express');
const { 
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  getAllCounsellor,
  deleteCounsellor,  // Add this import

  // New password reset controllers
  searchUserByEmailAndReset,
  verifyOtp,
  setNewPassword 
} = require('../controllers/authController');
const { protect, admin, adminOrCounsellor } = require('../middleware/auth');
const router = express.Router();

// ==================== Public Routes (No Authentication) ====================

// User login
router.post('/login', loginUser);

// Logout (still uses protect because it needs the user)
router.post('/logout', logoutUser);

// Password reset flow (all public)
router.post('/searchuserbyemailandreset', searchUserByEmailAndReset);
router.post('/verify-otp', verifyOtp);
router.post('/set-new-password', setNewPassword);

// ==================== Protected Routes (Require Authentication) ====================

// Register a new user (requires authentication – admin only? adjust as needed)
router.post('/register', protect, registerUser);

// Get current user profile
router.get('/me', protect, getCurrentUser);

// Update current user profile
router.put('/myprofile', protect, updateUserProfile);

// Get all counsellors (requires admin)
// router.get('/allCounsellor', protect, admin, getAllCounsellor);
router.delete('/counsellor/:id', protect, admin, deleteCounsellor);
// Get all counsellors (admin or counsellor)
router.get('/allCounsellor', protect, adminOrCounsellor, getAllCounsellor);

module.exports = router;