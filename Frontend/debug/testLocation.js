/**
 * Test Real-Time Location Functionality
 * Run this in browser console to test location features
 */

console.log('🧪 Testing Real-Time Location Functionality...\n');

// Test 1: Check if geolocation is supported
console.log('1. Geolocation Support:');
if ('geolocation' in navigator) {
  console.log('✅ Geolocation is supported');
} else {
  console.log('❌ Geolocation is NOT supported');
}

// Test 2: Check current location
console.log('\n2. Getting Current Location:');
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log('✅ Location obtained:');
      console.log(`   Latitude: ${position.coords.latitude}`);
      console.log(`   Longitude: ${position.coords.longitude}`);
      console.log(`   Accuracy: ${position.coords.accuracy} meters`);
      console.log(`   Timestamp: ${new Date(position.timestamp).toLocaleString()}`);
      
      // Test 3: Start watching location
      console.log('\n3. Starting Location Watching:');
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          console.log('📍 Location update:');
          console.log(`   Lat: ${position.coords.latitude}`);
          console.log(`   Lng: ${position.coords.longitude}`);
          console.log(`   Accuracy: ${position.coords.accuracy}m`);
          console.log(`   Speed: ${position.coords.speed || 'N/A'} m/s`);
        },
        (error) => {
          console.log('❌ Watch error:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      );
      
      console.log(`✅ Started watching location (ID: ${watchId})`);
      console.log('💡 Location updates will appear above');
      console.log('💡 To stop: navigator.geolocation.clearWatch(' + watchId + ')');
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        navigator.geolocation.clearWatch(watchId);
        console.log('\n🛑 Stopped location watching after 30 seconds');
      }, 30000);
    },
    (error) => {
      console.log('❌ Location error:', error.message);
      console.log('💡 Make sure to allow location permissions');
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000
    }
  );
} else {
  console.log('❌ Geolocation not available');
}

// Test 4: Check Google Maps API
console.log('\n4. Google Maps API Check:');
const apiKey = import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY;
if (apiKey && apiKey !== 'YOUR_REAL_API_KEY_HERE') {
  console.log('✅ Google Maps API key is configured');
  console.log('💡 Interactive map should work');
} else {
  console.log('⚠️  Google Maps API key not configured');
  console.log('💡 Will fallback to iframe map');
}

console.log('\n🎯 Test Results Summary:');
console.log('- Check browser console for location updates');
console.log('- Allow location permissions when prompted');
console.log('- Location should update every few seconds');
console.log('- Check the app UI for location status indicator');

export default function testLocation() {
  return 'Location test started - check console for results';
}