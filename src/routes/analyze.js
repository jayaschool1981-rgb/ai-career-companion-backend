// src/routes/analyze.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse"); // ✅ safe CJS import
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", protect, upload.single("file"), async (req, res) => {
  try {
    let resumeText = "";

    if (req.file) {
      const filePath = req.file.path;

      if (!fs.existsSync(filePath)) {
        throw new Error(`Uploaded file not found: ${filePath}`);
      }

      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      resumeText = pdfData.text;

      // Cleanup uploaded file
      fs.unlinkSync(filePath);
    } else if (req.body.text) {
      resumeText = req.body.text;
    } else {
      return res.status(400).json({ message: "No file or text provided" });
    }

    // 🔧 Mock fallback (if no Hugging Face key)
    if (!process.env.HF_API_KEY) {
      const keywords = ["JavaScript", "React", "Node", "MongoDB", "Python"];
      const matched = keywords.filter((kw) => resumeText.includes(kw));
      const atsScore = Math.min(100, 50 + matched.length * 10);

      return res.status(200).json({
        success: true,
        message: "Mock Resume analysis (no AI key detected)",
        score: atsScore,
        skills: matched,
        feedback: `We found ${matched.length} important skills in your resume.`,
      });
    }
    // 🤖 Hugging Face AI analysis
    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-base",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Analyze the following resume text and provide:
      1. ATS score (0–100)
      2. Detected key technical skills
      3. 3 personalized improvement suggestions

      Resume:
      ${resumeText}`,
        }),
      }
    );



    if (!response.ok) throw new Error(`Hugging Face API error: ${response.statusText}`);

    const data = await response.json();
    const aiText = data?.[0]?.generated_text || "No response from Hugging Face model.";

    res.status(200).json({
      success: true,
      message: "AI Resume analysis completed",
      analysis: aiText,
    });
  } catch (error) {
    console.error("Analyze Error:", error);
    res.status(500).json({
      message: "Failed to analyze resume",
      error: error.message,
    });
  }
});

export default router;
