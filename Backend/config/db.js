const mongoose = require("mongoose");

// Simple MongoDB Atlas connection
const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    
    if (!mongoUrl) {
      throw new Error("MONGODB_URL not found in .env file");
    }

    console.log("🔄 Connecting to MongoDB Atlas...");
    
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log("✅ Connected to MongoDB Atlas");
    
  } catch (error) {
    console.error("❌ MongoDB Atlas connection failed:", error.message);
    console.log("⚠️  Server will continue without database");
    
    if (error.message.includes('ENOTFOUND')) {
      console.log("💡 Check your Atlas cluster URL and internet connection");
    } else if (error.message.includes('Authentication failed')) {
      console.log("💡 Check your username and password in the connection string");
    }
  }
};

// Connect to Atlas
connectDB();

module.exports = mongoose.connection;