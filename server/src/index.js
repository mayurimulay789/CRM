const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// ✅ Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Import Routes
const onlineDemoRoutes = require("./routes/onlineDemoRoutes");
const offlineDemoRoutes = require("./routes/offlineDemoRoutes");
const oneToOneRoutes = require("./routes/oneToOneRoutes");
const liveClassRoutes = require ("./routes/liveClassRoutes");

// ✅ Use Routes
app.use("/api/onlineDemos", onlineDemoRoutes);
app.use("/api/offlineDemos", offlineDemoRoutes);
app.use("/api/oneToOneDemos", oneToOneRoutes);
app.use("/api/liveclasses", liveClassRoutes);

// ✅ Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend server running ✅" });
});

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
