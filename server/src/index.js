const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });


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


// ✅ Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend server running ✅" });
});

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
