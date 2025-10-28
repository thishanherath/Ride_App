/**
 * Debug script to test the available rides functionality
 * Run this script to check if rides are being created and retrieved properly
 */

const mongoose = require('mongoose');
const rideModel = require('../models/ride.model');
const captainModel = require('../models/captain.model');
const userModel = require('../models/user.model');

// Connect to MongoDB (adjust connection string as needed)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickride');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test function to check available rides
const testAvailableRides = async () => {
  try {
    console.log('\n🔍 Testing Available Rides Functionality...\n');

    // 1. Check if there are any rides in the database
    const allRides = await rideModel.find({});
    console.log(`📊 Total rides in database: ${allRides.length}`);

    // 2. Check pending rides
    const pendingRides = await rideModel.find({ status: 'pending' });
    console.log(`⏳ Pending rides: ${pendingRides.length}`);

    if (pendingRides.length > 0) {
      console.log('\n📋 Pending rides details:');
      pendingRides.forEach((ride, index) => {
        console.log(`${index + 1}. ID: ${ride._id}`);
        console.log(`   Vehicle: ${ride.vehicle}`);
        console.log(`   Pickup: ${ride.pickup}`);
        console.log(`   Destination: ${ride.destination}`);
        console.log(`   Fare: Rs. ${ride.fare}`);
        console.log(`   Created: ${ride.createdAt}`);
        console.log(`   Status: ${ride.status}`);
        console.log('   ---');
      });
    }

    // 3. Check captains
    const allCaptains = await captainModel.find({});
    console.log(`\n👨‍✈️ Total captains in database: ${allCaptains.length}`);

    if (allCaptains.length > 0) {
      console.log('\n👨‍✈️ Captain details:');
      allCaptains.forEach((captain, index) => {
        console.log(`${index + 1}. ID: ${captain._id}`);
        console.log(`   Name: ${captain.fullname.firstname} ${captain.fullname.lastname}`);
        console.log(`   Vehicle Type: ${captain.vehicle?.type}`);
        console.log(`   Status: ${captain.status}`);
        console.log(`   Location: ${captain.location?.coordinates}`);
        console.log('   ---');
      });
    }

    // 4. Test the getAvailableRides logic for each captain
    for (const captain of allCaptains) {
      console.log(`\n🔍 Testing available rides for captain: ${captain.fullname.firstname}`);
      
      // Simulate the getAvailableRides query
      const availableRides = await rideModel
        .find({
          status: "pending",
          vehicle: captain.vehicle.type,
        })
        .populate("user", "fullname phone")
        .sort({ createdAt: -1 })
        .limit(20);

      console.log(`   Available rides for ${captain.vehicle.type}: ${availableRides.length}`);
      
      if (availableRides.length > 0) {
        availableRides.forEach((ride, index) => {
          console.log(`   ${index + 1}. ${ride.pickup} → ${ride.destination} (Rs. ${ride.fare})`);
        });
      }
    }

    // 5. Check users
    const allUsers = await userModel.find({});
    console.log(`\n👤 Total users in database: ${allUsers.length}`);

    // 6. Create a test ride if no pending rides exist
    if (pendingRides.length === 0 && allUsers.length > 0) {
      console.log('\n🚀 Creating a test ride...');
      
      const testRide = new rideModel({
        user: allUsers[0]._id,
        pickup: 'Colombo Fort Railway Station, Colombo, Sri Lanka',
        destination: 'Bandaranaike International Airport, Katunayake, Sri Lanka',
        fare: 2500,
        vehicle: 'car',
        status: 'pending',
        duration: 2700, // 45 minutes
        distance: 35000, // 35 km
        otp: '123456'
      });

      await testRide.save();
      console.log('✅ Test ride created successfully!');
      console.log(`   Ride ID: ${testRide._id}`);
      console.log(`   Vehicle: ${testRide.vehicle}`);
      console.log(`   Status: ${testRide.status}`);
    }

  } catch (error) {
    console.error('❌ Error testing available rides:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await testAvailableRides();
  
  console.log('\n✅ Debug test completed!');
  console.log('\n💡 Troubleshooting tips:');
  console.log('1. Make sure you have created rides as a user first');
  console.log('2. Ensure rides have status "pending"');
  console.log('3. Check that captain vehicle type matches ride vehicle type');
  console.log('4. Verify captain authentication token is valid');
  console.log('5. Check network connectivity between frontend and backend');
  
  process.exit(0);
};

// Run the test
if (require.main === module) {
  main();
}

module.exports = { testAvailableRides };