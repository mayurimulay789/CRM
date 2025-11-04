const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require("../routes/auth");
const admissionRoutes = require('../routes/admissionRoutes');
const enrolledStudentRoutes = require('../routes/enrolledStudentRoutes');
const paymentRoutes = require('../routes/paymentRoutes');
const courseRoutes = require('../routes/courseRoutes');


dotenv.config({path: '../.env'});
// dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



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
app.use('/api/admission', admissionRoutes);
app.use('/api/enrolled-students', enrolledStudentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/courses', courseRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
