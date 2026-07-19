import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/magic-link", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      const name = email.split("@")[0];
      const friendlyName = name.charAt(0).toUpperCase() + name.slice(1);
      user = await User.create({
        name: friendlyName,
        email,
        scans: []
      });
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    user.magicToken = token;
    user.magicTokenExpires = expires;
    await user.save();

    // Use FRONTEND_URL from environment or fallback to localhost
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const magicLink = `${frontendUrl}/?magicToken=${token}`;
    console.log(`\n🔑 [MAGIC LINK GENERATED]: ${magicLink}\n`);

    const responsePayload = {
      success: true,
      message: "Magic link generated!"
    };

    // Return the link in development mode only to prevent breaking the sandbox UI
    if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
      responsePayload.magicLink = magicLink;
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error("Magic link generation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/verify-magic", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const user = await User.findOne({
      magicToken: token,
      magicTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired magic link" });
    }

    // Clear verification token to ensure single-use
    user.magicToken = undefined;
    user.magicTokenExpires = undefined;
    await user.save();

    // Generate long-lived session JWT token
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Authentication successful",
      token: jwtToken,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Magic link verification error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
