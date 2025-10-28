import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}) => {
  const baseClasses = 'ds-spinner';
  const sizeClasses = `ds-spinner--${size}`;
  const colorClasses = `ds-spinner--${color}`;

  const spinnerClasses = [
    baseClasses,
    sizeClasses,
    colorClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={spinnerClasses} {...props} role="status" aria-label="Loading">
      <svg className="ds-spinner__svg animate-spin" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          className="ds-spinner__track"
        />
        <path
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          className="ds-spinner__indicator"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;