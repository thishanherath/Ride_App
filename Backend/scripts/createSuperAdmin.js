const mongoose = require("mongoose");
const adminModel = require("../models/admin.model");
require("dotenv").config();

async function createMasterAdmin() {
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_PROD_URL || process.env.MONGODB_DEV_URL || "mongodb://127.0.0.1:27017/quickRide";
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");

    // Remove any existing admin accounts to ensure single admin
    await adminModel.deleteMany({});
    console.log("🧹 Cleared existing admin accounts");

    // Create Single Master Admin with full access
    const masterAdmin = await adminModel.create({
      fullname: {
        firstname: "Master",
        lastname: "Administrator"
      },
      email: "admin@quickride.lk",
      password: await adminModel.hashPassword("QuickRide@Admin2024!"),
      phone: "0112345678",
      role: "super_admin",
      permissions: {
        userManagement: true,
        driverManagement: true,
        rideManagement: true,
        paymentManagement: true,
        analytics: true,
        support: true
      },
      isActive: true
    });
    
    console.log("✅ Master Admin created successfully!");
    console.log("\n🎉 Single Admin System Setup Complete!");
    console.log("\n🔐 MASTER ADMIN CREDENTIALS:");
    console.log("==========================================");
    console.log("Email:    admin@quickride.lk");
    console.log("Password: QuickRide@Admin2024!");
    console.log("Role:     Master Administrator");
    console.log("Access:   FULL SYSTEM CONTROL");
    console.log("Features: Users, Drivers, Rides, Payments, Analytics, Support");
    console.log("==========================================");
    console.log("\n🚀 Access Admin Panel:");
    console.log("URL: http://localhost:5173/admin/login");
    console.log("Use the credentials above to login");

  } catch (error) {
    console.error("❌ Error creating master admin:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

createMasterAdmin();