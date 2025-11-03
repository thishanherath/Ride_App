/**
 * Profile Picture Diagnostic Script
 * Run this in browser console to diagnose profile picture issues
 */

console.log('🔍 Profile Picture Diagnostic Starting...');

// 1. Check Environment Variables
console.log('\n📋 Environment Check:');
console.log('VITE_SERVER_URL:', import.meta?.env?.VITE_SERVER_URL || 'Not available in console');
console.log('Current origin:', window.location.origin);

// 2. Check localStorage
console.log('\n💾 localStorage Check:');
const userData = localStorage.getItem('userData');
if (userData) {
  try {
    const parsed = JSON.parse(userData);
    console.log('✅ userData found:', parsed);
    console.log('User type:', parsed.type);
    console.log('User profile picture:', parsed.data?.profilePicture);
  } catch (error) {
    console.log('❌ Error parsing userData:', error);
  }
} else {
  console.log('❌ No userData in localStorage');
}

// 3. Check Authentication Token
console.log('\n🔑 Authentication Check:');
const token = localStorage.getItem('token');
if (token) {
  console.log('✅ Token found:', token.substring(0, 20) + '...');
} else {
  console.log('❌ No token found');
}

// 4. Test Backend Connection
console.log('\n🌐 Backend Connection Test:');
const SERVER_URL = 'http://localhost:4000'; // Update if different

async function testBackendConnection() {
  try {
    const response = await fetch(`${SERVER_URL}/user/profile`, {
      headers: {
        'token': token
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend connection successful');
      console.log('User profile data:', data.user);
      console.log('Profile picture from backend:', data.user?.profilePicture);
      return data.user;
    } else {
      console.log('❌ Backend connection failed:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.log('❌ Backend connection error:', error);
    return null;
  }
}

// 5. Test Profile Picture URL
async function testProfilePictureUrl(profilePicturePath) {
  if (!profilePicturePath) {
    console.log('❌ No profile picture path provided');
    return false;
  }
  
  const fullUrl = profilePicturePath.startsWith('http') 
    ? profilePicturePath 
    : `${SERVER_URL}${profilePicturePath}`;
    
  console.log('🔗 Testing profile picture URL:', fullUrl);
  
  try {
    const response = await fetch(fullUrl);
    if (response.ok) {
      console.log('✅ Profile picture URL accessible');
      console.log('Content-Type:', response.headers.get('content-type'));
      console.log('Content-Length:', response.headers.get('content-length'));
      return true;
    } else {
      console.log('❌ Profile picture URL not accessible:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Error accessing profile picture URL:', error);
    return false;
  }
}

// 6. Test Upload Directory
async function testUploadDirectory() {
  console.log('\n📁 Upload Directory Test:');
  try {
    const response = await fetch(`${SERVER_URL}/uploads/`);
    if (response.ok) {
      console.log('✅ Upload directory accessible');
    } else {
      console.log('❌ Upload directory not accessible:', response.status);
    }
  } catch (error) {
    console.log('❌ Error accessing upload directory:', error);
  }
}

// 7. Test Upload Endpoint
async function testUploadEndpoint() {
  console.log('\n📤 Upload Endpoint Test:');
  try {
    const response = await fetch(`${SERVER_URL}/user/upload-profile-picture`, {
      method: 'OPTIONS'
    });
    console.log('✅ Upload endpoint available');
  } catch (error) {
    console.log('❌ Upload endpoint not available:', error);
  }
}

// 8. Check DOM Elements
function checkDOMElements() {
  console.log('\n🎨 DOM Elements Check:');
  
  const profileImage = document.querySelector('img[alt="Profile preview"]');
  if (profileImage) {
    console.log('✅ Profile image element found');
    console.log('Image src:', profileImage.src);
    console.log('Image naturalWidth:', profileImage.naturalWidth);
    console.log('Image naturalHeight:', profileImage.naturalHeight);
    console.log('Image complete:', profileImage.complete);
  } else {
    console.log('❌ Profile image element not found');
  }
  
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) {
    console.log('✅ File input found');
    console.log('Accept attribute:', fileInput.accept);
  } else {
    console.log('❌ File input not found');
  }
}

// 9. Run All Tests
async function runAllTests() {
  console.log('\n🚀 Running All Tests...');
  
  // Test backend connection and get user data
  const user = await testBackendConnection();
  
  // Test profile picture URL if available
  if (user?.profilePicture) {
    await testProfilePictureUrl(user.profilePicture);
  }
  
  // Test upload directory
  await testUploadDirectory();
  
  // Test upload endpoint
  await testUploadEndpoint();
  
  // Check DOM elements
  checkDOMElements();
  
  console.log('\n✅ Diagnostic Complete!');
  
  // Summary
  console.log('\n📊 Summary:');
  console.log('- Backend connection:', user ? '✅' : '❌');
  console.log('- User has profile picture:', user?.profilePicture ? '✅' : '❌');
  console.log('- Authentication token:', token ? '✅' : '❌');
  console.log('- localStorage userData:', userData ? '✅' : '❌');
}

// 10. Helper Functions for Manual Testing
window.profilePictureDiagnostic = {
  runAllTests,
  testBackendConnection,
  testProfilePictureUrl,
  testUploadDirectory,
  testUploadEndpoint,
  checkDOMElements,
  
  // Quick test function
  quickTest: async () => {
    console.log('🔍 Quick Profile Picture Test');
    const user = await testBackendConnection();
    if (user?.profilePicture) {
      await testProfilePictureUrl(user.profilePicture);
    }
    checkDOMElements();
  },
  
  // Test specific URL
  testUrl: async (url) => {
    console.log('🔗 Testing specific URL:', url);
    await testProfilePictureUrl(url);
  },
  
  // Get current user data
  getCurrentUser: async () => {
    const user = await testBackendConnection();
    console.log('Current user:', user);
    return user;
  },
  
  // Simulate file upload test
  simulateUpload: async (file) => {
    if (!file) {
      console.log('❌ No file provided for upload test');
      return;
    }
    
    console.log('📤 Simulating file upload:', file.name);
    
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    try {
      const response = await fetch(`${SERVER_URL}/user/upload-profile-picture`, {
        method: 'POST',
        headers: {
          'token': token
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Upload successful:', data);
        return data;
      } else {
        console.log('❌ Upload failed:', response.status);
        const errorData = await response.json();
        console.log('Error details:', errorData);
        return null;
      }
    } catch (error) {
      console.log('❌ Upload error:', error);
      return null;
    }
  }
};

// Auto-run tests
runAllTests();

console.log('\n💡 Available functions:');
console.log('- profilePictureDiagnostic.quickTest()');
console.log('- profilePictureDiagnostic.testUrl("your-url-here")');
console.log('- profilePictureDiagnostic.getCurrentUser()');
console.log('- profilePictureDiagnostic.simulateUpload(fileObject)');
console.log('- profilePictureDiagnostic.runAllTests()');