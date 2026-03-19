import express from "express";
import multer from "multer";
import { createRequire } from "module";
import { generateSEOContent } from "../services/aiService.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const router = express.Router();

// -----------------------------
// ✅ Multer (Memory Storage)
// -----------------------------
const upload = multer({ storage: multer.memoryStorage() });

// -----------------------------
// 🚀 ANALYZE ROUTE
// -----------------------------
router.post("/", upload.single("file"), async (req, res) => {
  console.log("🔍 /api/analyze request received");

  try {
    // -----------------------------
    // ✅ ENV CHECK
    // -----------------------------
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("❌ Missing OPENROUTER_API_KEY");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const text = req.body.text || "";
    const file = req.file;
    let resumeContent = text;

    // -----------------------------
    // 📄 FILE PARSING
    // -----------------------------
    if (file) {
      console.log("📄 File uploaded:", file.originalname);

      if (file.mimetype === "application/pdf") {
        try {
          const pdfData = await pdfParse(file.buffer);
          resumeContent = pdfData.text;
        } catch (err) {
          console.warn("⚠️ PDF parsing failed, fallback to raw text");
          resumeContent = file.buffer.toString("utf-8");
        }
      } else {
        resumeContent = file.buffer.toString("utf-8");
      }
    }

    // -----------------------------
    // ❌ VALIDATION
    // -----------------------------
    if (!resumeContent || !resumeContent.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please upload resume or paste content",
      });
    }

    // -----------------------------
    // 🧠 STRONG PROMPT (LLaMA FIXED)
    // -----------------------------
    const analysisPrompt = `
You are a highly accurate ATS (Applicant Tracking System).

STRICT RULES:
- Return ONLY valid JSON
- NO markdown
- NO explanation
- NO "NR" values
- ALL fields must be filled

FORMAT:
{
  "score": number (0-100),
  "skills": ["at least 5 relevant skills"],
  "keywords": ["important ATS keywords"],
  "feedback": "clear actionable improvements",
  "missing_skills": ["important missing skills"],
  "experience_level": "Fresher | Junior | Mid | Senior"
}

INSTRUCTIONS:
- Extract real skills from resume
- If missing data → intelligently infer
- Never return empty arrays

Resume:
${resumeContent}
`;

    // -----------------------------
    // 🔥 CALL AI SERVICE
    // -----------------------------
    const aiResponse = await generateSEOContent(analysisPrompt);

    if (!aiResponse.success) {
      console.error("❌ AI Error:", aiResponse.error);
      return res.status(500).json({
        success: false,
        message: "AI service failed",
        error: aiResponse.error,
      });
    }

    // -----------------------------
    // 🧹 CLEAN AI RESPONSE
    // -----------------------------
    let cleanedText = aiResponse.data
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // -----------------------------
    // 🛡️ SAFE PARSE
    // -----------------------------
    let parsedData;

    try {
      parsedData = JSON.parse(cleanedText);
    } catch (err) {
      console.warn("⚠️ AI returned non-JSON → fallback");

      parsedData = {
        score: 65,
        skills: ["JavaScript", "React", "Node.js"],
        keywords: ["frontend", "backend", "API"],
        feedback: cleanedText,
        missing_skills: ["System Design", "Testing"],
        experience_level: "Junior",
      };
    }

    // -----------------------------
    // ✅ FINAL RESPONSE
    // -----------------------------
    return res.status(200).json({
      success: true,
      source: "openrouter",
      ...parsedData,
    });

  } catch (error) {
    console.error("❌ Analyze Crash:", error);

    return res.status(500).json({
      success: false,
      message: "Analysis failed",
      error: error.message,
    });
  }
});

export default router;