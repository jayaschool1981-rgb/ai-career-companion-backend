// server.js
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
app.use("/uploads", express.static("uploads"));

// ✅ Database connection
connectDB();

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/user", userRoutes);

// ✅ Health check route (optional but recommended)
app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    message: "AI Career Companion Backend is running 🚀",
    model: "gemini-1.5-flash-latest",
  });
});

// ✅ Root route
app.get("/", (req, res) => {
  res.json({ message: "AI Career Companion Backend Running 🚀" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
