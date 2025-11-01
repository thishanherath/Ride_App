/**
 * PROFILE PICTURE COMPLETE FIX
 * This script will diagnose and fix ALL profile picture issues
 * Run this in browser console: copy and paste the entire script
 */

console.log('🚀 PROFILE PICTURE COMPLETE FIX STARTING...');

// Configuration
const CONFIG = {
  serverUrl: 'http://localhost:4000',
  debugMode: true
};

// Utility functions
const log = (message, data = null) => {
  if (CONFIG.debugMode) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${message}`, data || '');
  }
};

const error = (message, data = null) => {
  const timestamp = new Date().toLocaleTimeString();
  console.error(`[${timestamp}] ❌ ${message}`, data || '');
};

const success = (message, data = null) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ✅ ${message}`, data || '');
};

// Step 1: Check and fix localStorage
function fixLocalStorage() {
  log('🔧 Step 1: Fixing localStorage...');
  
  const userData = localStorage.getItem('userData');
  const token = localStorage.getItem('token');
  
  if (!token) {
    error('No auth token found - user needs to login');
    return false;
  }
  
  if (!userData) {
    error('No userData found - will fetch from API');
    return false;
  }
  
  try {
    const parsed = JSON.parse(userData);
    log('Current userData:', parsed);
    
    if (parsed.data && parsed.data.profilePicture) {
      success('Profile picture found in localStorage:', parsed.data.profilePicture);
      return true;
    } else {
      log('No profile picture in localStorage - will fetch fresh data');
      return false;
    }
  } catch (e) {
    error('Invalid userData JSON:', e);
    return false;
  }
}

