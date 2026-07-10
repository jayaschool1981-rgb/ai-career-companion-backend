import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const magicLink = `http://localhost:5173/?token=${token}`;
    console.log(`\n🔑 [MAGIC LINK GENERATED]: ${magicLink}\n`);

    res.status(200).json({
      success: true,
      message: "Magic link generated!",
      magicLink,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Magic link error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
