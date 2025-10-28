/**
 * Debug script to test logout functionality
 * This helps verify that logout works properly and clears all data
 */

// Test logout functionality
const testLogout = async () => {
  console.log('🧪 Testing logout functionality...');
  
  // Check current state before logout
  console.log('📋 Current localStorage state:');
  const beforeState = {
    token: localStorage.getItem('token'),
    userData: localStorage.getItem('userData'),
    rideDetails: localStorage.getItem('rideDetails'),
    messages: localStorage.getItem('messages')
  };
  
  Object.entries(beforeState).forEach(([key, value]) => {
    console.log(`   ${key}: ${value ? 'EXISTS' : 'NOT SET'}`);
  });
  
  // Test backend logout API
  const testBackendLogout = async () => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userType = userData.type || 'user';
    
    if (!token) {
      console.log('⚠️  No token found - user not logged in');
      return false;
    }
    
    try {
      console.log(`📡 Testing backend logout for ${userType}...`);
      
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'}/${userType}/logout`, {
        method: 'GET',
        headers: {
          'token': token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend logout successful:', data.message);
        return true;
      } else {
        console.log('❌ Backend logout failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.log('❌ Backend logout error:', error.message);
      return false;
    }
  };
  
  // Test localStorage clearing
  const testLocalStorageClear = () => {
    console.log('🧹 Testing localStorage clearing...');
    
    const keysToCheck = [
      'token',
      'userData',
      'user',
      'captain',
      'rideDetails',
      'panelDetails',
      'messages',
      'showPanel',
      'showBtn'
    ];
    
    // Clear the keys
    keysToCheck.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Verify they're cleared
    const afterState = {};
    keysToCheck.forEach(key => {
      afterState[key] = localStorage.getItem(key);
    });
    
    const allCleared = Object.values(afterState).every(value => value === null);
    
    console.log('📋 localStorage state after clearing:');
    Object.entries(afterState).forEach(([key, value]) => {
      console.log(`   ${key}: ${value === null ? '✅ CLEARED' : '❌ STILL EXISTS'}`);
    });
    
    return allCleared;
  };
  
  // Run tests
  console.log('\n🔄 Running logout tests...\n');
  
  const backendResult = await testBackendLogout();
  const localStorageResult = testLocalStorageClear();
  
  console.log('\n📊 Test Results:');
  console.log(`   Backend logout: ${backendResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   localStorage clear: ${localStorageResult ? '✅ PASS' : '❌ FAIL'}`);
  
  const overallResult = backendResult && localStorageResult;
  console.log(`   Overall: ${overallResult ? '✅ LOGOUT WORKING' : '❌ LOGOUT BROKEN'}`);
  
  return overallResult;
};

// Test user authentication state
const testAuthState = () => {
  console.log('🔐 Checking authentication state...');
  
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');
  
  console.log('📋 Authentication status:');
  console.log(`   Token: ${token ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`   User Data: ${userData ? '✅ EXISTS' : '❌ MISSING'}`);
  
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      console.log(`   User Type: ${parsed.type || 'UNKNOWN'}`);
      console.log(`   User ID: ${parsed.data?._id || 'UNKNOWN'}`);
    } catch (error) {
      console.log('   ❌ Invalid user data format');
    }
  }
  
  const isLoggedIn = !!(token && userData);
  console.log(`   Status: ${isLoggedIn ? '🟢 LOGGED IN' : '🔴 LOGGED OUT'}`);
  
  return isLoggedIn;
};

// Simulate logout process
const simulateLogout = async () => {
  console.log('🎭 Simulating complete logout process...');
  
  // Check initial state
  const initiallyLoggedIn = testAuthState();
  
  if (!initiallyLoggedIn) {
    console.log('⚠️  User not logged in - cannot test logout');
    return;
  }
  
  // Perform logout
  console.log('\n🚪 Performing logout...');
  await testLogout();
  
  // Check final state
  console.log('\n🔍 Checking final state...');
  const finallyLoggedIn = testAuthState();
  
  console.log(`\n📊 Logout simulation result: ${!finallyLoggedIn ? '✅ SUCCESS' : '❌ FAILED'}`);
};

// Export functions for use in browser console
window.logoutDebug = {
  testLogout,
  testAuthState,
  simulateLogout,
  testBackendLogout: async () => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userType = userData.type || 'user';
    
    if (!token) {
      console.log('No token found');
      return false;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'}/${userType}/logout`, {
        method: 'GET',
        headers: { 'token': token }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }
};

console.log('🔧 Logout Debug Tools Loaded!');
console.log('📖 Available functions:');
console.log('   - logoutDebug.testAuthState()');
console.log('   - logoutDebug.testLogout()');
console.log('   - logoutDebug.simulateLogout()');
console.log('   - logoutDebug.testBackendLogout()');

export {
  testLogout,
  testAuthState,
  simulateLogout
};