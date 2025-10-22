import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  to,
  onClick,
  icon,
  animate = true,
  ...props 
}) => {
  const buttonRef = useRef(null);
  
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';
  
  // Enhanced micro-interactions
  const animationClasses = animate ? 'transition-all duration-200 transform hover:scale-105 active:scale-95 hover:-translate-y-0.5 hover:shadow-lg' : 'transition-all duration-200';
  
  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 shadow-md hover:shadow-xl',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 shadow-sm hover:shadow-md',
    outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50 focus:ring-orange-500 bg-white hover:border-orange-600',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 hover:text-gray-900',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-md hover:shadow-xl'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  // Ripple effect on click
  const createRipple = (event) => {
    if (!animate || !buttonRef.current) return;
    
    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  const handleClick = (event) => {
    if (!disabled && !loading) {
      createRipple(event);
      onClick?.(event);
    }
  };
  
  const buttonClasses = `${baseClasses} ${animationClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  const content = (
    <>
      {loading && (
        <div className="mr-2 animate-spin">
          <LoadingSpinner className="w-4 h-4" />
        </div>
      )}
      {icon && !loading && (
        <span className={`${children ? 'mr-2' : ''} transition-transform duration-200 ${animate ? 'group-hover:scale-110' : ''}`}>
          {icon}
        </span>
      )}
      <span className={loading ? 'opacity-75' : ''}>{children}</span>
    </>
  );
  
  if (to) {
    return (
      <Link 
        ref={buttonRef}
        to={to}
        className={`${buttonClasses} group`}
        onClick={handleClick}
        {...props}
      >
        {content}
      </Link>
    );
  }
  
  return (
    <button 
      ref={buttonRef}
      type={type}
      className={`${buttonClasses} group`}
      disabled={loading || disabled}
      onClick={handleClick}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;