/**
 * Navigation Performance Optimizer
 * Preloads components and data for smooth navigation
 */

// Preload components when user hovers over navigation items
export const preloadComponent = (componentName) => {
  switch (componentName) {
    case 'RideHistory':
      // Preload the RideHistory component
      import('../screens/RideHistory').then(() => {
        console.log('📦 RideHistory component preloaded');
      }).catch(err => {
        console.warn('⚠️ Failed to preload RideHistory:', err);
      });
      break;
    
    case 'Profile':
      // Preload profile components
      Promise.all([
        import('../screens/UserEditProfile'),
        import('../screens/CaptainEditProfile')
      ]).then(() => {
        console.log('📦 Profile components preloaded');
      }).catch(err => {
        console.warn('⚠️ Failed to preload Profile components:', err);
      });
      break;
    
    default:
      console.log(`🔍 No preload strategy for ${componentName}`);
  }
};

// Debounced preload function to avoid excessive calls
let preloadTimeout;
export const debouncedPreload = (componentName, delay = 300) => {
  clearTimeout(preloadTimeout);
  preloadTimeout = setTimeout(() => {
    preloadComponent(componentName);
  }, delay);
};

// Navigation performance metrics
export const trackNavigationPerformance = (routeName, startTime) => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`📊 Navigation to ${routeName}: ${duration.toFixed(2)}ms`);
  
  // You can send this to analytics service
  if (duration > 1000) {
    console.warn(`⚠️ Slow navigation detected: ${routeName} took ${duration.toFixed(2)}ms`);
  }
};

// Optimize images and assets loading
export const optimizeAssetLoading = () => {
  // Preload critical images
  const criticalImages = [
    '/map.png',
    // Add other critical images here
  ];
  
  criticalImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

// Initialize performance optimizations
export const initializeNavigationOptimizer = () => {
  // Preload critical assets
  optimizeAssetLoading();
  
  // Add performance observer for navigation timing
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          console.log('📊 Page load performance:', {
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart,
            total: entry.loadEventEnd - entry.fetchStart
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['navigation'] });
  }
};