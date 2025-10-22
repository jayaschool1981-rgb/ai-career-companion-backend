import express from "express";
import fs from "fs";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/resume", protect, async (req, res) => {
  try {
    const { filePath } = req.body;
    if (!filePath)
      return res.status(400).json({ message: "File path required" });

    // Dynamically import pdf-parse to avoid ENOENT test file issue
    const pdfModule = await import("pdf-parse");
    const pdf = pdfModule.default || pdfModule;

    // ✅ Convert the hosted Render path (or localhost) to a local path
    const relativePath = filePath.replace(
      "https://ai-career-backend.onrender.com/",
      ""
    ).replace("http://localhost:5000/", "");

    // ✅ Construct correct absolute path
    const localPath = path.join(process.cwd(), relativePath);

    // ✅ Ensure the file actually exists
    if (!fs.existsSync(localPath)) {
      return res.status(404).json({
        message: "File not found on server",
        path: localPath,
      });
    }

    // ✅ Read and parse the PDF
    const dataBuffer = fs.readFileSync(localPath);
    const pdfData = await pdf(dataBuffer);

    // ✅ Generate mock ATS analysis
    const wordCount = pdfData.text.split(/\s+/).length;
    const keywords = ["JavaScript", "React", "Node", "MongoDB", "Python"];
    const matched = keywords.filter((kw) => pdfData.text.includes(kw));
    const atsScore = Math.min(100, 50 + matched.length * 10 + Math.floor(wordCount / 500));

    res.status(200).json({
      success: true,
      message: "Mock resume analysis completed successfully",
      atsScore,
      matchedKeywords: matched,
    });
  } catch (error) {
    console.error("Mock Analyzer Error:", error);
    res.status(500).json({
      message: "Failed to analyze resume",
      error: error.message,
    });
  }
});

export default router;
