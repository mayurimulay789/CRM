const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables - FIX THIS LINE
dotenv.config({ path: path.join(__dirname, '../.env') });


const onlineDemoRoutes = require("../routes/onlineDemoRoutes");
const offlineDemoRoutes = require("../routes/offlineDemoRoutes");
const oneToOneRoutes = require("../routes/oneToOneRoutes");
const liveClassRoutes = require("../routes/liveClassRoutes");
const authRoutes = require("../routes/auth");
const admissionRoutes = require('../routes/admissionRoutes');
const courseRoutes = require('../routes/courseRoutes');
const studentRoutes = require('../routes/studentRoutes');
const batchRoutes = require("../routes/batchRoutes");
const trainerRoutes = require("../routes/trainerRoutes");
const paymentRoutes = require('../routes/paymentRoutes');
const enrollmentRoutes = require('../routes/enrollmentRoutes');

const studentGrievanceRoutes = require("../routes/studentGrievanceRoutes");
const campusGrievanceRoutes = require("../routes/campusGrievanceRoutes");


// Force all variables into process.env
dotenv.config({
  path: path.resolve(__dirname, "../.env"), 
  override: true,
  processEnv: process.env, 
});

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));




// Test Cloudinary configuration
console.log('Cloudinary Config Check:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing',
  api_key: process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing',
  upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET ? '✅ Set' : '❌ Missing'
});




// ✅ Use Routes
app.use("/api/onlineDemos", onlineDemoRoutes);
app.use("/api/offlineDemos", offlineDemoRoutes);
app.use("/api/oneToOneDemos", oneToOneRoutes);
app.use("/api/liveclasses", liveClassRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/batches', batchRoutes);
app.use("/api/student-grievances", studentGrievanceRoutes);
app.use("/api/campus-grievances", campusGrievanceRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/students', studentRoutes);



app.get("/", (req, res) => {
  res.json({ message: "Backend server running ✅" });
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

