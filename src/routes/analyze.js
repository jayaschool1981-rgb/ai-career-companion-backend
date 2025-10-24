// src/routes/analyze.js
import express from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfParse from "pdf-parse";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini API with your key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const text = req.body.text || "";
    const file = req.file;
    let resumeContent = text;

    // ✅ Step 1: Convert PDF to text if PDF uploaded
    if (file && file.mimetype === "application/pdf") {
      try {
        // Use pdfParse.default because of ESM import
        const pdfData = await pdfParse.default(file.buffer);
        resumeContent = pdfData.text;
      } catch (pdfError) {
        console.warn("⚠️ PDF parse failed, using raw text instead");
        resumeContent = file.buffer.toString("utf-8");
      }
    }
    // ✅ Step 2: Handle non-PDF files (DOCX, TXT, etc.)
    else if (file) {
      resumeContent = file.buffer.toString("utf-8");
    }

    // ✅ Step 3: Validate content
    if (!resumeContent.trim()) {
      return res.status(400).json({ message: "Please provide resume content." });
    }
// ✅ Step 4: Use the latest Gemini model (no 404 errors)
const modelName = "gemini-1.5-flash-latest";
console.log(`🧠 Gemini model in use: ${modelName}`);

const model = genAI.getGenerativeModel({ model: modelName });

// ... same prompt code ...

// ✅ Step 5: Generate AI content
const result = await model.generateContent(prompt);
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
    console.error("❌ Gemini analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Gemini analysis failed",
      error: error.message,
    });
  }
});

export default router;
