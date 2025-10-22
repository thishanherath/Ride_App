const Skeleton = ({ 
  className = '',
  variant = 'default',
  width,
  height,
  rounded = 'md',
  animate = true,
  animationType = 'shimmer'
}) => {
  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'skeleton',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
    none: ''
  };

  const baseClasses = `bg-gray-200 ${animate ? animationClasses[animationType] : ''}`;
  
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full'
  };

  const style = {
    width: width || undefined,
    height: height || undefined
  };

  if (variant === 'text') {
    return (
      <div 
        className={`${baseClasses} h-4 ${roundedClasses[rounded]} ${className}`}
        style={style}
      />
    );
  }

  if (variant === 'avatar') {
    const size = width || height || '40px';
    return (
      <div 
        className={`${baseClasses} ${roundedClasses.full} ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (variant === 'button') {
    return (
      <div 
        className={`${baseClasses} h-10 w-24 ${roundedClasses.lg} ${className}`}
        style={style}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div className={`${baseClasses} ${roundedClasses.xl} p-6 ${className}`} style={style}>
        <div className="space-y-4">
          <div className="h-4 bg-gray-300 rounded w-3/4 skeleton"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded skeleton animate-delay-100"></div>
            <div className="h-3 bg-gray-300 rounded w-5/6 skeleton animate-delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${baseClasses} ${roundedClasses[rounded]} ${className}`}
      style={style}
    />
  );
};

// Predefined skeleton components for common use cases
export const SkeletonText = ({ lines = 1, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        variant="text" 
        width={i === lines - 1 ? '75%' : '100%'}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
    <div className="flex items-start space-x-4">
      <Skeleton variant="avatar" width="48px" height="48px" />
      <div className="flex-1 space-y-3">
        <Skeleton variant="text" width="60%" />
        <SkeletonText lines={2} />
        <div className="flex space-x-2">
          <Skeleton variant="button" width="80px" />
          <Skeleton variant="button" width="80px" />
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonList = ({ items = 3, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
        <Skeleton variant="avatar" width="40px" height="40px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="80%" />
        </div>
        <Skeleton width="60px" height="20px" rounded="full" />
      </div>
    ))}
  </div>
);

export const SkeletonRideCard = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <Skeleton variant="avatar" width="32px" height="32px" />
        <div className="space-y-2">
          <Skeleton variant="text" width="120px" />
          <Skeleton variant="text" width="80px" />
        </div>
      </div>
      <Skeleton width="60px" height="24px" rounded="full" />
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse" />
        <Skeleton variant="text" width="70%" />
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
    
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
      <Skeleton variant="text" width="80px" />
      <Skeleton variant="text" width="60px" />
    </div>
  </div>
);

export const SkeletonProfile = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
    <div className="flex flex-col items-center text-center mb-6">
      <Skeleton variant="avatar" width="80px" height="80px" className="mb-4" />
      <Skeleton variant="text" width="150px" className="mb-2" />
      <Skeleton variant="text" width="100px" />
    </div>
    
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
          <Skeleton variant="text" width="100px" />
          <Skeleton variant="text" width="120px" />
        </div>
      ))}
    </div>
  </div>
);

// New ride booking specific skeletons with enhanced animations
export const SkeletonVehicleCard = ({ className = '', index = 0 }) => (
  <div className={`p-6 border border-gray-200 rounded-3xl animate-fade-in animate-delay-${index * 100} ${className}`}>
    <div className="flex items-center gap-5">
      <Skeleton variant="default" width="96px" height="96px" rounded="2xl" animationType="shimmer" />
      <div className="flex-1 space-y-3">
        <Skeleton variant="text" width="50%" height="24px" animationType="shimmer" />
        <Skeleton variant="text" width="75%" height="16px" animationType="shimmer" className="animate-delay-100" />
        <div className="flex gap-2">
          <Skeleton width="48px" height="24px" rounded="full" animationType="shimmer" className="animate-delay-200" />
          <Skeleton width="64px" height="24px" rounded="full" animationType="shimmer" className="animate-delay-300" />
        </div>
        <div className="flex gap-2">
          <Skeleton width="32px" height="16px" rounded="full" animationType="shimmer" className="animate-delay-400" />
          <Skeleton width="48px" height="16px" rounded="full" animationType="shimmer" className="animate-delay-500" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <Skeleton width="80px" height="48px" rounded="2xl" animationType="shimmer" />
        <Skeleton width="48px" height="32px" rounded="2xl" animationType="shimmer" className="animate-delay-100" />
      </div>
    </div>
  </div>
);

export const SkeletonLocationSuggestion = ({ items = 5, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slide-in-up ${className}`}>
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
      <Skeleton variant="text" width="128px" height="16px" animationType="shimmer" />
    </div>
    <div className="divide-y divide-gray-50">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className={`flex items-center gap-4 p-4 animate-fade-in animate-delay-${index * 100}`}>
          <Skeleton width="48px" height="48px" rounded="2xl" animationType="shimmer" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="75%" height="20px" animationType="shimmer" />
            <Skeleton variant="text" width="50%" height="16px" animationType="shimmer" className="animate-delay-100" />
            <div className="flex gap-4">
              <Skeleton width="48px" height="20px" rounded="full" animationType="shimmer" className="animate-delay-200" />
              <Skeleton width="48px" height="20px" rounded="full" animationType="shimmer" className="animate-delay-300" />
            </div>
          </div>
          <Skeleton variant="avatar" width="12px" height="12px" animationType="pulse" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonRidePanel = ({ className = '' }) => (
  <div className={`bg-white rounded-t-3xl shadow-2xl border-0 p-6 animate-slide-up-panel ${className}`}>
    <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6 animate-pulse" />
    <Skeleton variant="text" width="128px" height="24px" className="mb-6" animationType="shimmer" />
    <div className="space-y-3 mb-6">
      <div className="relative">
        <Skeleton variant="avatar" width="12px" height="12px" className="absolute left-3 top-1/2 transform -translate-y-1/2" />
        <Skeleton width="100%" height="56px" rounded="xl" className="pl-10" animationType="shimmer" />
      </div>
      <div className="relative">
        <Skeleton variant="avatar" width="12px" height="12px" className="absolute left-3 top-1/2 transform -translate-y-1/2" />
        <Skeleton width="100%" height="56px" rounded="xl" className="pl-10" animationType="shimmer" className="animate-delay-100" />
      </div>
    </div>
    <Skeleton width="100%" height="56px" rounded="xl" animationType="shimmer" className="animate-delay-200" />
  </div>
);

export const SkeletonChatMessage = ({ isOwn = false, className = '' }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in ${className}`}>
    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
      isOwn ? 'bg-orange-100' : 'bg-gray-100'
    }`}>
      <Skeleton variant="text" width="80%" height="16px" animationType="shimmer" />
      <Skeleton variant="text" width="60%" height="16px" className="mt-1" animationType="shimmer" />
    </div>
  </div>
);

export default Skeleton;