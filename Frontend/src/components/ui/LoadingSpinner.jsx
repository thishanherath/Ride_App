const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  variant = 'default',
  text
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-orange-500',
    white: 'text-white',
    gray: 'text-gray-500',
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500'
  };

  // Default spinner variant
  if (variant === 'default') {
    return (
      <div className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
        <svg 
          className="animate-spin w-full h-full" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  // Dots variant
  if (variant === 'dots') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    );
  }

  // Pulse variant
  if (variant === 'pulse') {
    return (
      <div className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
        <div className="w-full h-full bg-current rounded-full animate-ping opacity-75" />
      </div>
    );
  }

  // Bars variant
  if (variant === 'bars') {
    return (
      <div className={`flex items-end space-x-1 ${className}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-1 bg-current ${colorClasses[color]} animate-pulse`}
            style={{
              height: size === 'xs' ? '8px' : size === 'sm' ? '12px' : size === 'md' ? '16px' : size === 'lg' ? '20px' : '24px',
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.8s'
            }}
          />
        ))}
      </div>
    );
  }

  return null;
};

// Enhanced loading states for different contexts
export const RideLoadingSpinner = ({ text = "Finding rides" }) => (
  <div className="flex flex-col items-center justify-center p-8 animate-fade-in">
    <div className="relative mb-4">
      <div className="w-16 h-16 border-4 border-orange-100 rounded-full" />
      <div className="absolute inset-0 w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <div className="absolute inset-2 w-12 h-12 border-2 border-orange-300 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
    </div>
    <p className="text-gray-600 font-medium loading-dots">{text}</p>
  </div>
);

export const PanelLoadingSpinner = ({ text = "Loading" }) => (
  <div className="flex items-center justify-center p-6 animate-fade-in">
    <div className="flex items-center space-x-3">
      <LoadingSpinner variant="default" size="sm" color="primary" />
      <span className="text-gray-600 font-medium loading-dots">{text}</span>
    </div>
  </div>
);

export const ButtonLoadingSpinner = ({ size = 'sm' }) => (
  <div className={`inline-block border-2 border-white border-t-transparent rounded-full animate-spin ${
    size === 'xs' ? 'w-3 h-3' : 
    size === 'sm' ? 'w-4 h-4' : 
    size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
  }`} />
);

export default LoadingSpinner;