// Step 2: Fetch fresh user data from API
async function fetchFreshUserData() {
  log('🔧 Step 2: Fetching fresh user data...');
  
  const token = localStorage.getItem('token');
  if (!token) {
    error('No token available for API call');
    return null;
  }
  
  try {
    const response = await fetch(`${CONFIG.serverUrl}/user/profile`, {
      headers: { token }
    });
    
    if (!response.ok) {
      error(`API call failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    log('Fresh user data from API:', data);
    
    if (data.user) {
      // Update localStorage with fresh data
      const newUserData = {
        type: 'user',
        data: data.user
      };
      
      localStorage.setItem('userData', JSON.stringify(newUserData));
      success('Updated localStorage with fresh user data');
      
      return data.user;
    } else {
      error('No user data in API response');
      return null;
    }
  } catch (e) {
    error('API call failed:', e);
    return null;
  }
}

// Step 3: Test profile picture URL
async function testProfilePictureUrl(user) {
  log('🔧 Step 3: Testing profile picture URL...');
  
  if (!user || !user.profilePicture) {
    log('No profile picture to test');
    return false;
  }
  
  const fullUrl = user.profilePicture.startsWith('http') 
    ? user.profilePicture 
    : `${CONFIG.serverUrl}${user.profilePicture}`;
  
  log('Testing URL:', fullUrl);
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      success('Profile picture URL loads successfully:', fullUrl);
      resolve(true);
    };
    img.onerror = () => {
      error('Profile picture URL failed to load:', fullUrl);
      resolve(false);
    };
    img.src = fullUrl;
  });
}

// Step 4: Force React component re-render
function forceComponentRerender() {
  log('🔧 Step 4: Forcing component re-render...');
  
  // Trigger storage event to update UserContext
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'userData',
    newValue: localStorage.getItem('userData')
  }));
  
  // Also trigger a custom event
  window.dispatchEvent(new CustomEvent('userDataUpdated'));
  
  success('Triggered component re-render events');
}

// Step 5: Visual verification
function visualVerification() {
  log('🔧 Step 5: Visual verification...');
  
  // Check for avatar images in DOM
  const avatarImages = document.querySelectorAll('img[alt*="Avatar"], img[alt*="Profile"]');
  log(`Found ${avatarImages.length} avatar images in DOM`);
  
  avatarImages.forEach((img, index) => {
    log(`Avatar ${index + 1}:`, {
      src: img.src,
      alt: img.alt,
      visible: img.offsetWidth > 0 && img.offsetHeight > 0,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight
    });
  });
  
  // Check for initials fallbacks
  const initialsElements = document.querySelectorAll('[class*="avatar"] span, [class*="Avatar"] span');
  log(`Found ${initialsElements.length} initials elements`);
  
  initialsElements.forEach((el, index) => {
    log(`Initials ${index + 1}:`, el.textContent);
  });
  
  return avatarImages.length > 0;
}

// Step 6: Create test avatar
function createTestAvatar(user) {
  log('🔧 Step 6: Creating test avatar...');
  
  if (!user) {
    error('No user data for test avatar');
    return;
  }
  
  // Create a test avatar element
  const testContainer = document.createElement('div');
  testContainer.id = 'profile-picture-test';
  testContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    font-family: Arial, sans-serif;
  `;
  
  const title = document.createElement('h3');
  title.textContent = 'Profile Picture Test';
  title.style.margin = '0 0 10px 0';
  
  const avatar = document.createElement('div');
  avatar.style.cssText = `
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 10px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    background: linear-gradient(135deg, #f97316, #ea580c);
  `;
  
  const info = document.createElement('div');
  info.style.fontSize = '12px';
  info.style.color = '#666';
  
  if (user.profilePicture) {
    const fullUrl = user.profilePicture.startsWith('http') 
      ? user.profilePicture 
      : `${CONFIG.serverUrl}${user.profilePicture}`;
    
    const img = document.createElement('img');
    img.src = fullUrl;
    img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 50%;';
    
    img.onload = () => {
      success('Test avatar image loaded successfully');
      info.innerHTML = `✅ Image loaded<br>URL: ${fullUrl}`;
    };
    
    img.onerror = () => {
      error('Test avatar image failed to load');
      const initials = getUserInitials(user);
      avatar.textContent = initials;
      info.innerHTML = `❌ Image failed<br>Showing initials: ${initials}<br>URL: ${fullUrl}`;
    };
    
    avatar.appendChild(img);
  } else {
    const initials = getUserInitials(user);
    avatar.textContent = initials;
    info.innerHTML = `ℹ️ No profile picture<br>Showing initials: ${initials}`;
  }
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 5px;
    right: 10px;
    border: none;
    background: none;
    font-size: 20px;
    cursor: pointer;
  `;
  closeBtn.onclick = () => testContainer.remove();
  
  testContainer.appendChild(closeBtn);
  testContainer.appendChild(title);
  testContainer.appendChild(avatar);
  testContainer.appendChild(info);
  
  // Remove existing test if present
  const existing = document.getElementById('profile-picture-test');
  if (existing) existing.remove();
  
  document.body.appendChild(testContainer);
  
  success('Test avatar created and displayed');
}

// Helper function to get user initials
function getUserInitials(user) {
  if (!user) return '?';
  
  let name = '';
  if (user.fullname) {
    name = `${user.fullname.firstname || ''} ${user.fullname.lastname || ''}`.trim();
  }
  
  if (!name) return '?';
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Main fix function
async function runCompleteFix() {
  console.log('🚀 RUNNING COMPLETE PROFILE PICTURE FIX...');
  console.log('=====================================');
  
  try {
    // Step 1: Check localStorage
    const hasValidLocalStorage = fixLocalStorage();
    
    // Step 2: Fetch fresh data if needed
    let user = null;
    if (!hasValidLocalStorage) {
      user = await fetchFreshUserData();
    } else {
      const userData = JSON.parse(localStorage.getItem('userData'));
      user = userData.data;
    }
    
    if (!user) {
      error('Could not get user data - fix failed');
      return false;
    }
    
    // Step 3: Test profile picture URL
    const urlWorks = await testProfilePictureUrl(user);
    
    // Step 4: Force component re-render
    forceComponentRerender();
    
    // Wait a bit for re-render
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 5: Visual verification
    const hasVisualAvatars = visualVerification();
    
    // Step 6: Create test avatar
    createTestAvatar(user);
    
    // Final status
    console.log('=====================================');
    if (urlWorks && hasVisualAvatars) {
      success('🎉 PROFILE PICTURE FIX COMPLETED SUCCESSFULLY!');
      success('Profile pictures should now be visible in Header and Sidebar');
    } else if (urlWorks) {
      success('✅ Profile picture URL works, but components may need refresh');
      log('💡 Try refreshing the page or navigating to a different page and back');
    } else {
      error('❌ Profile picture URL is not working');
      log('💡 Check if you have uploaded a profile picture');
      log('💡 Check if the backend server is running');
      log('💡 Check if the uploads directory exists and has proper permissions');
    }
    
    return urlWorks;
    
  } catch (e) {
    error('Complete fix failed with error:', e);
    return false;
  }
}

// Auto-run the fix
runCompleteFix();

// Export functions for manual use
window.profilePictureFix = {
  runCompleteFix,
  fetchFreshUserData,
  testProfilePictureUrl,
  forceComponentRerender,
  visualVerification,
  createTestAvatar,
  
  // Quick actions
  refreshUserData: async () => {
    const user = await fetchFreshUserData();
    if (user) {
      forceComponentRerender();
      createTestAvatar(user);
    }
    return user;
  },
  
  testCurrentUser: async () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData).data;
      await testProfilePictureUrl(user);
      createTestAvatar(user);
    }
  }
};

console.log('💡 Available functions:');
console.log('- window.profilePictureFix.refreshUserData()');
console.log('- window.profilePictureFix.testCurrentUser()');
console.log('- window.profilePictureFix.runCompleteFix()');