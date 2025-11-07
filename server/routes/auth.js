const express = require('express');
const { registerUser,loginUser,logoutUser,getCurrentUser,updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);
router.post('/logout', logoutUser);

// get me
router.get('/me', protect, getCurrentUser);
router.put('/myprofile', protect, updateUserProfile);


module.exports = router;
