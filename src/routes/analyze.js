import express from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {
  console.log("🔍 Received /api/analyze request");

  try {
    // ✅ Runtime env check (FIXED)
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Missing GEMINI_API_KEY in environment",
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const text = req.body.text || "";
    const file = req.file;
    let resumeContent = text;

    // ✅ Step 1: Extract text from file
    if (file) {
      console.log("📄 File uploaded:", file.originalname);

      if (file.mimetype === "application/pdf") {
        try {
          const pdfData = await pdfParse(file.buffer);
          resumeContent = pdfData.text;
        } catch (pdfError) {
          console.warn("⚠️ PDF parsing failed, using raw buffer");
          resumeContent = file.buffer.toString("utf-8");
        }
      } else {
        resumeContent = file.buffer.toString("utf-8");
      }
    }

    // ✅ Step 2: Validate input
    if (!resumeContent.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide resume content.",
      });
    }

    // ✅ Step 3: Model selection
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";

    const model = genAI.getGenerativeModel({
      model: modelName,
    });

    // ✅ Step 4: Strong ATS Prompt
    const analysisPrompt = `
You are an expert ATS (Applicant Tracking System) and HR recruiter.

Analyze the resume and return STRICT JSON only.

{
  "score": number (0–100),
  "skills": ["technical + soft skills"],
  "keywords": ["ATS optimized keywords"],
  "feedback": "clear strengths, weaknesses, and actionable improvements",
  "missing_skills": ["important missing skills"],
  "experience_level": "Fresher | Junior | Mid | Senior"
}

IMPORTANT:
- Do NOT include markdown
- Do NOT add explanation
- Output ONLY valid JSON

Resume:
${resumeContent}
`;

    // ✅ Step 5: Call Gemini
    const result = await model.generateContent(analysisPrompt);
    const responseText = result.response.text().trim();

    // ✅ Step 6: Clean response
    const cleanedText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // ✅ Step 7: Safe JSON parse
    let data;
    try {
      data = JSON.parse(cleanedText);
    } catch (err) {
      console.warn("⚠️ Non-JSON response from Gemini");

      data = {
        score: 70,
        skills: [],
        keywords: [],
        feedback: responseText,
        missing_skills: [],
        experience_level: "Unknown",
      };
    }

    // ✅ Step 8: Response
    return res.json({
      success: true,
      ...data,
    });

  } catch (error) {
    console.error("❌ Gemini analysis error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Gemini analysis failed",
      error: error.message,
    });
  }
});

export default router;