import React, { useState } from 'react';

const Input = React.forwardRef(({ 
  label, 
  error, 
  icon, 
  className = '',
  type = 'text',
  id,
  name,
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  animate = true,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const inputId = id || name;

  const handleFocus = (e) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleChange = (e) => {
    setHasValue(!!e.target.value);
    onChange?.(e);
  };
  
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className={`block text-sm font-medium transition-colors duration-200 ${
            isFocused ? 'text-orange-600' : 'text-gray-700'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
            isFocused ? 'text-orange-500 scale-110' : 'text-gray-400'
          }`}>
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-base
            focus:ring-2 focus:ring-orange-500 focus:bg-white
            transition-all duration-300 ease-out
            disabled:opacity-50 disabled:cursor-not-allowed
            placeholder:text-gray-400
            ${animate ? 'transform hover:scale-[1.02] focus:scale-[1.02]' : ''}
            ${isFocused ? 'shadow-lg' : 'shadow-sm'}
            ${icon ? 'pl-10' : ''}
            ${error ? 'ring-2 ring-red-500 focus:ring-red-500 bg-red-50' : ''}
            ${className}
          `}
          {...props}
        />
        
        {/* Animated border effect */}
        {animate && (
          <div className={`absolute inset-0 rounded-xl border-2 border-transparent transition-all duration-300 pointer-events-none ${
            isFocused ? 'border-orange-200 shadow-orange-100' : ''
          }`} />
        )}
        
        {/* Success indicator */}
        {hasValue && !error && animate && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>
      
      {error && (
        <div className="animate-slide-in-up">
          <p className="text-sm text-red-500 flex items-center">
            <svg className="w-4 h-4 mr-1 animate-wiggle" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}
    </div>
  );
});

export default Input;