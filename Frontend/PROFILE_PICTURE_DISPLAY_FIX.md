# Profile Picture Display Fix

## 🚨 Issue Identified

The profile picture uploads to the database correctly but doesn't display in other components because:

1. **Database Field**: Profile pictures are stored in `user.profilePicture`
2. **Component Expectation**: Components look for `user.avatar`
3. **Missing Mapping**: No mapping between database field and component expectation
4. **URL Construction**: Components don't construct full URLs for profile pictures

## ✅ Complete Solution

### 1. Fix User Context to Map Profile Picture

**File**: `Frontend/src/contexts/UserContext.jsx`

Add profile picture mapping in the user context:

```jsx
// Map profilePicture to avatar for component compatibility
const mapUserData = (userData) => {
  if (!userData) return null;
  
  return {
    ...userData,
    avatar: userData.profilePicture 
      ? `${import.meta.env.VITE_SERVER_URL}${userData.profilePicture}`
      : null
  };
};
```

### 2. Update Backend Controllers to Include Profile Picture

**File**: `Backend/controllers/user.controller.js`

Ensure all user responses include profilePicture:

```javascript
// In loginUser controller
res.json({
  message: "Logged in successfully",
  token,
  user: {
    _id: user._id,
    fullname: {
      firstname: user.fullname.firstname,
      lastname: user.fullname.lastname,
    },
    email: user.email,
    phone: user.phone,
    rides: user.rides,
    socketId: user.socketId,
    emailVerified: user.emailVerified,
    profilePicture: user.profilePicture, // Add this line
  },
});
```

### 3. Create Profile Picture Helper Utility

**File**: `Frontend/src/utils/profilePicture.js`

```javascript
/**
 * Get the full URL for a user's profile picture
 * @param {string|null} profilePicture - The profile picture path from database
 * @returns {string|null} - Full URL or null if no picture
 */
export const getProfilePictureUrl = (profilePicture) => {
  if (!profilePicture) return null;
  
  // If it's already a full URL, return as is
  if (profilePicture.startsWith('http')) {
    return profilePicture;
  }
  
  // If it's a relative path, prepend server URL
  return `${import.meta.env.VITE_SERVER_URL}${profilePicture}`;
};

/**
 * Get user avatar with fallback
 * @param {Object} user - User object
 * @returns {string|null} - Avatar URL or null
 */
export const getUserAvatar = (user) => {
  if (!user) return null;
  
  // Check for avatar first (mapped field)
  if (user.avatar) return user.avatar;
  
  // Fallback to profilePicture
  if (user.profilePicture) {
    return getProfilePictureUrl(user.profilePicture);
  }
  
  return null;
};
```

### 4. Update Components to Use Profile Picture

**File**: `Frontend/src/components/layout/Header.jsx`

```jsx
import { getUserAvatar } from '../../utils/profilePicture';

const Header = ({ 
  title = 'QuickRide',
  showMenu = true,
  showNotifications = true,
  user = null,
  onMenuClick,
  onNotificationClick,
  onProfileClick,
  className = '',
  ...props 
}) => {
  const userAvatar = getUserAvatar(user);
  
  return (
    <header className={`...`}>
      {/* ... other content ... */}
      
      {user && (
        <button
          onClick={onProfileClick}
          className="focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full"
          aria-label="Profile"
        >
          <Avatar 
            src={userAvatar} 
            name={user.name || `${user.fullname?.firstname} ${user.fullname?.lastname}`}
            size="sm" 
            className="cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all duration-200"
          />
        </button>
      )}
    </header>
  );
};
```

### 5. Update Sidebar Component

**File**: `Frontend/src/components/layout/Sidebar.jsx`

```jsx
import { getUserAvatar } from '../../utils/profilePicture';

const Sidebar = ({ 
  isOpen = false, 
  onClose,
  user = null,
  userType = 'user',
  // ... other props
}) => {
  const userAvatar = getUserAvatar(user);
  const userName = user?.name || (user?.fullname ? `${user.fullname.firstname} ${user.fullname.lastname}` : 'Guest User');
  
  return (
    <>
      {/* ... backdrop ... */}
      
      <div className="...">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-6 text-white overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4">
              {user && (
                <div className="relative group">
                  <Avatar 
                    src={userAvatar} 
                    name={userName}
                    size="lg"
                    className="ring-3 ring-white/30 shadow-lg transition-all duration-200 group-hover:ring-white/50"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse" />
                </div>
              )}
              <div>
                <h2 className="font-semibold text-lg text-white mb-1">
                  {userName}
                </h2>
                {/* ... rest of user info ... */}
              </div>
            </div>
            {/* ... close button ... */}
          </div>
        </div>
        
        {/* ... rest of sidebar ... */}
      </div>
    </>
  );
};
```

### 6. Update UserHomeScreen

**File**: `Frontend/src/screens/UserHomeScreen.jsx`

```jsx
import { getUserAvatar } from '../utils/profilePicture';

function UserHomeScreen() {
  const { user } = useUser();
  // ... other state and logic ...
  
  const userAvatar = getUserAvatar(user);
  const userName = user?.fullname ? `${user.fullname.firstname} ${user.fullname.lastname}` : 'User';
  
  return (
    <div className="relative w-full h-screen bg-gray-50 overflow-hidden">
      {/* Modern Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        user={{
          ...user,
          name: userName,
          avatar: userAvatar,
          rating: user?.rating?.average
        }}
        userType="user"
        onNavigate={navigateTo}
        currentPath={currentPath}
        onLogout={handleLogout}
      />

      {/* Header with Navigation */}
      <Header
        title="QuickRide"
        showMenu={true}
        showNotifications={true}
        user={{
          ...user,
          name: userName,
          avatar: userAvatar
        }}
        onMenuClick={openSidebar}
        onNotificationClick={() => navigateTo('/user/notifications')}
        onProfileClick={() => navigateTo('/user/edit-profile')}
      />
      
      {/* ... rest of component ... */}
    </div>
  );
}
```

## 🔧 Implementation Steps

### Step 1: Create Profile Picture Utility
Create the utility file to handle profile picture URLs consistently.

### Step 2: Update User Context
Modify the UserContext to map profilePicture to avatar field.

### Step 3: Update Backend Responses
Ensure all user API responses include the profilePicture field.

### Step 4: Update All Components
Update Header, Sidebar, and other components to use the new utility.

### Step 5: Test Profile Picture Display
Verify profile pictures appear in:
- Header avatar
- Sidebar user profile
- Any other user display components

## 🧪 Testing Checklist

### Profile Picture Display
- [ ] Profile picture shows in header
- [ ] Profile picture shows in sidebar
- [ ] Profile picture updates immediately after upload
- [ ] Fallback to initials when no picture
- [ ] Proper URL construction for images
- [ ] Error handling for broken images

### Cross-Component Consistency
- [ ] Same profile picture across all components
- [ ] Updates propagate to all components
- [ ] Context synchronization working
- [ ] localStorage updates correctly

---

**Status**: 🔧 **READY FOR IMPLEMENTATION**

This fix ensures profile pictures display correctly across all components by properly mapping the database field to component expectations.