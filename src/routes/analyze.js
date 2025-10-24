// src/routes/analyze.js
import express from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfParse from "pdf-parse";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", upload.single("file"), async (req, res) => {
  console.log("🔍 Received /api/analyze request");
  console.log("File:", req.file ? req.file.originalname : "None");

  try {
    const text = req.body.text || "";
    const file = req.file;
    let resumeContent = text;

    // ✅ Step 1: Convert PDF to text if PDF uploaded
    if (file && file.mimetype === "application/pdf") {
      try {
        const pdfData = await pdfParse.default(file.buffer);
        resumeContent = pdfData.text;
      } catch (pdfError) {
        console.warn("⚠️ PDF parse failed, using raw text instead");
        resumeContent = file.buffer.toString("utf-8");
      }
    } else if (file) {
      resumeContent = file.buffer.toString("utf-8");
    }

    // ✅ Step 2: Validate resume content
    if (!resumeContent.trim()) {
      return res.status(400).json({ message: "Please provide resume content." });
    }

    // ✅ Step 3: Initialize Gemini model
    const modelName = "gemini-1.5-flash-latest";
    console.log(`🧠 Gemini model in use: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });

    // ✅ Step 4: Define the prompt **inside the same scope**
    const analysisPrompt = `
    You are a professional AI resume analyzer.
    Analyze the following resume and return a valid JSON ONLY.

    Required JSON fields:
    {
      "score": number (0–100),
      "skills": ["list of technical and soft skills"],
      "keywords": ["ATS-relevant keywords"],
      "feedback": "short paragraph of strengths and improvement suggestions"
    }

    Resume Content:
    ${resumeContent}
    `;

    // ✅ Step 5: Generate AI content
    const result = await model.generateContent(analysisPrompt);
    const responseText = result.response.text().trim();
    console.log("✅ Gemini analysis completed successfully!");

    // ✅ Step 6: Try parsing Gemini output into JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (err) {
      console.warn("⚠️ Gemini returned non-JSON, fallback triggered");
      data = {
        score: 70,
        skills: [],
        keywords: [],
        feedback: responseText,
      };
    }

    // ✅ Step 7: Send structured response to frontend
    res.json({ success: true, ...data });

  } catch (error) {
    console.error("❌ Gemini analysis error:", error.response?.data || error.message || error);
    res.status(500).json({
      success: false,
      message: "Gemini analysis failed",
      error: error.message,
    });
  }
});

export default router;
