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

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/analyze", analyzeRoutes); // Gemini runs here
app.use("/api/resume", resumeRoutes);
app.use("/api/user", userRoutes);

// Root Route
app.get("/", (req, res) => {
  res.json({ message: "AI Career Companion Backend Running 🚀" });
});

// Database Connection
connectDB();

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
