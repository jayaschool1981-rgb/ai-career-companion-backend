import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";
import resumeRoutes from "./src/routes/resume.js";
import analyzeRoutes from "./src/routes/analyze.js";
import userRoutes from "./src/routes/user.js";

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Static uploads folder
app.use("/uploads", express.static("uploads"));

// ✅ Routes
app.use("/api/auth", authRoutes);    // Register / Login
app.use("/api/resume", resumeRoutes); // File uploads
app.use("/api/analyze", analyzeRoutes); // Resume analysis
app.use("/api/user", userRoutes);     // User-related routes (protected)

// ✅ Default route
app.get("/", (req, res) => {
  res.send("AI Career Companion Backend Running 🚀");
});

// ✅ Connect Database
connectDB();

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
