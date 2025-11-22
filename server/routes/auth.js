const express = require('express');
const { registerUser,loginUser,logoutUser,getCurrentUser,updateUserProfile,getAllCounsellor } = require('../controllers/authController');
const { protect,admin } = require('../middleware/auth');
const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);
router.post('/logout', logoutUser);

// get me
router.get('/me', protect, getCurrentUser);
router.put('/myprofile', protect, updateUserProfile);

//get all counsellor
router.get('/allCounsellor',protect,admin,getAllCounsellor);


module.exports = router;
