const mongoose = require("mongoose");
const adminModel = require("../models/admin.model");
require("dotenv").config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_CONNECT);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await adminModel.findOne({ email: "admin@rideapp.com" });
    if (existingAdmin) {
      console.log("Admin already exists with email: admin@rideapp.com");
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await adminModel.hashPassword("admin123456");
    
    const admin = new adminModel({
      fullname: {
        firstname: "Super",
        lastname: "Admin"
      },
      email: "admin@rideapp.com",
      password: hashedPassword,
      phone: "1234567890",
      role: "super_admin",
      permissions: {
        userManagement: true,
        driverManagement: true,
        rideManagement: true,
        paymentManagement: true,
        analytics: true,
        support: true,
      },
      isActive: true
    });

    await admin.save();
    
    console.log("Admin created successfully!");
    console.log("Email: admin@rideapp.com");
    console.log("Password: admin123456");
    console.log("Role: super_admin");
    
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();