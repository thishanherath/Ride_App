const axios = require('axios');

// Test ride acceptance functionality
async function testRideAcceptance() {
  const SERVER_URL = 'http://localhost:4000';
  
  try {
    console.log('🧪 Testing Ride Acceptance Flow...\n');
    
    // Step 1: Create a test user and captain (you'll need to have these in your database)
    console.log('📋 Prerequisites:');
    console.log('- Make sure you have a test user and captain in your database');
    console.log('- Make sure the captain is logged in and has a valid token');
    console.log('- Make sure there are pending rides in the database\n');
    
    // Step 2: Test getting available rides
    console.log('🔍 Step 1: Testing available rides endpoint...');
    
    // You'll need to replace this with a real captain token
    const captainToken = 'your-captain-token-here';
    
    if (captainToken === 'your-captain-token-here') {
      console.log('❌ Please update the captainToken variable with a real token');
      console.log('   You can get this from the browser localStorage after logging in as a captain');
      return;
    }
    
    try {
      const availableRidesResponse = await axios.get(
        `${SERVER_URL}/ride/available-rides`,
        {
          headers: { token: captainToken }
        }
      );
      
      console.log('✅ Available rides fetched successfully');
      console.log(`   Found ${availableRidesResponse.data.rides.length} rides`);
      
      if (availableRidesResponse.data.rides.length === 0) {
        console.log('⚠️  No rides available for testing. Create a ride first.');
        return;
      }
      
      // Step 3: Test accepting a ride
      const testRide = availableRidesResponse.data.rides[0];
      console.log(`\n🎯 Step 2: Testing ride acceptance for ride ${testRide._id}...`);
      
      const acceptResponse = await axios.post(
        `${SERVER_URL}/ride/confirm`,
        { rideId: testRide._id },
        {
          headers: { token: captainToken }
        }
      );
      
      console.log('✅ Ride accepted successfully!');
      console.log('   Response:', {
        rideId: acceptResponse.data._id,
        status: acceptResponse.data.status,
        captain: acceptResponse.data.captain?.fullname,
        otp: acceptResponse.data.otp
      });
      
      console.log('\n🎉 Ride acceptance test completed successfully!');
      
    } catch (apiError) {
      console.error('❌ API Error:', {
        status: apiError.response?.status,
        message: apiError.response?.data?.message || apiError.message,
        endpoint: apiError.config?.url
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions for manual testing
function printManualTestInstructions() {
  console.log('\n📖 Manual Testing Instructions:');
  console.log('1. Start your backend server (npm run dev)');
  console.log('2. Open your frontend and login as a captain');
  console.log('3. Open browser DevTools > Application > Local Storage');
  console.log('4. Copy the "token" value');
  console.log('5. Replace "your-captain-token-here" in this script with the real token');
  console.log('6. Make sure you have at least one pending ride in the database');
  console.log('7. Run this script: node Backend/debug/testRideAcceptance.js\n');
}

// Run the test
if (require.main === module) {
  printManualTestInstructions();
  testRideAcceptance();
}

module.exports = { testRideAcceptance };