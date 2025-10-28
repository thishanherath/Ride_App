import { useState, useEffect } from 'react';

const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [breakpoint, setBreakpoint] = useState('sm');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });

      // Tailwind CSS breakpoints
      if (width >= 1536) {
        setBreakpoint('2xl');
      } else if (width >= 1280) {
        setBreakpoint('xl');
      } else if (width >= 1024) {
        setBreakpoint('lg');
      } else if (width >= 768) {
        setBreakpoint('md');
      } else if (width >= 640) {
        setBreakpoint('sm');
      } else {
        setBreakpoint('xs');
      }
    };

    // Set initial values
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  const isTablet = breakpoint === 'md';
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';
  const isLargeScreen = breakpoint === 'xl' || breakpoint === '2xl';

  return {
    screenSize,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    // Utility functions
    isAtLeast: (bp) => {
      const order = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      return order.indexOf(breakpoint) >= order.indexOf(bp);
    },
    isAtMost: (bp) => {
      const order = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      return order.indexOf(breakpoint) <= order.indexOf(bp);
    }
  };
};

export default useResponsive;