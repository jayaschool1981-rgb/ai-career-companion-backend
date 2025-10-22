import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// For ESM path handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root of backend folder
const backendRoot = path.resolve(__dirname, "../../");

router.post("/resume", protect, async (req, res) => {
  try {
    const { filePath } = req.body;
    if (!filePath) {
      return res.status(400).json({ message: "File path required" });
    }

    // ✅ Dynamically import pdf-parse (common fix)
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = pdfParseModule.default || pdfParseModule;

    // ✅ Remove base URL part and construct absolute path
    const fileName = filePath.replace("http://localhost:5000/uploads/", "");
    const localFilePath = path.join(backendRoot, "uploads", fileName);

    console.log("🧩 Trying to read file at:", localFilePath);

    // ✅ Ensure file exists
    if (!fs.existsSync(localFilePath)) {
      return res.status(404).json({
        message: "File not found",
        attemptedPath: localFilePath,
      });
    }

    // ✅ Read the actual uploaded PDF
    const fileBuffer = fs.readFileSync(localFilePath);

    // ✅ Parse text
    const pdfData = await pdfParse(fileBuffer);

    // ✅ Basic mock ATS scoring logic
    const text = pdfData.text || "";
    const wordCount = text.split(/\s+/).length;
    const keywords = ["JavaScript", "React", "Node", "Python", "MongoDB"];
    const foundKeywords = keywords.filter((word) => text.includes(word));
    const atsScore = Math.min(100, 50 + foundKeywords.length * 10 + Math.floor(wordCount / 500));

    // ✅ Send response
    res.json({
      success: true,
      message: "Mock resume analysis completed successfully",
      atsScore,
      foundKeywords,
      analysis: `
✅ **AI Resume Analysis**
-------------------------
ATS Score: ${atsScore}/100
Found Keywords: ${foundKeywords.join(", ") || "None"}
Word Count: ${wordCount}

Suggestions:
1️⃣ Add measurable achievements
2️⃣ Include relevant tech keywords
3️⃣ Keep formatting clean and simple
`,
    });
  } catch (error) {
    console.error("❌ Analyzer Error:", error);
    res.status(500).json({
      message: "Failed to analyze resume",
      error: error.message,
    });
  }
});

export default router;
