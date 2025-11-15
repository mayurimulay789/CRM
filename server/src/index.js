const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Force all variables into process.env
dotenv.config({
  path: path.resolve(__dirname, "../.env"), // adjust if your file is elsewhere
  override: true,
  processEnv: process.env, // 🔑 ensures EMAIL_USER and EMAIL_PASS are visible
});
console.log("✅ EMAIL_USER loaded:", !!process.env.EMAIL_USER);
console.log("✅ EMAIL_PASS loaded:", !!process.env.EMAIL_PASS);
// console.log("MONGO_URI:", process.env.MONGO_URI ? "******" : undefined);
console.log("✅ BCC_EMAIL:", process.env.BCC_EMAIL);


// Import routes
// const authRoutes = require("../routes/auth");
// const admissionRoutes = require('../routes/admissionRoutes');
// const enrolledStudentRoutes = require('../routes/enrolledStudentRoutes');
// const paymentRoutes = require('../routes/paymentRoutes');
const courseRoutes = require('../routes/courseRoutes');
const studentRoutes = require('../routes/studentRoutes');


dotenv.config({path: '../.env'});
// dotenv.config({ path: "./.env" });


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

// ✅ Import Routes
const onlineDemoRoutes = require("../routes/onlineDemoRoutes");
const offlineDemoRoutes = require("../routes/offlineDemoRoutes");
const oneToOneRoutes = require("../routes/oneToOneRoutes");
const liveClassRoutes = require("../routes/liveClassRoutes");

// ✅ Import additional routes (these were missing)
const authRoutes = require("../routes/auth");
const admissionRoutes = require("../routes/admissionRoutes");
const enrolledStudentRoutes = require("../routes/enrolledStudentRoutes");
const paymentRoutes = require("../routes/paymentRoutes");
const studentGrievanceRoutes = require("../routes/studentGrievanceRoutes");
const campusGrievanceRoutes = require("../routes/campusGrievanceRoutes");
const { searchApprovedStudents } = require("../controllers/admissionController");

// ✅ Use Routes
app.use("/api/onlineDemos", onlineDemoRoutes);
app.use("/api/offlineDemos", offlineDemoRoutes);
app.use("/api/oneToOneDemos", oneToOneRoutes);
app.use("/api/liveclasses", liveClassRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/api/enrolled-students", enrolledStudentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/student-grievances", studentGrievanceRoutes);
app.use("/api/campus-grievances", campusGrievanceRoutes);

// ✅ Direct route for search-approved-students (bypassing admission routes middleware)
app.get("/api/search-approved-students", searchApprovedStudents);


// ✅ Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend server running ✅" });
});


// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
