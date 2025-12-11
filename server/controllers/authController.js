const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const {generateToken} = require('../middleware/jwtToken');

const registerUser = async (req, res) => {
  const { FullName, email, password, role } = req.body;
  console.log("Registering user with data:", req.body);

  try {
    // Validation
    if (!FullName || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide FullName, email, and password' 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      FullName,
      email,
      password,
      role:'Counsellor',
    });

    console.log("User created:", user);

    // Generate token
    const token = generateToken(user._id);

    // ✅ FIXED: Return consistent structure with nested user object
    res.status(201).json({
      user: {  // ✅ Wrap user data in user object
        _id: user._id,
        FullName: user.FullName,
        email: user.email,
        role: user.role,
      },
      token: token,
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error("Registration error:", error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists` 
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: messages.join(', ') 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Find user by email and select password field explicitly
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ✅ FIXED: Return consistent structure with nested user object
    res.status(200).json({
      user: {  // ✅ Wrap user data in user object
        _id: user._id,
        FullName: user.FullName,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      },
      token: generateToken(user._id),
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const logoutUser = async (req, res) => {
  try {
    console.log(`User ${req.user?._id} logged out`);
    
    res.status(200).json({ 
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated'});
    }
    
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // ✅ FIXED: Return consistent structure
    res.status(200).json({
      user: {  // ✅ Wrap user data in user object
        _id: user._id,
        FullName: user.FullName,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields only
    user.FullName = req.body.FullName || user.FullName;
    user.phone = req.body.phone || user.phone;

    const updatedUser = await user.save();

    res.status(200).json({
      user: {
        _id: updatedUser._id,
        FullName: updatedUser.FullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const getAllCounsellor = async (req, res) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get search parameter
    const search = req.query.search || '';

    // Build search query
    let searchQuery = { role: 'Counsellor' };
    
    if (search) {
      searchQuery.$or = [
        { FullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const totalCounsellors = await User.countDocuments(searchQuery);

    // Find counsellors with pagination and search
    const counsellors = await User.find(searchQuery)
      .select('-password')
      .sort({ FullName: 1 })
      .skip(skip)
      .limit(limit);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCounsellors / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      message: 'Counsellors retrieved successfully',
      counsellors: counsellors.map(counsellor => ({
        _id: counsellor._id,
        FullName: counsellor.FullName,
        email: counsellor.email,
        role: counsellor.role,
        phone: counsellor.phone || null,
        createdAt: counsellor.createdAt,
        updatedAt: counsellor.updatedAt
      })),
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCounsellors: totalCounsellors,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
        limit: limit
      }
    });

  } catch (error) {
    console.error('Get All Counsellors Error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching counsellors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { 
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  getAllCounsellor
};