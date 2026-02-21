const mongoose = require("mongoose");

async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/recruiting-automation";
    await mongoose.connect(uri);
    console.log("[api] MongoDB connected");
  } catch (error) {
    console.error("[api] MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
