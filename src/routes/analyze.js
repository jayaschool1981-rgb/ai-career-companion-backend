import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 🧩 Primary analyzer route
router.post("/", protect, upload.single("file"), async (req, res) => {
  try {
    const pdfModule = await import("pdf-parse");
    const pdf = pdfModule.default || pdfModule;

    let resumeText = "";

    if (req.file) {
      // File uploaded
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdf(dataBuffer);
      resumeText = pdfData.text;
    } else if (req.body.text) {
      // Text pasted
      resumeText = req.body.text;
    } else {
      return res.status(400).json({ message: "No file or text provided" });
    }

    // 🔍 Mock analysis logic
    const keywords = ["JavaScript", "React", "Node", "MongoDB", "Python"];
    const matched = keywords.filter((kw) => resumeText.includes(kw));
    const wordCount = resumeText.split(/\s+/).length;
    const atsScore = Math.min(100, 50 + matched.length * 10 + Math.floor(wordCount / 500));

    res.status(200).json({
      success: true,
      message: "Resume analyzed successfully",
      score: atsScore,
      skills: matched,
      keywords,
      feedback: `We found ${matched.length} important skills in your resume.`,
    });
  } catch (error) {
    console.error("Analyze Error:", error);
    res.status(500).json({
      message: "Failed to analyze resume",
      error: error.message,
    });
  }
});

// Export router
export default router;
