import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children, className = '' }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  const onAnimationEnd = () => {
    if (transitionStage === 'fadeOut') {
      setDisplayLocation(location);
      setTransitionStage('fadeIn');
    }
  };

  const getTransitionClasses = () => {
    switch (transitionStage) {
      case 'fadeOut':
        return 'animate-fade-out';
      case 'fadeIn':
        return 'animate-fade-in';
      default:
        return '';
    }
  };

  return (
    <div
      className={`page-transition ${getTransitionClasses()} ${className}`}
      onAnimationEnd={onAnimationEnd}
    >
      {children}
    </div>
  );
};

// Slide transition variant
export const SlidePageTransition = ({ children, direction = 'right', className = '' }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('slideIn');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('slideOut');
    }
  }, [location, displayLocation]);

  const onAnimationEnd = () => {
    if (transitionStage === 'slideOut') {
      setDisplayLocation(location);
      setTransitionStage('slideIn');
    }
  };

  const getTransitionClasses = () => {
    const baseClass = 'transition-all duration-300 ease-out';
    
    switch (transitionStage) {
      case 'slideOut':
        return `${baseClass} ${direction === 'right' ? '-translate-x-full' : 'translate-x-full'} opacity-0`;
      case 'slideIn':
        return `${baseClass} translate-x-0 opacity-100`;
      default:
        return baseClass;
    }
  };

  return (
    <div
      className={`${getTransitionClasses()} ${className}`}
      onTransitionEnd={onAnimationEnd}
    >
      {children}
    </div>
  );
};

// Scale transition variant
export const ScalePageTransition = ({ children, className = '' }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('scaleIn');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('scaleOut');
    }
  }, [location, displayLocation]);

  const onAnimationEnd = () => {
    if (transitionStage === 'scaleOut') {
      setDisplayLocation(location);
      setTransitionStage('scaleIn');
    }
  };

  const getTransitionClasses = () => {
    const baseClass = 'transition-all duration-300 ease-out transform';
    
    switch (transitionStage) {
      case 'scaleOut':
        return `${baseClass} scale-95 opacity-0`;
      case 'scaleIn':
        return `${baseClass} scale-100 opacity-100`;
      default:
        return baseClass;
    }
  };

  return (
    <div
      className={`${getTransitionClasses()} ${className}`}
      onTransitionEnd={onAnimationEnd}
    >
      {children}
    </div>
  );
};

export default PageTransition;