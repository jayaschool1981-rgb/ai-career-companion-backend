import mongoose from "mongoose";
import { env } from "./env.js";

let keepAliveInterval = null;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // IPv4 binding
    });

    console.log(`✅ MongoDB Connected Successfully to Host: ${conn.connection.host}`);

    // Reconnection & Error event listeners
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB Connection Error Event:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected. Attempting automatic reconnection...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected successfully.");
    });

    // -------------------------------------------------------------
    // 🧠 AUTOMATIC KEEP-ALIVE HEARTBEAT (Every 3 Minutes)
    // Prevents MongoDB Atlas free clusters from spinning down or
    // dropping idle TCP sockets during periods of inactivity.
    // -------------------------------------------------------------
    if (!keepAliveInterval) {
      keepAliveInterval = setInterval(async () => {
        try {
          if (mongoose.connection.readyState === 1) {
            await mongoose.connection.db.admin().ping();
            if (env.NODE_ENV === "development") {
              console.log("💓 AI Career Companion MongoDB Keep-Alive Ping Successful");
            }
          }
        } catch (pingErr) {
          console.error("⚠️ MongoDB Keep-Alive Ping Failed:", pingErr.message);
        }
      }, 3 * 60 * 1000); // 3-minute heartbeat
    }

  } catch (error) {
    console.error(`❌ MongoDB Connection Initial Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;