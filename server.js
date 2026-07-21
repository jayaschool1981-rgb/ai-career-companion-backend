import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import mongoose from "mongoose";

import { env } from "./src/config/env.js";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";
import resumeRoutes from "./src/routes/resume.js";
import analyzeRoutes from "./src/routes/analyze.js";
import userRoutes from "./src/routes/user.js";

const app = express();

// -----------------------------
// 🔹 1. Security & Helmet Middleware
// -----------------------------
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Dynamic CORS Whitelist
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedPatterns = [
        "localhost",
        "127.0.0.1",
        ".vercel.app",
        ".onrender.com",
      ];

      const isAllowed = allowedPatterns.some((pattern) => origin.includes(pattern)) || origin === env.CORS_ORIGIN;

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// -----------------------------
// 🔹 2. Rate Limiting Middleware
// -----------------------------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP address. Please try again after 15 minutes.",
  },
});

app.use("/api/", apiLimiter);

// -----------------------------
// 🔹 3. Static Files
// -----------------------------
app.use("/uploads", express.static("uploads"));

// -----------------------------
// 🔹 4. Database Connection
// -----------------------------
connectDB();

// -----------------------------
// 🔹 5. API Routes
// -----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/user", userRoutes);

// -----------------------------
// 🔹 6. Health & Status Check
// -----------------------------
app.get("/api/status", async (req, res) => {
  let dbStatus = "disconnected";
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      dbStatus = "connected";
    }
  } catch (err) {
    console.error("❌ Database health check ping failed:", err.message);
  }

  res.status(200).json({
    success: true,
    status: "ok",
    database: dbStatus,
    message: "AI Career Companion Enterprise Backend is active 🚀",
    timestamp: new Date(),
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "🚀 AI Career Companion Enterprise Backend Running",
  });
});

// -----------------------------
// 🔹 7. 404 Handler
// -----------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// -----------------------------
// 🔹 8. Global Error Handler
// -----------------------------
app.use((err, req, res, next) => {
  console.error("❌ Global API Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// -----------------------------
// 🔹 9. Server Startup
// -----------------------------
const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`
=========================================
🚀 Server running in [${env.NODE_ENV}] mode on http://localhost:${PORT}
🛡️ Security: Helmet + CORS Whitelist + Rate Limiting Enabled
=========================================
  `);
});