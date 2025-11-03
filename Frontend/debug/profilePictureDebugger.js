/**
 * Profile Picture Debugger - Run this in browser console
 * This will help identify exactly why profile pictures aren't showing
 */

console.log('🔍 Profile Picture Debugger Starting...');

// Function to log with timestamp
const log = (message, data = null) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${message}`, data || '');
};

// 1. Check localStorage
log('📦 Checking localStorage...');
const userData = localStorage.getItem('userData');
const token = localStorage.getItem('token');

if (userData) {
  const parsed = JSON.parse(userData);
  log('✅ userData found:', parsed);
  
  if (parsed.data && parsed.data.profilePicture) {
    log('🖼️ Profile picture in userData:', parsed.data.profilePicture);
  } else {
    log('❌ No profile picture in userData');
  }
} else {
  log('❌ No userData in localStorage');
}

if (token) {
  log('🔑 Token found:', token.substring(0, 20) + '...');
} else {
  log('❌ No token found');
}

// 2. Test API call
async function testAPI() {
  log('📡 Testing API call...');
  
  if (!token) {
    log('❌ Cannot test API - no token');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:4000/user/profile', {
      headers: { token }
    });
    
    if (response.ok) {
      const data = await response.json();
      log('✅ API response:', data);
      
      if (data.user && data.user.profilePicture) {
        log('🖼️ Profile picture from API:', data.user.profilePicture);
        
        // Test image URL
        const fullUrl = data.user.profilePicture.startsWith('http') 
          ? data.user.profilePicture 
          : `http://localhost:4000${data.user.profilePicture}`;
        
        log('🔗 Full image URL:', fullUrl);
        
        // Test if image loads
        const img = new Image();
        img.onload = () => log('✅ Image loads successfully');
        img.onerror = () => log('❌ Image failed to load');
        img.src = fullUrl;
        
      } else {
        log('❌ No profile picture in API response');
      }
    } else {
      log('❌ API call failed:', response.status);
    }
  } catch (error) {
    log('❌ API error:', error.message);
  }
}

// 3. Check React components
function checkComponents() {
  log('⚛️ Checking React components...');
  
  // Check if Avatar components exist
  const avatars = document.querySelectorAll('img[alt*="Avatar"], img[alt*="Profile"]');
  log(`Found ${avatars.length} avatar images:`, Array.from(avatars).map(img => ({
    src: img.src,
    alt: img.alt,
    visible: img.offsetWidth > 0 && img.offsetHeight > 0
  })));
  
  // Check for initials fallback
  const initialsElements = document.querySelectorAll('[class*="avatar"] span, [class*="Avatar"] span');
  log(`Found ${initialsElements.length} initials elements:`, Array.from(initialsElements).map(el => el.textContent));
  
  // Check Header
  const headers = document.querySelectorAll('header');
  log(`Found ${headers.length} header elements`);
  
  // Check Sidebar
  const sidebars = document.querySelectorAll('[class*="sidebar"], [class*="Sidebar"]');
  log(`Found ${sidebars.length} sidebar elements`);
}

// 4. Test utility functions
async function testUtilities() {
  log('🛠️ Testing utility functions...');
  
  try {
    // Import utilities
    const module = await import('/src/utils/profilePicture.js');
    const { getUserAvatar, getUserDisplayName, mapUserForComponents } = module;
    
    log('✅ Utilities imported successfully');
    
    // Test with current user data
    if (userData) {
      const user = JSON.parse(userData).data;
      
      log('🧪 Testing utilities with user:', user);
      log('- getUserAvatar:', getUserAvatar(user));
      log('- getUserDisplayName:', getUserDisplayName(user));
      log('- mapUserForComponents:', mapUserForComponents(user));
    }
    
  } catch (error) {
    log('❌ Failed to import utilities:', error.message);
  }
}

// 5. Check environment
function checkEnvironment() {
  log('🌍 Checking environment...');
  
  // Check if we're in development
  log('Environment:', import.meta?.env?.MODE || 'unknown');
  log('Server URL:', import.meta?.env?.VITE_SERVER_URL || 'not set');
  
  // Check if server is running
  fetch('http://localhost:4000/uploads/')
    .then(response => {
      log(`Server uploads directory: ${response.ok ? '✅ accessible' : '❌ not accessible'} (${response.status})`);
    })
    .catch(error => {
      log('❌ Server not accessible:', error.message);
    });
}

// Run all checks
async function runAllChecks() {
  log('🚀 Running all checks...');
  
  checkEnvironment();
  await testAPI();
  checkComponents();
  await testUtilities();
  
  log('✅ All checks completed');
}

// Auto-run checks
runAllChecks();

// Export functions for manual testing
window.profileDebugger = {
  testAPI,
  checkComponents,
  testUtilities,
  checkEnvironment,
  runAllChecks,
  
  // Quick fix function
  quickFix: async () => {
    log('🔧 Attempting quick fix...');
    
    // Force refresh user data
    if (token) {
      try {
        const response = await fetch('http://localhost:4000/user/profile', {
          headers: { token }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Update localStorage
          const newUserData = {
            type: 'user',
            data: data.user
          };
          
          localStorage.setItem('userData', JSON.stringify(newUserData));
          log('✅ Updated localStorage with fresh user data');
          
          // Trigger a page refresh
          log('🔄 Refreshing page...');
          setTimeout(() => window.location.reload(), 1000);
          
        } else {
          log('❌ Failed to fetch fresh user data');
        }
      } catch (error) {
        log('❌ Quick fix failed:', error.message);
      }
    } else {
      log('❌ No token available for quick fix');
    }
  }
};

log('🎯 Debugger ready! Use window.profileDebugger.quickFix() to attempt a quick fix');