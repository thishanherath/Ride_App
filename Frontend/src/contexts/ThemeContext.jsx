import React, { createContext, useContext, useEffect, useState } from 'react';
import tokens from '../styles/tokens.js';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // Future: support for dark mode
  
  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply CSS custom properties to root
    Object.entries(tokens.colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--primary-${key}`, value);
    });
    
    Object.entries(tokens.colors.gray).forEach(([key, value]) => {
      root.style.setProperty(`--gray-${key}`, value);
    });
    
    Object.entries(tokens.colors.semantic).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    
    Object.entries(tokens.colors.background).forEach(([key, value]) => {
      root.style.setProperty(`--bg-${key}`, value);
    });
    
    // Apply typography tokens
    root.style.setProperty('--font-primary', tokens.typography.fontFamily.primary.join(', '));
    
    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--text-${key}`, value);
    });
    
    Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });
    
    // Apply spacing tokens
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--space-${key}`, value);
    });
    
    // Apply border radius tokens
    Object.entries(tokens.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
    
    // Apply shadow tokens
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
  }, [theme]);

  const value = {
    theme,
    setTheme,
    tokens,
    // Utility functions
    getColor: tokens.getColor,
    getSpacing: tokens.getSpacing,
    getBorderRadius: tokens.getBorderRadius,
    getShadow: tokens.getShadow,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;