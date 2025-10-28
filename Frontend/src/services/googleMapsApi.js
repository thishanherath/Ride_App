/**
 * Google Maps API Service with Rate Limiting and Error Handling
 */

import { GOOGLE_MAPS_CONFIG, getApiKey, getEnvironmentConfig } from '../config/googleMaps.js';

/**
 * Rate limiter class to manage API call frequency
 */
class RateLimiter {
  constructor(maxRequestsPerSecond = 10, maxRequestsPerMinute = 600) {
    this.maxRequestsPerSecond = maxRequestsPerSecond;
    this.maxRequestsPerMinute = maxRequestsPerMinute;
    this.requestsThisSecond = 0;
    this.requestsThisMinute = 0;
    this.lastSecondReset = Date.now();
    this.lastMinuteReset = Date.now();
    this.queue = [];
    this.processing = false;
  }

  /**
   * Checks if we can make a request now
   * @returns {boolean} True if request can be made
   */
  canMakeRequest() {
    const now = Date.now();
    
    // Reset counters if needed
    if (now - this.lastSecondReset >= 1000) {
      this.requestsThisSecond = 0;
      this.lastSecondReset = now;
    }
    
    if (now - this.lastMinuteReset >= 60000) {
      this.requestsThisMinute = 0;
      this.lastMinuteReset = now;
    }
    
    return this.requestsThisSecond < this.maxRequestsPerSecond && 
           this.requestsThisMinute < this.maxRequestsPerMinute;
  }

  /**
   * Records a request
   */
  recordRequest() {
    this.requestsThisSecond++;
    this.requestsThisMinute++;
  }

  /**
   * Adds a request to the queue
   * @param {Function} requestFn - Function that makes the API request
   * @returns {Promise} Promise that resolves with the request result
   */
  async queueRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Processes the request queue
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      if (this.canMakeRequest()) {
        const { requestFn, resolve, reject } = this.queue.shift();
        this.recordRequest();
        
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      } else {
        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    this.processing = false;
  }
}

/**
 * Error handling utilities
 */
