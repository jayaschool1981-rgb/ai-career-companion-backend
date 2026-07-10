import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/user/scans - Get saved scans
router.get("/scans", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, scans: user.scans || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/user/scans - Save a scan
router.post("/scans", protect, async (req, res) => {
  try {
    const { scan } = req.body;
    if (!scan) return res.status(400).json({ message: "Scan data is required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prepend the new scan and keep the last 10 scans
    const updatedScans = [scan, ...(user.scans || [])].slice(0, 10);
    user.scans = updatedScans;
    await user.save();

    res.json({ success: true, scans: updatedScans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
