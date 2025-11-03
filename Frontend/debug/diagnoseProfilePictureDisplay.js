/**
 * Profile Picture Display Diagnostic Tool
 * Run this in browser console to diagnose profile picture display issues
 */

console.log('🔍 Starting Profile Picture Display Diagnosis...');

// Check if utility functions are available
try {
  const { getUserAvatar, getUserDisplayName, mapUserForComponents } = await import('/src/utils/profilePicture.js');
  console.log('✅ Profile picture utilities loaded successfully');
  
  // Test utility functions
  const testUser = {
    fullname: { firstname: 'John', lastname: 'Doe' },
    profilePicture: '/uploads/profile-pictures/test.jpg'
  };
  
  console.log('🧪 Testing utility functions:');
  console.log('- getUserAvatar:', getUserAvatar(testUser));
  console.log('- getUserDisplayName:', getUserDisplayName(testUser));
  console.log('- mapUserForComponents:', mapUserForComponents(testUser));
  
} catch (error) {
  console.error('❌ Failed to load profile picture utilities:', error);
}

// Check current user data
console.log('👤 Current user data:');
const userData = JSON.parse(localStorage.getItem('userData') || '{}');
console.log('- localStorage userData:', userData);

// Check if user context is available
if (window.React && window.React.useContext) {
  console.log('⚛️ React context available');
} else {
  console.log('❌ React context not available');
}

// Check environment variables
console.log('🌍 Environment variables:');
console.log('- VITE_SERVER_URL:', import.meta?.env?.VITE_SERVER_URL || 'Not available');

// Check if profile picture files exist
async function checkProfilePictureAccess() {
  console.log('🔗 Testing profile picture access...');
  
  const serverUrl = import.meta?.env?.VITE_SERVER_URL || 'http://localhost:4000';
  const testUrls = [
    `${serverUrl}/uploads/profile-pictures/`,
    `${serverUrl}/uploads/`,
  ];
  
  for (const url of testUrls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`${response.ok ? '✅' : '❌'} ${url} - Status: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${url} - Error: ${error.message}`);
    }
  }
}

checkProfilePictureAccess();

// Check current user profile from API
async function checkUserProfile() {
  console.log('📡 Checking user profile from API...');
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ No auth token found');
    return;
  }
  
  try {
    const serverUrl = import.meta?.env?.VITE_SERVER_URL || 'http://localhost:4000';
    const response = await fetch(`${serverUrl}/user/profile`, {
      headers: { token }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ User profile from API:', data.user);
      
      if (data.user.profilePicture) {
        const fullUrl = `${serverUrl}${data.user.profilePicture}`;
        console.log('🖼️ Profile picture URL:', fullUrl);
        
        // Test if image loads
        const img = new Image();
        img.onload = () => console.log('✅ Profile picture loads successfully');
        img.onerror = () => console.log('❌ Profile picture failed to load');
        img.src = fullUrl;
      } else {
        console.log('⚠️ No profile picture set for user');
      }
    } else {
      console.log('❌ Failed to fetch user profile:', response.status);
    }
  } catch (error) {
    console.log('❌ Error fetching user profile:', error);
  }
}

checkUserProfile();

// Check DOM elements
setTimeout(() => {
  console.log('🔍 Checking DOM elements...');
  
  // Check for Avatar components
  const avatars = document.querySelectorAll('[class*="avatar"], img[alt*="Avatar"], img[alt*="Profile"]');
  console.log(`Found ${avatars.length} potential avatar elements:`, avatars);
  
  // Check for Header component
  const headers = document.querySelectorAll('header');
  console.log(`Found ${headers.length} header elements:`, headers);
  
  // Check for Sidebar component
  const sidebars = document.querySelectorAll('[class*="sidebar"], [class*="Sidebar"]');
  console.log(`Found ${sidebars.length} sidebar elements:`, sidebars);
  
  // Check for broken images
  const brokenImages = document.querySelectorAll('img[src=""], img:not([src])');
  console.log(`Found ${brokenImages.length} potentially broken images:`, brokenImages);
  
}, 2000);

console.log('🏁 Profile Picture Display Diagnosis Complete');
console.log('Check the console output above for detailed information');

// Export functions for manual testing
window.profilePictureDiagnostic = {
  checkUserProfile,
  checkProfilePictureAccess,
  testUtilities: async () => {
    try {
      const { getUserAvatar, getUserDisplayName, mapUserForComponents } = await import('/src/utils/profilePicture.js');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const user = userData.data || userData;
      
      console.log('🧪 Manual utility test:');
      console.log('- User data:', user);
      console.log('- getUserAvatar:', getUserAvatar(user));
      console.log('- getUserDisplayName:', getUserDisplayName(user));
      console.log('- mapUserForComponents:', mapUserForComponents(user));
    } catch (error) {
      console.error('❌ Manual utility test failed:', error);
    }
  }
};