// Test End Ride Functionality
// Run this in browser console to test end ride API

async function testEndRide() {
  const token = localStorage.getItem('token');
  const rideDetails = localStorage.getItem('rideDetails');
  
  console.log('🧪 Testing End Ride Functionality');
  console.log('Token exists:', !!token);
  console.log('Ride details:', rideDetails);
  
  if (!token) {
    console.log('❌ No token found');
    return;
  }
  
  if (!rideDetails) {
    console.log('❌ No ride details found in localStorage');
    return;
  }
  
  let ride;
  try {
    ride = JSON.parse(rideDetails);
    console.log('📋 Parsed ride data:', ride);
  } catch (e) {
    console.log('❌ Invalid ride details JSON:', e);
    return;
  }
  
  if (!ride._id) {
    console.log('❌ No ride ID found');
    return;
  }
  
  console.log('📡 Sending end ride request...');
  
  try {
    const response = await fetch('http://localhost:4000/ride/end-ride', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token
      },
      body: JSON.stringify({
        rideId: ride._id
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ End ride successful:', data);
      
      // Clear localStorage like the app does
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("showPanel");
      localStorage.removeItem("showBtn");
      
      console.log('🧹 Cleared localStorage');
      console.log('🔄 Reload page to see updated state');
      
      return data;
    } else {
      console.log('❌ End ride failed:', response.status, data);
      return null;
    }
  } catch (error) {
    console.log('❌ Network error:', error);
    return null;
  }
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  console.log('🛠️ End Ride Test Tool Loaded');
  console.log('💡 Run testEndRide() to test the end ride functionality');
}

// Export for use
if (typeof module !== 'undefined') {
  module.exports = { testEndRide };
}