class ApiErrorHandler {
  /**
   * Handles Google Maps API errors
   * @param {Error} error - The error to handle
   * @param {string} operation - The operation that failed
   * @returns {Object} Standardized error response
   */
  static handleError(error, operation = 'API request') {
    const envConfig = getEnvironmentConfig();
    
    // Log error in development
    if (envConfig.enableDebugLogging) {
      console.error(`Google Maps API Error (${operation}):`, error);
    }

    // Determine error type and create appropriate response
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Network connection failed. Please check your internet connection.',
        retryable: true,
        originalError: error
      };
    }

    if (error.message.includes('API key')) {
      return {
        success: false,
        error: 'API_KEY_ERROR',
        message: 'Google Maps API key is invalid or missing.',
        retryable: false,
        originalError: error
      };
    }

    if (error.message.includes('quota') || error.message.includes('limit')) {
      return {
        success: false,
        error: 'QUOTA_EXCEEDED',
        message: 'API quota exceeded. Please try again later.',
        retryable: true,
        originalError: error
      };
    }

    if (error.message.includes('ZERO_RESULTS')) {
      return {
        success: false,
        error: 'NO_RESULTS',
        message: 'No results found for the given location.',
        retryable: false,
        originalError: error
      };
    }

    // Generic error
    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      retryable: true,
      originalError: error
    };
  }

  /**
   * Implements retry logic with exponential backoff
   * @param {Function} requestFn - Function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {Promise} Promise that resolves with the result
   */
  static async retryWithBackoff(requestFn, maxRetries = 3, baseDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        const errorResponse = this.handleError(error);
        
        // Don't retry if error is not retryable
        if (!errorResponse.retryable || attempt === maxRetries) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

/**
 * Main Google Maps API service
 */
class GoogleMapsApiService {
  constructor() {
    this.rateLimiter = new RateLimiter(
      GOOGLE_MAPS_CONFIG.rateLimiting.maxRequestsPerSecond,
      GOOGLE_MAPS_CONFIG.rateLimiting.maxRequestsPerMinute
    );
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Makes a cached API request
   * @param {string} cacheKey - Cache key for the request
   * @param {Function} requestFn - Function that makes the API request
   * @returns {Promise} Promise that resolves with the result
   */
  async makeCachedRequest(cacheKey, requestFn) {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Make the request with rate limiting and error handling
    const result = await this.rateLimiter.queueRequest(async () => {
      return await ApiErrorHandler.retryWithBackoff(requestFn);
    });

    // Cache the result
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  /**
   * Builds URL with parameters
   * @param {string} baseUrl - Base URL
   * @param {Object} params - URL parameters
   * @returns {string} Complete URL
   */
  buildUrl(baseUrl, params) {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
    return url.toString();
  }

  /**
   * Makes a fetch request with proper error handling
   * @param {string} url - URL to fetch
   * @returns {Promise} Promise that resolves with the response data
   */
  async fetchWithErrorHandling(url) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check Google Maps API status
      if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Maps API Error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Geocodes an address to coordinates
   * @param {string} address - Address to geocode
   * @returns {Promise<Object>} Coordinates and formatted address
   */
  async geocodeAddress(address) {
    if (!address || typeof address !== 'string') {
      throw new Error('Valid address is required');
    }

    const cacheKey = `geocode:${address}`;
    
    return this.makeCachedRequest(cacheKey, async () => {
      const url = this.buildUrl(GOOGLE_MAPS_CONFIG.endpoints.geocoding, {
        address: address,
        key: getApiKey(),
        region: GOOGLE_MAPS_CONFIG.defaultOptions.region,
        language: GOOGLE_MAPS_CONFIG.defaultOptions.language
      });

      const data = await this.fetchWithErrorHandling(url);
      
      if (!data.results || data.results.length === 0) {
        throw new Error('ZERO_RESULTS');
      }

      const result = data.results[0];
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        types: result.types,
        components: this.parseAddressComponents(result.address_components)
      };
    });
  }

  /**
   * Reverse geocodes coordinates to address
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Address information
   */
  async geocodeCoordinates(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      throw new Error('Valid latitude and longitude are required');
    }

    const cacheKey = `reverse_geocode:${lat.toFixed(6)},${lng.toFixed(6)}`;
    
    return this.makeCachedRequest(cacheKey, async () => {
      const url = this.buildUrl(GOOGLE_MAPS_CONFIG.endpoints.geocoding, {
        latlng: `${lat},${lng}`,
        key: getApiKey(),
        region: GOOGLE_MAPS_CONFIG.defaultOptions.region,
        language: GOOGLE_MAPS_CONFIG.defaultOptions.language,
        result_type: 'street_address|route|neighborhood|locality|administrative_area_level_1|administrative_area_level_2|country'
      });

      const data = await this.fetchWithErrorHandling(url);
      
      if (!data.results || data.results.length === 0) {
        throw new Error('ZERO_RESULTS');
      }

      // Find the most specific address (prefer street address, then route, etc.)
      const priorityOrder = [
        'street_address',
        'route',
        'neighborhood', 
        'locality',
        'administrative_area_level_2',
        'administrative_area_level_1',
        'country'
      ];

      let bestResult = data.results[0];
      for (const priority of priorityOrder) {
        const found = data.results.find(result => 
          result.types.includes(priority)
        );
        if (found) {
          bestResult = found;
          break;
        }
      }

      return {
        latitude: lat,
        longitude: lng,
        formattedAddress: bestResult.formatted_address,
        placeId: bestResult.place_id,
        types: bestResult.types,
        components: this.parseAddressComponents(bestResult.address_components)
      };
    });
  }

  /**
   * Parses address components into a structured object
   * @param {Array} addressComponents - Google Maps address components
   * @returns {Object} Parsed address components
   */
  parseAddressComponents(addressComponents) {
    if (!addressComponents || !Array.isArray(addressComponents)) {
      return {};
    }

    const components = {};
    
    addressComponents.forEach(component => {
      component.types.forEach(type => {
        components[type] = component.long_name;
        components[`${type}_short`] = component.short_name;
      });
    });

    return components;
  }

  /**
   * Enhanced distance and duration calculation with traffic awareness and additional options
   * @param {string} origin - Origin address
   * @param {string} destination - Destination address
   * @param {Object} options - Additional options for the request
   * @returns {Promise<Object>} Distance and duration data
   */
  async getDistanceMatrix(origin, destination, options = {}) {
    if (!origin || !destination) {
      throw new Error('Origin and destination are required');
    }

    const {
      mode = 'driving',
      units = 'metric',
      avoid = '',
      traffic_model = 'best_guess',
      departure_time = 'now',
      arrival_time = null,
      transit_mode = null,
      transit_routing_preference = null,
      region = GOOGLE_MAPS_CONFIG.defaultOptions.region,
      language = GOOGLE_MAPS_CONFIG.defaultOptions.language
    } = options;

    // Create cache key including options
    const cacheKey = `distance:${origin}:${destination}:${JSON.stringify(options)}`;
    
    return this.makeCachedRequest(cacheKey, async () => {
      // Build request parameters
      const params = {
        origins: origin,
        destinations: destination,
        key: getApiKey(),
        units,
        mode,
        language,
        region: region
      };

      // Add optional parameters
      if (avoid) params.avoid = avoid;
      if (mode === 'driving' && traffic_model) {
        params.traffic_model = traffic_model;
        if (departure_time) params.departure_time = departure_time;
      }
      if (arrival_time) params.arrival_time = arrival_time;
      if (mode === 'transit') {
        if (transit_mode) params.transit_mode = transit_mode;
        if (transit_routing_preference) params.transit_routing_preference = transit_routing_preference;
      }

      const url = this.buildUrl(GOOGLE_MAPS_CONFIG.endpoints.distanceMatrix, params);
      const data = await this.fetchWithErrorHandling(url);
      
      if (!data.rows || data.rows.length === 0 || 
          !data.rows[0].elements || data.rows[0].elements.length === 0) {
        throw new Error('ZERO_RESULTS');
      }

      const element = data.rows[0].elements[0];
      
      if (element.status !== 'OK') {
        throw new Error(`Distance calculation failed: ${element.status}`);
      }

      // Enhanced result with additional metadata
      return {
        distance: element.distance,
        duration: element.duration,
        durationInTraffic: element.duration_in_traffic || element.duration,
        status: element.status,
        // Additional metadata
        metadata: {
          origin: data.origin_addresses?.[0] || origin,
          destination: data.destination_addresses?.[0] || destination,
          mode,
          units,
          hasTrafficData: !!element.duration_in_traffic,
          requestTime: new Date().toISOString(),
          trafficModel: traffic_model,
          departureTime: departure_time
        }
      };
    });
  }

  /**
   * Batch distance matrix calculation for multiple origins/destinations
   * @param {Array<string>} origins - Array of origin addresses
   * @param {Array<string>} destinations - Array of destination addresses
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Batch distance matrix results
   */
  async getBatchDistanceMatrix(origins, destinations, options = {}) {
    if (!Array.isArray(origins) || !Array.isArray(destinations)) {
      throw new Error('Origins and destinations must be arrays');
    }

    if (origins.length === 0 || destinations.length === 0) {
      throw new Error('Origins and destinations arrays cannot be empty');
    }

    // Google Maps API limits
    const maxElements = 100; // 10x10 matrix max
    const maxOriginsPerRequest = 25;
    const maxDestinationsPerRequest = 25;

    if (origins.length * destinations.length > maxElements) {
      throw new Error(`Too many elements. Maximum ${maxElements} origin-destination pairs allowed.`);
    }

    const {
      mode = 'driving',
      units = 'metric',
      avoid = '',
      traffic_model = 'best_guess',
      departure_time = 'now',
      language = GOOGLE_MAPS_CONFIG.defaultOptions.language
    } = options;

    const cacheKey = `batch_distance:${JSON.stringify(origins)}:${JSON.stringify(destinations)}:${JSON.stringify(options)}`;
    
    return this.makeCachedRequest(cacheKey, async () => {
      const params = {
        origins: origins.join('|'),
        destinations: destinations.join('|'),
        key: getApiKey(),
        units,
        mode,
        language
      };

      if (avoid) params.avoid = avoid;
      if (mode === 'driving' && traffic_model) {
        params.traffic_model = traffic_model;
        if (departure_time) params.departure_time = departure_time;
      }

      const url = this.buildUrl(GOOGLE_MAPS_CONFIG.endpoints.distanceMatrix, params);
      const data = await this.fetchWithErrorHandling(url);
      
      if (!data.rows || data.rows.length === 0) {
        throw new Error('ZERO_RESULTS');
      }

      // Process batch results
      const results = [];
      for (let i = 0; i < data.rows.length; i++) {
        const row = data.rows[i];
        const rowResults = [];
        
        for (let j = 0; j < row.elements.length; j++) {
          const element = row.elements[j];
          
          rowResults.push({
            origin: data.origin_addresses?.[i] || origins[i],
            destination: data.destination_addresses?.[j] || destinations[j],
            distance: element.distance,
            duration: element.duration,
            durationInTraffic: element.duration_in_traffic || element.duration,
            status: element.status,
            hasTrafficData: !!element.duration_in_traffic
          });
        }
        
        results.push(rowResults);
      }

      return {
        results,
        metadata: {
          originCount: origins.length,
          destinationCount: destinations.length,
          totalElements: origins.length * destinations.length,
          mode,
          units,
          requestTime: new Date().toISOString()
        }
      };
    });
  }

  /**
   * Gets place autocomplete suggestions with enhanced options
   * @param {string} input - User input
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Array of place suggestions
   */
  async getPlaceAutocomplete(input, options = {}) {
    if (!input || input.length < 3) {
      return [];
    }

    const {
      types = '',
      location = '',
      radius = '',
      strictbounds = false,
      sessiontoken = '',
      offset = '',
      origin = '',
      components = GOOGLE_MAPS_CONFIG.defaultOptions.components,
      language = GOOGLE_MAPS_CONFIG.defaultOptions.language
    } = options;

    const cacheKey = `autocomplete:${input}:${JSON.stringify(options)}`;
    
    return this.makeCachedRequest(cacheKey, async () => {
      const params = {
        input: input,
        key: getApiKey(),
        language,
        components
      };

      // Add optional parameters
      if (types) params.types = types;
      if (location) params.location = location;
      if (radius) params.radius = radius;
      if (strictbounds) params.strictbounds = strictbounds;
      if (sessiontoken) params.sessiontoken = sessiontoken;
      if (offset) params.offset = offset;
      if (origin) params.origin = origin;

      const url = this.buildUrl(GOOGLE_MAPS_CONFIG.endpoints.places, params);
      const data = await this.fetchWithErrorHandling(url);
      
      return (data.predictions || []).map(prediction => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText: prediction.structured_formatting?.main_text,
        secondaryText: prediction.structured_formatting?.secondary_text,
        types: prediction.types,
        matchedSubstrings: prediction.matched_substrings,
        terms: prediction.terms,
        distanceMeters: prediction.distance_meters
      }));
    });
  }

  /**
   * Gets detailed information about a place
   * @param {string} placeId - Google Places ID
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Place details
   */
  async getPlaceDetails(placeId, options = {}) {
    if (!placeId) {
      throw new Error('Place ID is required');
    }

    const {
      fields = [
        'place_id',
        'name',
        'formatted_address',
        'geometry',
        'rating',
        'price_level',
        'opening_hours',
        'photos',
        'types',
        'vicinity',
        'website',
        'formatted_phone_number'
      ],
      language = GOOGLE_MAPS_CONFIG.defaultOptions.language,
      region = GOOGLE_MAPS_CONFIG.defaultOptions.region,
      sessiontoken = ''
    } = options;

    const cacheKey = `place_details:${placeId}:${JSON.stringify(options)}`;
    
    return this.makeCachedRequest(cacheKey, async () => {
      const params = {
        place_id: placeId,
        key: getApiKey(),
        fields: Array.isArray(fields) ? fields.join(',') : fields,
        language,
        region
      };

      if (sessiontoken) params.sessiontoken = sessiontoken;

      const url = this.buildUrl(GOOGLE_MAPS_CONFIG.endpoints.placeDetails, params);
      const data = await this.fetchWithErrorHandling(url);
      
      if (!data.result) {
        throw new Error('Place details not found');
      }

      return data.result;
    });
  }

  /**
   * Search for nearby places
   * @param {Object} location - Location coordinates
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of nearby places
   */
  async getNearbyPlaces(location, options = {}) {
    if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      throw new Error('Valid location coordinates are required');
    }

    const {
      radius = 1000,
      type = '',
      keyword = '',
      name = '',
      minprice = '',
      maxprice = '',
      opennow = false,
      rankby = 'prominence',
      language = GOOGLE_MAPS_CONFIG.defaultOptions.language
    } = options;

    const cacheKey = `nearby:${location.latitude},${location.longitude}:${JSON.stringify(options)}`;
    
    return this.makeCachedRequest(cacheKey, async () => {
      const params = {
        location: `${location.latitude},${location.longitude}`,
        key: getApiKey(),
        language
      };

      // Add search parameters
      if (rankby === 'distance') {
        // When ranking by distance, radius is not allowed
        params.rankby = 'distance';
        if (!type && !keyword && !name) {
          throw new Error('At least one of type, keyword, or name must be specified when ranking by distance');
        }
      } else {
        params.radius = radius;
        if (rankby) params.rankby = rankby;
      }

      if (type) params.type = type;
      if (keyword) params.keyword = keyword;
      if (name) params.name = name;
      if (minprice) params.minprice = minprice;
      if (maxprice) params.maxprice = maxprice;
      if (opennow) params.opennow = opennow;

      const url = this.buildUrl(GOOGLE_MAPS_CONFIG.endpoints.nearbySearch, params);
      const data = await this.fetchWithErrorHandling(url);
      
      return (data.results || []).map(place => ({
        placeId: place.place_id,
        name: place.name,
        vicinity: place.vicinity,
        types: place.types,
        rating: place.rating,
        priceLevel: place.price_level,
        geometry: place.geometry,
        openingHours: place.opening_hours,
        photos: place.photos,
        icon: place.icon,
        iconBackgroundColor: place.icon_background_color,
        iconMaskBaseUri: place.icon_mask_base_uri
      }));
    });
  }

  /**
   * Clears the cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Gets cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Create and export singleton instance
const googleMapsApiService = new GoogleMapsApiService();
export default googleMapsApiService;

// Export classes for testing
export { RateLimiter, ApiErrorHandler, GoogleMapsApiService };