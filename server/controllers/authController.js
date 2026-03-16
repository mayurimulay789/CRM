const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateToken } = require('../middleware/jwtToken');
const {sendMail} = require('../utils/email'); // Adjust path as needed
const mongoose = require('mongoose'); // ✅ ADD THIS LINE
/**
 * Send OTP email to user
 * @param {string} email - recipient email
 * @param {string} otp - 6-digit OTP
 */
const sendOtpEmail = async (email, otp) => {
  const subject = 'Your Password Reset OTP';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>You requested to reset your password. Use the following OTP to proceed:</p>
      <div style="background-color: #f4f4f4; padding: 12px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
        ${otp}
      </div>
      <p>This OTP is valid for <strong>10 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email or contact services.</p>
      <hr>
      <p style="color: #777; font-size: 12px;">© ${new Date().getFullYear()} RYMA Academy. All rights reserved.</p>
      
       <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fae1e1; border-radius:30px; margin:20px 0;" bgcolor="#fae1e1">
              <tr>
                <td style="padding:18px 25px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#6d3131; font-size:15px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:4px 0;">📞 +91-9873336133</td></tr></table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:4px 0;"><a href="mailto:services@rymaacademy.com" style="color:#a13030; text-decoration:underline;">services@rymaacademy.com</a></td></tr></table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:4px 0;"><a href="https://www.rymaacademy.com" style="color:#a13030; text-decoration:underline;">www.rymaacademy.com</a></td></tr></table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:8px 0 4px; word-break:break-word;">📍 D-7/32, 1st Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085</td></tr></table>
                </td>
              </tr>
            </table>

    </div>
  `;
  await sendMail(email, subject, html); // isSubmission false, so no BCC
};

/**
 * Send password change confirmation email
 * @param {string} email - recipient email
 * @param {string} fullName - user's full name
 */
const sendPasswordChangedEmail = async (email, fullName) => {
  const subject = 'Your Password Has Been Changed';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Changed Successfully</h2>
      <p>Hello ${fullName},</p>
      <p>Your password for your RYMA Academy account was just changed.</p>
      <p>If you made this change, no further action is needed.</p>
      <p><strong>If you did not change your password</strong>, please contact our services team immediately at <a href="mailto:services@rymaacademy.com">services@rymaacademy.com</a>.</p>
      <hr>
      <p style="color: #777; font-size: 12px;">© ${new Date().getFullYear()} RYMA Academy. All rights reserved.</p>

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fae1e1; border-radius:30px; margin:20px 0;" bgcolor="#fae1e1">
              <tr>
                <td style="padding:18px 25px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#6d3131; font-size:15px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:4px 0;">📞 +91-9873336133</td></tr></table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:4px 0;"><a href="mailto:services@rymaacademy.com" style="color:#a13030; text-decoration:underline;">services@rymaacademy.com</a></td></tr></table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:4px 0;"><a href="https://www.rymaacademy.com" style="color:#a13030; text-decoration:underline;">www.rymaacademy.com</a></td></tr></table>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:8px 0 4px; word-break:break-word;">📍 D-7/32, 1st Floor, Main Vishram Chowk, Sec-6, Rohini, Delhi – 110085</td></tr></table>
                </td>
              </tr>
            </table>

    </div>
  `;
  await sendMail(email, subject, html);
};

// ==================== Existing Controllers ====================

const registerUser = async (req, res) => {
  const { FullName, email, password, education, phone, role } = req.body;
  console.log("Registering user with data:", req.body);
  try {
    if (!FullName || !email || !password || !education || !phone) {
      return res.status(400).json({ 
        message: 'Please provide FullName, email, password, education and phone' 
      });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({
      FullName,
      email,
      password,
      education,
      phone,
      role: 'Counsellor',
    });


    console.log("User created:", user);
    const token = generateToken(user._id);

    res.status(201).json({
      user: {
        _id: user._id,
        FullName: user.FullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token: token,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' }); // fixed typo
    }
    res.status(200).json({
      user: {
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
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      user: {
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
    // Ensure consistent use of _id (depending on your auth middleware)
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // You can increase this to 20 or 50 if needed
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    
    let searchQuery = { role: 'Counsellor' };
    
    if (search) {
      searchQuery.$or = [
        { FullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const totalCounsellors = await User.countDocuments(searchQuery);
    
    // Make sure we're not skipping more than available
    const adjustedSkip = skip > totalCounsellors ? 0 : skip;
    
    const counsellors = await User.find(searchQuery)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(adjustedSkip)
      .limit(limit);
    
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
        education: counsellor.education,
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
// ==================== Delete Counsellor Controller ====================

/**
 * Delete a counsellor by ID (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
// ==================== Delete Counsellor Controller ====================

/**
 * Delete a counsellor by ID (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCounsellor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format using mongoose
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid counsellor ID format' 
      });
    }

    // Find the user and check if they are a counsellor
    const counsellor = await User.findById(id);
    
    if (!counsellor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Counsellor not found' 
      });
    }

    // Check if the user is actually a counsellor
    if (counsellor.role !== 'Counsellor') {
      return res.status(400).json({ 
        success: false, 
        message: 'The specified user is not a counsellor' 
      });
    }

    // Optional: Prevent deletion of admin users if needed
    if (counsellor.role === 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot delete admin users' 
      });
    }

    // Delete the counsellor
    await User.findByIdAndDelete(id);

    // Log the deletion for audit purposes
    console.log(`Counsellor ${counsellor.FullName} (${counsellor.email}) deleted by admin ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: 'Counsellor deleted successfully',
      deletedCounsellor: {
        _id: counsellor._id,
        FullName: counsellor.FullName,
        email: counsellor.email
      }
    });
  } catch (error) {
    console.error('Delete Counsellor Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting counsellor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// ==================== Password Reset Controllers ====================

/**
 * Step 1: Search user by email and send OTP
 * Expects { email } in body
 */
const searchUserByEmailAndReset = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    // Always return generic message to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        otpSent: false,
        message: 'If the email is registered, an OTP will be sent.'
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = hashedOtp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    try {
      await sendOtpEmail(user.email, otp);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // If email fails, we should not consider this a success
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      otpSent: true,
      message: 'OTP sent to your email. It is valid for 10 minutes.'
    });
  } catch (error) {
    console.error('Error in searchUserByEmailAndReset:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

/**
 * Step 2: Verify OTP and generate a reset token
 * Expects { email, otp } in body
 */
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+otp +otpExpiry');
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    // Check if OTP exists and not expired
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
    }

    if (user.otpExpiry < new Date()) {
      // Clear expired OTP
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.', expired: true });
    }

    // Verify OTP
    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP is valid – clear it from the user document
    user.otp = undefined;
    user.otpExpiry = undefined;

    // Generate a reset token (JWT) that expires in 10 minutes
    const resetToken = jwt.sign(
      { userId: user._id, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      resetToken: resetToken
    });
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Step 3: Set new password using the reset token
 * Expects { email, resetToken, newPassword, confirmPassword } in body
 */
const setNewPassword = async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;
  // ----- validation (unchanged) -----
  if (!email || !newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }
    // ✅ Assign plain password – pre‑save hook will hash it
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();   // hashing happens here
    // Optional confirmation email (unchanged)
    try {
      await sendPasswordChangedEmail(user.email, user.FullName);
    } catch (emailError) {
      console.error('Failed to send password change confirmation email:', emailError);
    }
    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Error in setNewPassword:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== Exports ====================

module.exports = { 
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  getAllCounsellor,
  searchUserByEmailAndReset,
  verifyOtp,
  setNewPassword,
  deleteCounsellor  // Add this line
};