// ✅ Load env FIRST (VERY IMPORTANT)
import dotenv from "dotenv";
dotenv.config();

// ✅ Core imports
import express from "express";
import cors from "cors";

// ✅ Internal imports
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";
import resumeRoutes from "./src/routes/resume.js";
import analyzeRoutes from "./src/routes/analyze.js";
import userRoutes from "./src/routes/user.js";

const app = express();

// ✅ Debug (REMOVE later if needed)
console.log("🔑 GEMINI KEY LOADED:", process.env.GEMINI_API_KEY ? "YES" : "NO");

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ✅ Database connection
connectDB();

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/user", userRoutes);

// ✅ Health check route
app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    message: "AI Career Companion Backend is running 🚀",
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  });
});

// ✅ Root route
app.get("/", (req, res) => {
  res.json({
    message: "AI Career Companion Backend Running 🚀",
  });
});

// ✅ Global error handler (PRODUCTION LEVEL 🔥)
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.message);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});