// -----------------------------
// ✅ Load Environment Variables FIRST
// -----------------------------
import dotenv from "dotenv";
dotenv.config();

// -----------------------------
// ✅ Core Imports
// -----------------------------
import express from "express";
import cors from "cors";
import morgan from "morgan";

// -----------------------------
// ✅ Internal Imports
// -----------------------------
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";
import resumeRoutes from "./src/routes/resume.js";
import analyzeRoutes from "./src/routes/analyze.js";
import userRoutes from "./src/routes/user.js";

const app = express();

// -----------------------------
// ✅ ENV DEBUG (SAFE LOGGING)
// -----------------------------
console.log("🔐 ENV CHECK:");
console.log("➡️ OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY ? "Loaded ✅" : "Missing ❌");
console.log("➡️ MONGO_URI:", process.env.MONGO_URI ? "Loaded ✅" : "Missing ❌");

// -----------------------------
// ✅ Middleware
// -----------------------------
app.use(cors({
  origin: "*", // 🔥 change to frontend URL in production
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Logging middleware (pro)
app.use(morgan("dev"));

// ✅ Static files
app.use("/uploads", express.static("uploads"));

// -----------------------------
// ✅ Database Connection
// -----------------------------
connectDB();

// -----------------------------
// ✅ Routes
// -----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/user", userRoutes);

// -----------------------------
// ✅ Health Check Route
// -----------------------------
app.get("/api/status", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "AI Career Companion Backend is running 🚀",
    aiProvider: "OpenRouter",
    timestamp: new Date(),
  });
});

// -----------------------------
// ✅ Root Route
// -----------------------------
app.get("/", (req, res) => {
  res.status(200).json({
    message: "🚀 AI Career Companion Backend Running",
  });
});

// -----------------------------
// ❌ 404 Handler (IMPORTANT)
// -----------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// -----------------------------
// ❌ Global Error Handler (PRO 🔥)
// -----------------------------
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// -----------------------------
// 🚀 Start Server
// -----------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
=========================================
🚀 Server running on http://localhost:${PORT}
📦 Environment: ${process.env.NODE_ENV || "development"}
🤖 AI Provider: OpenRouter
=========================================
  `);
});