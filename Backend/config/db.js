const mongoose = require("mongoose");

// Simple and clean MongoDB Atlas connection
const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URL;
    
    if (!mongoUrl) {
      throw new Error("MONGODB_URL not found in environment variables");
    }

    console.log("🔄 Connecting to MongoDB Atlas...");
    
    // Clean connection options (removed unsupported options)
    const options = {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    };

    await mongoose.connect(mongoUrl, options);
    
    console.log("✅ Connected to MongoDB Atlas successfully");
    
  } catch (error) {
    console.error("❌ MongoDB Atlas connection failed:", error.message);
    console.log("⚠️  Server will continue without database");
    
    if (error.message.includes('Authentication failed')) {
      console.log("💡 Check your username and password in the connection string");
    } else if (error.message.includes('ENOTFOUND')) {
      console.log("💡 Check your Atlas cluster URL and internet connection");
    }
  }
};

// Connect to database
connectDB();

module.exports = mongoose.connection;