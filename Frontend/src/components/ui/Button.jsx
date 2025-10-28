import React from 'react';
import './Button.css';

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const baseClasses = 'ds-button';
  const variantClasses = `ds-button--${variant}`;
  const sizeClasses = `ds-button--${size}`;
  const stateClasses = [
    loading && 'ds-button--loading',
    disabled && 'ds-button--disabled'
  ].filter(Boolean).join(' ');

  const buttonClasses = [
    baseClasses,
    variantClasses,
    sizeClasses,
    stateClasses,
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (loading || disabled) return;
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      <span className="ds-button__content">
        {loading && (
          <span className="ds-button__spinner" aria-hidden="true">
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                className="opacity-25"
              />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                className="opacity-75"
              />
            </svg>
          </span>
        )}
        {icon && !loading && (
          <span className="ds-button__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="ds-button__text">
          {children}
        </span>
      </span>
    </button>
  );
});

Button.displayName = 'Button';

export default Button;