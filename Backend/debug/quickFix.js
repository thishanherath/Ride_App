/**
 * Quick Fix Script for Ride Visibility Issues
 * This script addresses common problems that prevent drivers from seeing user rides
 */

const mongoose = require('mongoose');
const rideModel = require('../models/ride.model');
const captainModel = require('../models/captain.model');
const userModel = require('../models/user.model');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickride');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Fix 1: Ensure all rides have proper vehicle types
const fixVehicleTypes = async () => {
  console.log('\n🔧 Fixing vehicle types...');
  
  const validTypes = ['car', 'bike', 'auto'];
  const rides = await rideModel.find({});
  
  let fixedCount = 0;
  for (const ride of rides) {
    if (!validTypes.includes(ride.vehicle)) {
      console.log(`⚠️ Invalid vehicle type found: ${ride.vehicle} for ride ${ride._id}`);
      
      // Try to fix common issues
      let fixedType = ride.vehicle.toLowerCase();
      if (fixedType === 'motorcycle') fixedType = 'bike';
      if (fixedType === 'rickshaw' || fixedType === 'tuk-tuk') fixedType = 'auto';
      if (fixedType === 'automobile') fixedType = 'car';
      
      if (validTypes.includes(fixedType)) {
        await rideModel.updateOne({ _id: ride._id }, { vehicle: fixedType });
        console.log(`✅ Fixed: ${ride.vehicle} → ${fixedType}`);
        fixedCount++;
      } else {
        console.log(`❌ Could not fix: ${ride.vehicle}`);
      }
    }
  }
  
  console.log(`🔧 Fixed ${fixedCount} vehicle type issues`);
};

// Fix 2: Ensure all captains have proper vehicle types
const fixCaptainVehicleTypes = async () => {
  console.log('\n🔧 Fixing captain vehicle types...');
  
  const validTypes = ['car', 'bike', 'auto'];
  const captains = await captainModel.find({});
  
  let fixedCount = 0;
  for (const captain of captains) {
    if (!captain.vehicle || !captain.vehicle.type || !validTypes.includes(captain.vehicle.type)) {
      console.log(`⚠️ Invalid captain vehicle type: ${captain.vehicle?.type} for captain ${captain._id}`);
      
      // Set default vehicle if missing
      if (!captain.vehicle) {
        await captainModel.updateOne(
          { _id: captain._id },
          {
            vehicle: {
              type: 'car',
              color: 'White',
              number: 'ABC-1234',
              capacity: 4
            }
          }
        );
        console.log(`✅ Added default vehicle for captain ${captain.fullname.firstname}`);
        fixedCount++;
      } else if (!validTypes.includes(captain.vehicle.type)) {
        let fixedType = captain.vehicle.type.toLowerCase();
        if (fixedType === 'motorcycle') fixedType = 'bike';
        if (fixedType === 'rickshaw' || fixedType === 'tuk-tuk') fixedType = 'auto';
        if (fixedType === 'automobile') fixedType = 'car';
        
        if (validTypes.includes(fixedType)) {
          await captainModel.updateOne(
            { _id: captain._id },
            { 'vehicle.type': fixedType }
          );
          console.log(`✅ Fixed captain vehicle: ${captain.vehicle.type} → ${fixedType}`);
          fixedCount++;
        }
      }
    }
  }
  
  console.log(`🔧 Fixed ${fixedCount} captain vehicle type issues`);
};

// Fix 3: Reset stuck rides to pending status
const resetStuckRides = async () => {
  console.log('\n🔧 Resetting stuck rides...');
  
  // Find rides that might be stuck (accepted but old)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const stuckRides = await rideModel.find({
    status: 'accepted',
    updatedAt: { $lt: oneHourAgo }
  });
  
  if (stuckRides.length > 0) {
    console.log(`⚠️ Found ${stuckRides.length} potentially stuck rides`);
    
    for (const ride of stuckRides) {
      await rideModel.updateOne(
        { _id: ride._id },
        { status: 'pending', captain: null }
      );
      console.log(`✅ Reset ride ${ride._id} to pending`);
    }
  } else {
    console.log('✅ No stuck rides found');
  }
};

// Fix 4: Create test data if database is empty
const createTestData = async () => {
  console.log('\n🔧 Checking for test data...');
  
  const userCount = await userModel.countDocuments();
  const captainCount = await captainModel.countDocuments();
  const rideCount = await rideModel.countDocuments();
  
  console.log(`📊 Current data: ${userCount} users, ${captainCount} captains, ${rideCount} rides`);
  
  // Create test user if none exist
  if (userCount === 0) {
    console.log('🆕 Creating test user...');
    const testUser = new userModel({
      fullname: {
        firstname: 'Test',
        lastname: 'User'
      },
      email: 'testuser@example.com',
      password: await userModel.hashPassword('password123'),
      phone: '0771234567'
    });
    await testUser.save();
    console.log('✅ Test user created');
  }
  
  // Create test captain if none exist
  if (captainCount === 0) {
    console.log('🆕 Creating test captain...');
    const testCaptain = new captainModel({
      fullname: {
        firstname: 'Test',
        lastname: 'Captain'
      },
      email: 'testcaptain@example.com',
      password: await captainModel.hashPassword('password123'),
      phone: '0777654321',
      vehicle: {
        type: 'car',
        color: 'White',
        number: 'CAR-1234',
        capacity: 4
      },
      location: {
        type: 'Point',
        coordinates: [79.8612, 6.9271] // Colombo coordinates
      },
      status: 'active'
    });
    await testCaptain.save();
    console.log('✅ Test captain created');
  }
  
  // Create test ride if none exist
  if (rideCount === 0) {
    const users = await userModel.find({});
    if (users.length > 0) {
      console.log('🆕 Creating test ride...');
      const testRide = new rideModel({
        user: users[0]._id,
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
      console.log('✅ Test ride created');
    }
  }
};

// Fix 5: Verify database indexes
const verifyIndexes = async () => {
  console.log('\n🔧 Verifying database indexes...');
  
  try {
    // Ensure indexes exist for better query performance
    await rideModel.collection.createIndex({ status: 1, vehicle: 1 });
    await rideModel.collection.createIndex({ createdAt: -1 });
    await captainModel.collection.createIndex({ 'vehicle.type': 1 });
    await captainModel.collection.createIndex({ status: 1 });
    
    console.log('✅ Database indexes verified');
  } catch (error) {
    console.log('⚠️ Index creation warning:', error.message);
  }
};

// Main fix function
const runQuickFix = async () => {
  console.log('🚀 Starting Quick Fix for Ride Visibility Issues...\n');
  
  await connectDB();
  
  try {
    await fixVehicleTypes();
    await fixCaptainVehicleTypes();
    await resetStuckRides();
    await createTestData();
    await verifyIndexes();
    
    console.log('\n✅ Quick fix completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your backend server');
    console.log('2. Clear browser localStorage and re-login');
    console.log('3. Test the ride booking flow');
    console.log('4. Check browser console for debug messages');
    
  } catch (error) {
    console.error('❌ Error during quick fix:', error);
  }
  
  process.exit(0);
};

// Run the fix
if (require.main === module) {
  runQuickFix();
}

module.exports = { runQuickFix };