// src/routes/analyze.js
import express from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const text = req.body.text || "";
    const file = req.file;
    let resumeContent = text;

    // Optional: read uploaded file content (basic UTF-8)
    if (file) {
      resumeContent = file.buffer.toString("utf-8");
    }

    if (!resumeContent.trim()) {
      return res.status(400).json({ message: "Please provide resume content." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are an AI resume expert. Analyze the following resume and return a valid JSON only.
    Include:
    {
      "score": number between 0-100 representing overall quality,
      "skills": ["list of detected technical & soft skills"],
      "feedback": "short summary of improvements or suggestions",
      "keywords": ["suggested keywords for ATS optimization"]
    }
    Resume:
    ${resumeContent}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = {
        score: 75,
        skills: [],
        keywords: [],
        feedback: responseText,
      };
    }

    res.json({ success: true, ...data });
  } catch (error) {
    console.error("Gemini analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Gemini analysis failed",
      error: error.message,
    });
  }
});

export default router;
