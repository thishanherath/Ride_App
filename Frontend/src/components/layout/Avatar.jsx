import React, { useState } from 'react';
import { UserIcon } from 'lucide-react';

const Avatar = ({ 
  src,
  name = '',
  size = 'md', // 'xs', 'sm', 'md', 'lg', 'xl', '2xl'
  shape = 'circle', // 'circle', 'square'
  status, // 'online', 'offline', 'away', 'busy'
  showStatus = false,
  fallbackIcon = UserIcon,
  className = '',
  onClick,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5'
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  };

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-lg'
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const FallbackIcon = fallbackIcon;

  return (
    <div 
      className={`
        relative inline-flex items-center justify-center
        ${sizeClasses[size]}
        ${shapeClasses[shape]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {/* Avatar Content */}
      <div className={`
        w-full h-full flex items-center justify-center
        ${shapeClasses[shape]}
        overflow-hidden
        ${!src || imageError ? 'bg-gray-100' : ''}
      `}>
        {src && !imageError ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <img
              src={src}
              alt={name || 'Avatar'}
              className={`
                w-full h-full object-cover
                ${imageLoading ? 'opacity-0' : 'opacity-100'}
                transition-opacity duration-200
              `}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        ) : name ? (
          <span className="font-semibold text-gray-700 select-none">
            {getInitials(name)}
          </span>
        ) : (
          <FallbackIcon className="w-1/2 h-1/2 text-gray-400" />
        )}
      </div>

      {/* Status Indicator */}
      {showStatus && status && (
        <div className={`
          absolute -bottom-0.5 -right-0.5
          ${statusSizes[size]}
          ${statusColors[status]}
          ${shapeClasses[shape]}
          border-2 border-white
        `} />
      )}

      {/* Loading Ring */}
      {imageLoading && src && !imageError && (
        <div className={`
          absolute inset-0 border-2 border-gray-200 border-t-orange-500
          ${shapeClasses[shape]}
          animate-spin
        `} />
      )}
    </div>
  );
};

// Avatar Group Component for displaying multiple avatars
export const AvatarGroup = ({ 
  avatars = [], 
  max = 3, 
  size = 'md',
  className = '',
  ...props 
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = Math.max(0, avatars.length - max);

  const overlapClasses = {
    xs: '-space-x-1',
    sm: '-space-x-1.5',
    md: '-space-x-2',
    lg: '-space-x-2.5',
    xl: '-space-x-3',
    '2xl': '-space-x-4'
  };

  return (
    <div 
      className={`flex items-center ${overlapClasses[size]} ${className}`}
      {...props}
    >
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={avatar.id || index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className="ring-2 ring-white"
          {...avatar}
        />
      ))}
      
      {remainingCount > 0 && (
        <div className={`
          flex items-center justify-center
          ${sizeClasses[size]}
          rounded-full bg-gray-100 ring-2 ring-white
          text-gray-600 font-medium
        `}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl'
};

export default Avatar;