import React from 'react';

const ResponsiveContainer = ({ 
  children, 
  size = 'default',
  className = '',
  padding = 'default',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'max-w-sm sm:max-w-md',
    md: 'max-w-md sm:max-w-lg lg:max-w-xl',
    lg: 'max-w-lg sm:max-w-xl lg:max-w-2xl xl:max-w-3xl',
    xl: 'max-w-xl sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl',
    full: 'max-w-full',
    default: 'max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 sm:px-6',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12',
    default: 'px-4 sm:px-6 lg:px-8'
  };

  return (
    <div 
      className={`w-full mx-auto ${sizeClasses[size]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;