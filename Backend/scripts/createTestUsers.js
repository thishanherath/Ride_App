const mongoose = require("mongoose");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");
const adminModel = require("../models/admin.model");
require("dotenv").config();

async function createTestUsers() {
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.MONGODB_PROD_URL || process.env.MONGODB_DEV_URL || "mongodb://127.0.0.1:27017/quickRide";
    console.log("Connecting to MongoDB:", mongoUrl.replace(/\/\/.*@/, "//***:***@")); // Hide credentials in log
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");

    // Create test user (passenger)
    const existingUser = await userModel.findOne({ email: "user@test.com" });
    if (!existingUser) {
      const testUser = await userModel.create({
        fullname: {
          firstname: "John",
          lastname: "Passenger"
        },
        email: "user@test.com",
        password: await userModel.hashPassword("123456"),
        phone: "0771234567",
        emailVerified: true,
        isActive: true
      });
      console.log("✅ Test user created:");
      console.log("   Email: user@test.com");
      console.log("   Password: 123456");
      console.log("   Role: Passenger");
    } else {
      console.log("ℹ️  Test user already exists");
    }

    // Create test captain (driver)
    const existingCaptain = await captainModel.findOne({ email: "driver@test.com" });
    if (!existingCaptain) {
      const testCaptain = await captainModel.create({
        fullname: {
          firstname: "Mike",
          lastname: "Driver"
        },
        email: "driver@test.com",
        password: await captainModel.hashPassword("123456"),
        phone: "0777654321",
        vehicle: {
          color: "Red",
          number: "CAR-1234",
          capacity: 4,
          type: "car"
        },
        location: {
          type: "Point",
          coordinates: [79.8612, 6.9271] // Colombo coordinates
        },
        status: "active",
        emailVerified: true,
        isVerified: true
      });
      console.log("✅ Test captain created:");
      console.log("   Email: driver@test.com");
      console.log("   Password: 123456");
      console.log("   Role: Driver");
      console.log("   Vehicle: Red Car (CAR-1234)");
    } else {
      console.log("ℹ️  Test captain already exists");
    }

    // Create test admin
    const existingAdmin = await adminModel.findOne({ email: "admin@test.com" });
    if (!existingAdmin) {
      const testAdmin = await adminModel.create({
        fullname: {
          firstname: "Sarah",
          lastname: "Admin"
        },
        email: "admin@test.com",
        password: await adminModel.hashPassword("123456"),
        phone: "0779876543",
        role: "admin",
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
      console.log("✅ Test admin created:");
      console.log("   Email: admin@test.com");
      console.log("   Password: 123456");
      console.log("   Role: Admin");
    } else {
      console.log("ℹ️  Test admin already exists");
    }

    console.log("\n🎉 Test users setup complete!");
    console.log("\n📝 Login credentials:");
    console.log("Passenger: user@test.com / 123456");
    console.log("Driver:    driver@test.com / 123456");
    console.log("Admin:     admin@test.com / 123456");
    console.log("\n💡 You can now test the unified login with any of these accounts!");

  } catch (error) {
    console.error("❌ Error creating test users:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

createTestUsers();