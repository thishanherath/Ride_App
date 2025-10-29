import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Fixed Page Transition Component
 * Properly handles React Router navigation without blocking route changes
 */
const FixedPageTransition = ({ children, className = '' }) => {
  const location = useLocation();

  // Simple fade transition that doesn't interfere with routing
  return (
    <div
      key={location.pathname} // This ensures component re-renders on route change
      className={`page-transition animate-fade-in ${className}`}
      style={{
        animation: 'fadeIn 0.3s ease-in-out'
      }}
    >
      {children}
    </div>
  );
};

// Alternative: No transition version for debugging
export const NoTransitionWrapper = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// Working slide transition that doesn't block navigation
export const WorkingSlideTransition = ({ children, className = '' }) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className={`transition-all duration-300 ease-out ${className}`}
      style={{
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      {children}
    </div>
  );
};

export default FixedPageTransition;