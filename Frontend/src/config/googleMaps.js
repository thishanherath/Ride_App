/**
 * Google Maps API Configuration and Management
 */

// Google Maps API configuration
export const GOOGLE_MAPS_CONFIG = {
  // API Key from environment variables
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  
  // Required APIs for the application
  libraries: ['places', 'geometry', 'directions'],
  
  // API endpoints
  endpoints: {
    geocoding: 'https://maps.googleapis.com/maps/api/geocode/json',
    distanceMatrix: 'https://maps.googleapis.com/maps/api/distancematrix/json',
    places: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
    placeDetails: 'https://maps.googleapis.com/maps/api/place/details/json',
    nearbySearch: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
    directions: 'https://maps.googleapis.com/maps/api/directions/json'
  },
  
  // Default options
  defaultOptions: {
    region: 'LK', // Sri Lanka
    language: 'en',
    components: 'country:LK' // Restrict to Sri Lanka
  },
  
  // Rate limiting configuration
  rateLimiting: {
    maxRequestsPerSecond: 10,
    maxRequestsPerMinute: 600,
    retryDelay: 1000, // 1 second
    maxRetries: 3
  }
};

/**
 * Validates Google Maps API key
 * @returns {Object} Validation result
 */
export const validateApiKey = () => {
  const apiKey = GOOGLE_MAPS_CONFIG.apiKey;
  
  const validation = {
    isValid: false,
    error: null,
    warnings: []
  };
  
  // Check if API key exists
  if (!apiKey) {
    validation.error = 'Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.';
    return validation;
  }
  
  // Check if API key is placeholder
  if (apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    validation.error = 'Google Maps API key is still set to placeholder value. Please configure a real API key.';
    return validation;
  }
  
  // Basic format validation
  if (typeof apiKey !== 'string' || apiKey.length < 20) {
    validation.error = 'Google Maps API key appears to be invalid. Please check the key format.';
    return validation;
  }
  
  // Check for common issues
  if (apiKey.includes(' ')) {
    validation.warnings.push('API key contains spaces, which may cause issues.');
  }
  
  if (apiKey.startsWith('AIza') === false) {
    validation.warnings.push('API key does not start with expected prefix "AIza".');
  }
  
  validation.isValid = true;
  return validation;
};

/**
 * Gets the configured API key with validation
 * @returns {string} API key
 * @throws {Error} If API key is invalid
 */
export const getApiKey = () => {
  const validation = validateApiKey();
  
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  // Log warnings if any
  if (validation.warnings.length > 0) {
    console.warn('Google Maps API Key Warnings:', validation.warnings);
  }
  
  return GOOGLE_MAPS_CONFIG.apiKey;
};

/**
 * Checks if Google Maps APIs are available
 * @returns {Promise<boolean>} True if APIs are available
 */
export const checkApiAvailability = async () => {
  try {
    // Simple test to check if we can make a request
    const testUrl = `${GOOGLE_MAPS_CONFIG.endpoints.geocoding}?address=Colombo&key=${getApiKey()}`;
    const response = await fetch(testUrl);
    const data = await response.json();
    
    return data.status === 'OK' || data.status === 'ZERO_RESULTS';
  } catch (error) {
    console.error('Google Maps API availability check failed:', error);
    return false;
  }
};

/**
 * Gets environment-specific configuration
 * @returns {Object} Environment configuration
 */
export const getEnvironmentConfig = () => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  
  return {
    isDevelopment,
    isProduction,
    serverUrl: import.meta.env.VITE_SERVER_URL || 'http://localhost:4000',
    
    // Development-specific settings
    ...(isDevelopment && {
      enableDebugLogging: true,
      enableApiMocking: false,
      strictValidation: false
    }),
    
    // Production-specific settings
    ...(isProduction && {
      enableDebugLogging: false,
      enableApiMocking: false,
      strictValidation: true
    })
  };
};

/**
 * Logs API configuration status
 */
export const logConfigurationStatus = () => {
  const validation = validateApiKey();
  const envConfig = getEnvironmentConfig();
  
  console.group('🗺️ Google Maps Configuration Status');
  
  console.log('Environment:', envConfig.isDevelopment ? 'Development' : 'Production');
  console.log('Server URL:', envConfig.serverUrl);
  
  if (validation.isValid) {
    console.log('✅ API Key: Valid');
    if (validation.warnings.length > 0) {
      console.warn('⚠️ Warnings:', validation.warnings);
    }
  } else {
    console.error('❌ API Key:', validation.error);
  }
  
  console.log('📚 Required Libraries:', GOOGLE_MAPS_CONFIG.libraries);
  console.log('🌍 Region:', GOOGLE_MAPS_CONFIG.defaultOptions.region);
  
  console.groupEnd();
};

// Auto-log configuration in development
if (getEnvironmentConfig().isDevelopment) {
  logConfigurationStatus();
}