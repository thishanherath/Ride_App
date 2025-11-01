/**
 * Profile Picture Utility Functions
 * Handles profile picture URL construction and user avatar mapping
 */

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

/**
 * Get user display name
 * @param {Object} user - User object
 * @returns {string} - User's display name
 */
export const getUserDisplayName = (user) => {
  if (!user) return 'Guest User';
  
  // Check for name field first
  if (user.name) return user.name;
  
  // Construct from fullname
  if (user.fullname) {
    const { firstname, lastname } = user.fullname;
    return `${firstname || ''} ${lastname || ''}`.trim() || 'User';
  }
  
  return 'User';
};

/**
 * Map user data for component compatibility
 * @param {Object} userData - Raw user data from API
 * @returns {Object} - Mapped user data with avatar field
 */
export const mapUserForComponents = (userData) => {
  if (!userData) return null;
  
  return {
    ...userData,
    avatar: getProfilePictureUrl(userData.profilePicture),
    name: getUserDisplayName(userData)
  };
};