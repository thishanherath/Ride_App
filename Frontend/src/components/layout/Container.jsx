import React from 'react';

const Container = ({ 
  children,
  size = 'default', // 'sm', 'default', 'lg', 'xl', 'full'
  padding = 'default', // 'none', 'sm', 'default', 'lg'
  center = false,
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    default: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-2',
    default: 'px-6 py-4',
    lg: 'px-8 py-6'
  };

  return (
    <div 
      className={`
        w-full
        ${sizeClasses[size]}
        ${paddingClasses[padding]}
        ${center ? 'mx-auto' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Specialized container variants
export const PageContainer = ({ children, className = '', ...props }) => (
  <Container 
    size="default" 
    padding="default" 
    center 
    className={`min-h-screen ${className}`}
    {...props}
  >
    {children}
  </Container>
);

export const SectionContainer = ({ children, className = '', ...props }) => (
  <Container 
    size="lg" 
    padding="lg" 
    center 
    className={`py-12 ${className}`}
    {...props}
  >
    {children}
  </Container>
);

export const FormContainer = ({ children, className = '', ...props }) => (
  <Container 
    size="sm" 
    padding="default" 
    center 
    className={`${className}`}
    {...props}
  >
    {children}
  </Container>
);

export const ContentContainer = ({ children, className = '', ...props }) => (
  <Container 
    size="default" 
    padding="default" 
    className={`${className}`}
    {...props}
  >
    {children}
  </Container>
);

export default Container;