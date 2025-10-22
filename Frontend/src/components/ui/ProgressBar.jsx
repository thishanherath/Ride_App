import React from 'react';

const ProgressBar = ({ 
  progress = 0, 
  size = 'md',
  color = 'primary',
  variant = 'default',
  showLabel = false,
  label = '',
  className = '',
  animated = true
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6'
  };

  const colorClasses = {
    primary: 'bg-orange-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    gray: 'bg-gray-500'
  };

  const backgroundClasses = {
    primary: 'bg-orange-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    error: 'bg-red-100',
    info: 'bg-blue-100',
    gray: 'bg-gray-100'
  };

  if (variant === 'circular') {
    const radius = size === 'xs' ? 16 : size === 'sm' ? 20 : size === 'md' ? 24 : size === 'lg' ? 32 : 40;
    const strokeWidth = size === 'xs' ? 2 : size === 'sm' ? 3 : size === 'md' ? 4 : size === 'lg' ? 5 : 6;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            stroke="currentColor"
            className={backgroundClasses[color]}
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="currentColor"
            className={`${colorClasses[color]} ${animated ? 'transition-all duration-300 ease-out' : ''}`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {label || `${Math.round(normalizedProgress)}%`}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'stepped') {
    const steps = 4; // Default steps for ride tracking
    const currentStep = Math.ceil((normalizedProgress / 100) * steps);
    
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {Array.from({ length: steps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber <= currentStep;
          const isActive = stepNumber === currentStep;
          
          return (
            <React.Fragment key={index}>
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
                ${isCompleted 
                  ? `${colorClasses[color]} border-transparent text-white` 
                  : isActive 
                    ? `border-orange-500 text-orange-500 bg-orange-50`
                    : 'border-gray-300 text-gray-400 bg-white'
                }
                ${animated ? 'transition-all duration-300' : ''}
              `}>
                {isCompleted ? '✓' : stepNumber}
              </div>
              {index < steps - 1 && (
                <div className={`
                  flex-1 h-1 rounded-full
                  ${stepNumber < currentStep ? colorClasses[color] : backgroundClasses[color]}
                  ${animated ? 'transition-all duration-300' : ''}
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Default linear progress bar
  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {label}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(normalizedProgress)}%
          </span>
        </div>
      )}
      <div className={`
        w-full ${backgroundClasses[color]} rounded-full overflow-hidden ${sizeClasses[size]}
      `}>
        <div
          className={`
            ${sizeClasses[size]} ${colorClasses[color]} rounded-full
            ${animated ? 'transition-all duration-500 ease-out' : ''}
          `}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
    </div>
  );
};

// Predefined progress components for specific use cases
export const RideProgressBar = ({ 
  currentStep = 0, 
  steps = ['Booking', 'Driver Assigned', 'Pickup', 'Destination'],
  className = '' 
}) => {
  const progress = (currentStep / (steps.length - 1)) * 100;
  
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ride Progress</h3>
      
      <div className="space-y-4">
        <ProgressBar 
          progress={progress}
          variant="stepped"
          color="primary"
          animated={true}
        />
        
        <div className="flex justify-between text-sm">
          {steps.map((step, index) => (
            <span 
              key={index}
              className={`
                ${index <= currentStep ? 'text-orange-600 font-medium' : 'text-gray-400'}
              `}
            >
              {step}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const LoadingProgress = ({ 
  progress, 
  message = 'Loading...', 
  className = '' 
}) => (
  <div className={`text-center ${className}`}>
    <ProgressBar 
      progress={progress}
      size="md"
      color="primary"
      showLabel={true}
      label={message}
      animated={true}
    />
  </div>
);

export default ProgressBar;