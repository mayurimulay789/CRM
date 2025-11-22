const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables - FIX THIS LINE
dotenv.config({ path: path.join(__dirname, '../.env') });
// OR simply use:
// dotenv.config();

// Import routes
const authRoutes = require("../routes/auth");
const admissionRoutes = require('../routes/admissionRoutes');
const courseRoutes = require('../routes/courseRoutes');
const studentRoutes = require('../routes/studentRoutes');
const batchRoutes = require("../routes/batchRoutes");
const trainerRoutes = require("../routes/trainerRoutes");
const paymentRoutes = require('../routes/paymentRoutes');
const enrollmentRoutes = require('../routes/enrollmentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Cloudinary configuration
console.log('Cloudinary Config Check:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing',
  api_key: process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing',
  upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET ? '✅ Set' : '❌ Missing'
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/trainers", trainerRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});