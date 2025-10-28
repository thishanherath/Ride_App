// Animation Utilities for the Design System

/**
 * Animation configuration constants
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  EXTRA_SLOW: 500
};

export const EASING = {
  EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
  EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};

/**
 * CSS-in-JS animation styles
 */
export const animations = {
  slideInUp: {
    from: {
      transform: 'translateY(100%)',
      opacity: 0
    },
    to: {
      transform: 'translateY(0)',
      opacity: 1
    }
  },
  
  slideInDown: {
    from: {
      transform: 'translateY(-100%)',
      opacity: 0
    },
    to: {
      transform: 'translateY(0)',
      opacity: 1
    }
  },
  
  fadeIn: {
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  },
  
  scaleIn: {
    from: {
      transform: 'scale(0.95)',
      opacity: 0
    },
    to: {
      transform: 'scale(1)',
      opacity: 1
    }
  },
  
  spin: {
    from: {
      transform: 'rotate(0deg)'
    },
    to: {
      transform: 'rotate(360deg)'
    }
  }
};

/**
 * Utility function to create CSS animation strings
 */
export const createAnimation = (name, duration = ANIMATION_DURATION.NORMAL, easing = EASING.EASE_OUT, delay = 0) => {
  return `${name} ${duration}ms ${easing} ${delay}ms`;
};

/**
 * Utility function to create transition strings
 */
export const createTransition = (properties = 'all', duration = ANIMATION_DURATION.NORMAL, easing = EASING.EASE_OUT, delay = 0) => {
  const props = Array.isArray(properties) ? properties.join(', ') : properties;
  return `${props} ${duration}ms ${easing} ${delay}ms`;
};

/**
 * Common transition presets
 */
export const transitions = {
  all: createTransition('all'),
  colors: createTransition(['color', 'background-color', 'border-color']),
  transform: createTransition('transform'),
  opacity: createTransition('opacity'),
  fast: createTransition('all', ANIMATION_DURATION.FAST),
  slow: createTransition('all', ANIMATION_DURATION.SLOW)
};

/**
 * Animation class names for CSS
 */
export const animationClasses = {
  SLIDE_IN_UP: 'animate-slide-in-up',
  SLIDE_IN_DOWN: 'animate-slide-in-down',
  FADE_IN: 'animate-fade-in',
  SCALE_IN: 'animate-scale-in',
  SPIN: 'animate-spin',
  PULSE: 'animate-pulse',
  SHAKE: 'animate-shake'
};

/**
 * Transition class names for CSS
 */
export const transitionClasses = {
  ALL: 'transition-all',
  COLORS: 'transition-colors',
  TRANSFORM: 'transition-transform',
  OPACITY: 'transition-opacity'
};

/**
 * Hook for managing component animations
 */
export const useAnimation = (initialState = false) => {
  const [isAnimating, setIsAnimating] = React.useState(initialState);
  
  const startAnimation = () => setIsAnimating(true);
  const stopAnimation = () => setIsAnimating(false);
  const toggleAnimation = () => setIsAnimating(prev => !prev);
  
  return {
    isAnimating,
    startAnimation,
    stopAnimation,
    toggleAnimation
  };
};

/**
 * Utility for staggered animations
 */
export const createStaggeredDelay = (index, baseDelay = 50) => {
  return index * baseDelay;
};

/**
 * Performance-optimized animation utilities
 */
export const performanceAnimations = {
  // Use transform and opacity for best performance
  slideUp: {
    transform: 'translateY(0)',
    opacity: 1,
    transition: transitions.all
  },
  
  slideDown: {
    transform: 'translateY(100%)',
    opacity: 0,
    transition: transitions.all
  },
  
  fadeIn: {
    opacity: 1,
    transition: transitions.opacity
  },
  
  fadeOut: {
    opacity: 0,
    transition: transitions.opacity
  },
  
  scaleIn: {
    transform: 'scale(1)',
    opacity: 1,
    transition: transitions.all
  },
  
  scaleOut: {
    transform: 'scale(0.95)',
    opacity: 0,
    transition: transitions.all
  }
};