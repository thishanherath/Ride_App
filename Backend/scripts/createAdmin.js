const mongoose = require("mongoose");
const adminModel = require("../models/admin.model");
require("dotenv").config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_DEV_URL || process.env.MONGODB_PROD_URL);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await adminModel.findOne({ email: "admin@quickride.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    const admin = await adminModel.create({
      fullname: {
        firstname: "Super",
        lastname: "Admin"
      },
      email: "admin@quickride.com",
      password: await adminModel.hashPassword("admin123"),
      phone: "1234567890",
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

    console.log("Admin user created successfully:");
    console.log("Email: admin@quickride.com");
    console.log("Password: admin123");
    console.log("Role: super_admin");

  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
