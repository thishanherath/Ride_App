import { useState, useEffect } from 'react';
import { UserIcon } from 'lucide-react';

/**
 * ProfileAvatar - A robust avatar component that handles profile pictures properly
 */
const ProfileAvatar = ({ 
  user, 
  size = 'md', 
  className = '',
  onClick,
  showStatus = false,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  // Get user display name
  const getDisplayName = () => {
    if (!user) return 'Guest';
    
    if (user.name) return user.name;
    
    if (user.fullname) {
      const { firstname, lastname } = user.fullname;
      return `${firstname || ''} ${lastname || ''}`.trim() || 'User';
    }
    
    return 'User';
  };

  // Get initials
  const getInitials = () => {
    const name = getDisplayName();
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  };

  // Get local profile picture from localStorage
  const getLocalProfilePicture = (userId) => {
    const profilePictureKey = `profilePicture_${userId}`;
    const stored = localStorage.getItem(profilePictureKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.data; // Return the base64 data URL
      } catch (error) {
        console.error('Error parsing stored profile picture:', error);
        return null;
      }
    }
    return null;
  };

  // Construct profile picture URL
  useEffect(() => {
    const updateProfilePicture = () => {
      if (!user) {
        setProfilePictureUrl(null);
        return;
      }

      let url = null;

      // Check for avatar field first (mapped)
      if (user.avatar) {
        url = user.avatar;
      }
      // Check for profilePicture field
      else if (user.profilePicture) {
        // If it's a data URL (local image), use directly
        if (user.profilePicture.startsWith('data:')) {
          url = user.profilePicture;
          console.log('ProfileAvatar: Using local data URL');
        }
        // If it's already a full URL, use as is
        else if (user.profilePicture.startsWith('http')) {
          url = user.profilePicture;
        } 
        // Otherwise construct full URL from server path
        else {
          const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
          url = `${serverUrl}${user.profilePicture}`;
        }
        
        // Add cache busting parameter for server URLs only (not data URLs)
        if (url && !url.startsWith('data:') && (user._lastUpdated || user._id)) {
          const timestamp = user._lastUpdated || Date.now();
          url += `?t=${timestamp}`;
        }
      }
      // If no profilePicture but we have a user ID, check local storage
      else if (user._id) {
        const localImage = getLocalProfilePicture(user._id);
        if (localImage) {
          url = localImage;
          console.log('ProfileAvatar: Found local profile picture in storage');
        }
      }

      setProfilePictureUrl(url);
      setImageError(false);
      setImageLoading(!!url); // Only show loading if we have a URL
    };

    updateProfilePicture();

    // Listen for profile update events
    const handleProfileUpdate = (event) => {
      if (event.detail?.user) {
        updateProfilePicture();
      }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    window.addEventListener('userContextUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
      window.removeEventListener('userContextUpdated', handleProfileUpdate);
    };
  }, [user, user?._lastUpdated, user?.profilePicture]);

  const handleImageLoad = () => {
    setImageLoading(false);
    console.log('ProfileAvatar: Image loaded successfully');
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
    console.log('ProfileAvatar: Image failed to load', profilePictureUrl);
  };

  return (
    <div 
      className={`
        relative inline-flex items-center justify-center
        ${sizeClasses[size]}
        rounded-full
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      data-profile-avatar="true"
      {...props}
    >
      {/* Avatar Content */}
      <div className={`
        w-full h-full flex items-center justify-center
        rounded-full overflow-hidden
        ${!profilePictureUrl || imageError ? 'bg-gray-100' : ''}
      `}>
        {profilePictureUrl && !imageError ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
            )}
            <img
              src={profilePictureUrl}
              alt={`${getDisplayName()} Avatar`}
              className={`
                w-full h-full object-cover rounded-full
                ${imageLoading ? 'opacity-0' : 'opacity-100'}
                transition-opacity duration-200
              `}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        ) : (
          // Fallback to initials or icon
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center rounded-full">
            {getDisplayName() !== 'Guest' ? (
              <span className="font-semibold text-white select-none">
                {getInitials()}
              </span>
            ) : (
              <UserIcon className="w-1/2 h-1/2 text-white" />
            )}
          </div>
        )}
      </div>

      {/* Status Indicator */}
      {showStatus && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
      )}

      {/* Loading Ring */}
      {imageLoading && profilePictureUrl && !imageError && (
        <div className="absolute inset-0 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
      )}
    </div>
  );
};

export default ProfileAvatar;