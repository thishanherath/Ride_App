/**
 * Debug script to test ride creation and timeout behavior
 * This script helps verify that rides are created with correct status and timeout
 */

// Test ride creation timeout behavior
const testRideTimeout = () => {
  console.log('🧪 Testing ride timeout configuration...');
  
  // Check environment variables
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const rideTimeout = import.meta.env.VITE_RIDE_TIMEOUT;
  
  console.log('📋 Environment Configuration:');
  console.log(`   Server URL: ${serverUrl || 'NOT SET'}`);
  console.log(`   Ride Timeout: ${rideTimeout || 'NOT SET (will use 300000ms fallback)'}`);
  
  // Test timeout value
  const timeoutDuration = rideTimeout || 300000;
  const timeoutMinutes = Math.round(timeoutDuration / 60000);
  
  console.log(`⏱️  Timeout Configuration:`);
  console.log(`   Duration: ${timeoutDuration}ms (${timeoutMinutes} minutes)`);
  console.log(`   Status: ${timeoutDuration > 0 ? '✅ Valid' : '❌ Invalid (will cause immediate cancellation)'}`);
  
  return {
    serverUrl,
    rideTimeout,
    timeoutDuration,
    timeoutMinutes,
    isValid: timeoutDuration > 0
  };
};

// Test ride creation API call
const testRideCreationAPI = async (pickup, destination, vehicleType, token) => {
  console.log('🧪 Testing ride creation API...');
  
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
  
  try {
    const response = await fetch(`${serverUrl}/ride/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      },
      body: JSON.stringify({
        pickup,
        destination,
        vehicleType
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Ride created successfully:');
      console.log(`   Ride ID: ${data._id}`);
      console.log(`   Status: ${data.status || 'Not specified'}`);
      console.log(`   Vehicle: ${data.vehicle}`);
      console.log(`   Fare: ${data.fare}`);
      
      return { success: true, data };
    } else {
      console.log('❌ Ride creation failed:');
      console.log(`   Error: ${data.message || 'Unknown error'}`);
      
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.log('❌ Network error during ride creation:');
    console.log(`   Error: ${error.message}`);
    
    return { success: false, error: error.message };
  }
};

// Test ride status check
const testRideStatus = async (rideId, token) => {
  console.log('🧪 Testing ride status check...');
  
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
  
  try {
    // Note: This endpoint might not exist, adjust based on your API
    const response = await fetch(`${serverUrl}/ride/${rideId}`, {
      headers: {
        'token': token
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Ride status retrieved:');
      console.log(`   Status: ${data.status}`);
      console.log(`   Created: ${data.createdAt}`);
      console.log(`   Updated: ${data.updatedAt}`);
      
      return { success: true, data };
    } else {
      console.log('❌ Failed to get ride status');
      return { success: false };
    }
  } catch (error) {
    console.log('❌ Error checking ride status:', error.message);
    return { success: false, error: error.message };
  }
};

// Comprehensive ride creation test
const runRideCreationTest = async () => {
  console.log('🚀 Starting comprehensive ride creation test...\n');
  
  // Step 1: Test configuration
  const config = testRideTimeout();
  
  if (!config.isValid) {
    console.log('\n❌ Configuration test failed! Rides will be cancelled immediately.');
    console.log('💡 Fix: Set VITE_RIDE_TIMEOUT in your .env file (e.g., VITE_RIDE_TIMEOUT=300000)');
    return;
  }
  
  console.log('\n✅ Configuration test passed!\n');
  
  // Step 2: Test API (requires authentication)
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('⚠️  No authentication token found. Please log in first to test API calls.');
    return;
  }
  
  // Test ride creation
  const testPickup = 'Colombo Fort Railway Station, Colombo';
  const testDestination = 'Bandaranaike International Airport, Katunayake';
  const testVehicle = 'car';
  
  console.log('📍 Test ride details:');
  console.log(`   Pickup: ${testPickup}`);
  console.log(`   Destination: ${testDestination}`);
  console.log(`   Vehicle: ${testVehicle}\n`);
  
  const createResult = await testRideCreationAPI(testPickup, testDestination, testVehicle, token);
  
  if (createResult.success) {
    console.log('\n✅ Ride creation test passed!');
    
    // Wait a moment and check status
    setTimeout(async () => {
      await testRideStatus(createResult.data._id, token);
    }, 1000);
  } else {
    console.log('\n❌ Ride creation test failed!');
  }
};

// Export functions for use in browser console
window.rideDebug = {
  testRideTimeout,
  testRideCreationAPI,
  testRideStatus,
  runRideCreationTest
};

console.log('🔧 Ride Debug Tools Loaded!');
console.log('📖 Available functions:');
console.log('   - rideDebug.testRideTimeout()');
console.log('   - rideDebug.runRideCreationTest()');
console.log('   - rideDebug.testRideCreationAPI(pickup, destination, vehicle, token)');
console.log('   - rideDebug.testRideStatus(rideId, token)');

export {
  testRideTimeout,
  testRideCreationAPI,
  testRideStatus,
  runRideCreationTest
};