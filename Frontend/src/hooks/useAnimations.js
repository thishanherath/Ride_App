import { useState, useEffect, useRef, useCallback } from 'react';

// Hook for managing component animations
export const useAnimations = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const elementRef = useRef(null);

  const triggerAnimation = useCallback((animationClass, duration = 300) => {
    if (!elementRef.current) return;

    setIsAnimating(true);
    elementRef.current.classList.add(animationClass);

    setTimeout(() => {
      setIsAnimating(false);
      if (elementRef.current) {
        elementRef.current.classList.remove(animationClass);
      }
    }, duration);
  }, []);

  const fadeIn = useCallback((duration = 300) => {
    triggerAnimation('animate-fade-in', duration);
  }, [triggerAnimation]);

  const slideUp = useCallback((duration = 600) => {
    triggerAnimation('animate-slide-in-up', duration);
  }, [triggerAnimation]);

  const scaleIn = useCallback((duration = 300) => {
    triggerAnimation('animate-scale-in', duration);
  }, [triggerAnimation]);

  const bounceIn = useCallback((duration = 600) => {
    triggerAnimation('animate-bounce-in', duration);
  }, [triggerAnimation]);

  return {
    elementRef,
    isVisible,
    setIsVisible,
    isAnimating,
    triggerAnimation,
    fadeIn,
    slideUp,
    scaleIn,
    bounceIn
  };
};

// Hook for intersection observer animations
export const useIntersectionAnimation = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  return { elementRef, isVisible };
};

// Hook for staggered animations
export const useStaggeredAnimation = (items = [], delay = 100) => {
  const [visibleItems, setVisibleItems] = useState(new Set());

  const triggerStaggered = useCallback(() => {
    items.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, index]));
      }, index * delay);
    });
  }, [items, delay]);

  const resetAnimation = useCallback(() => {
    setVisibleItems(new Set());
  }, []);

  return {
    visibleItems,
    triggerStaggered,
    resetAnimation,
    isVisible: (index) => visibleItems.has(index)
  };
};

// Hook for panel transitions
export const usePanelTransition = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [isAnimating, setIsAnimating] = useState(false);

  const openPanel = useCallback(() => {
    setIsAnimating(true);
    setIsOpen(true);
    setTimeout(() => setIsAnimating(false), 700);
  }, []);

  const closePanel = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
    }, 700);
  }, []);

  const togglePanel = useCallback(() => {
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }, [isOpen, openPanel, closePanel]);

  return {
    isOpen,
    isAnimating,
    openPanel,
    closePanel,
    togglePanel
  };
};

// Hook for micro-interactions
export const useMicroInteractions = () => {
  const elementRef = useRef(null);

  const addBounce = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.classList.add('micro-bounce');
      setTimeout(() => {
        if (elementRef.current) {
          elementRef.current.classList.remove('micro-bounce');
        }
      }, 150);
    }
  }, []);

  const addWiggle = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.classList.add('animate-wiggle');
      setTimeout(() => {
        if (elementRef.current) {
          elementRef.current.classList.remove('animate-wiggle');
        }
      }, 1000);
    }
  }, []);

  const addHeartbeat = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.classList.add('animate-heartbeat');
      setTimeout(() => {
        if (elementRef.current) {
          elementRef.current.classList.remove('animate-heartbeat');
        }
      }, 1500);
    }
  }, []);

  return {
    elementRef,
    addBounce,
    addWiggle,
    addHeartbeat
  };
};

// Hook for loading animations
export const useLoadingAnimation = (isLoading) => {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading');

  useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true);
      const interval = setInterval(() => {
        setLoadingText(prev => {
          if (prev === 'Loading...') return 'Loading';
          return prev + '.';
        });
      }, 500);

      return () => clearInterval(interval);
    } else {
      setShowSkeleton(false);
      setLoadingText('Loading');
    }
  }, [isLoading]);

  return {
    showSkeleton,
    loadingText
  };
};

// Hook for toast animations
export const useToastAnimation = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      duration,
      isVisible: true,
      isAnimating: false
    };

    setToasts(prev => [...prev, toast]);

    // Auto remove toast
    setTimeout(() => {
      setToasts(prev => 
        prev.map(t => 
          t.id === id ? { ...t, isAnimating: true } : t
        )
      );

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => 
      prev.map(t => 
        t.id === id ? { ...t, isAnimating: true } : t
      )
    );

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  return {
    toasts,
    addToast,
    removeToast
  };
};