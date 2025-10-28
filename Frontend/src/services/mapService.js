import axios from 'axios';
import googleMapsApiService from './googleMapsApi.js';
import { getEnvironmentConfig } from '../config/googleMaps.js';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

/**
 * Service for Google Maps API integration with enhanced Distance Matrix functionality
 */
class MapService {
  constructor() {
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000
    };
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Enhanced distance and duration calculation with traffic awareness and retry logic
   * @param {string} pickup - Pickup location address
   * @param {string} destination - Destination location address
   * @param {Object} options - Additional options for calculation
   * @returns {Promise<Object>} Enhanced distance and duration data
   */
  async getDistanceAndDuration(pickup, destination, options = {}) {
    if (!pickup || !destination) {
      throw new Error('Pickup and destination locations are required');
    }

    const {
      includeTraffic = true,
      mode = 'driving',
      avoidTolls = false,
      avoidHighways = false,
      units = 'metric'
    } = options;

    // Check cache first
    const cacheKey = `distance:${pickup}:${destination}:${JSON.stringify(options)}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      return cached;
    }

    const envConfig = getEnvironmentConfig();

    try {
      let result;
      
      // Try direct Google Maps API first with enhanced options
      if (envConfig.enableDirectApiCalls !== false) {
        try {
          result = await this.getDistanceMatrixWithRetry(pickup, destination, {
            includeTraffic,
            mode,
            avoidTolls,
            avoidHighways,
            units
          });
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to backend:', directApiError.message);
        }
      }

      // Fallback to backend API if direct call failed
      if (!result) {
        result = await this.getDistanceFromBackend(pickup, destination, options);
      }

      // Format and enhance the result
      const enhancedResult = this.formatDistanceTimeResult(result, options);
      
      // Cache the result
      this.setCachedResult(cacheKey, enhancedResult);
      
      return enhancedResult;
    } catch (error) {
      console.error('Error fetching distance and duration:', error);
      
      // Return fallback values if all methods fail
      return this.getFallbackDistanceTime();
    }
  }

  /**
   * Get distance matrix with retry logic and exponential backoff
   * @param {string} origin - Origin location
   * @param {string} destination - Destination location
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Distance matrix result
   */
  async getDistanceMatrixWithRetry(origin, destination, options = {}) {
    const {
      includeTraffic = true,
      mode = 'driving',
      avoidTolls = false,
      avoidHighways = false,
      units = 'metric'
    } = options;

    let lastError;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        // Enhanced Google Maps API call with traffic data
        const result = await googleMapsApiService.getDistanceMatrix(origin, destination, {
          mode,
          units,
          avoid: this.buildAvoidanceString(avoidTolls, avoidHighways),
          traffic_model: includeTraffic ? 'best_guess' : undefined,
          departure_time: includeTraffic ? 'now' : undefined
        });

        return result;
      } catch (error) {
        lastError = error;
        
        // Don't retry for certain error types
        if (this.isNonRetryableError(error) || attempt === this.retryConfig.maxRetries) {
          throw error;
        }

        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
          this.retryConfig.maxDelay
        );
        
        console.warn(`Distance Matrix API attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Get distance data from backend API
   * @param {string} pickup - Pickup location
   * @param {string} destination - Destination location
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Backend API result
   */
  async getDistanceFromBackend(pickup, destination, options = {}) {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/map/get-distance-time`, {
      params: {
        origin: pickup,
        destination: destination,
        ...options
      },
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 15000
    });

    if (!response.data || !response.data.distance || !response.data.duration) {
      throw new Error('Invalid response format from backend');
    }

    return response.data;
  }

  /**
   * Format distance and time result with enhanced data
   * @param {Object} rawResult - Raw API result
   * @param {Object} options - Original request options
   * @returns {Object} Formatted result
   */
  formatDistanceTimeResult(rawResult, options = {}) {
    const { includeTraffic = true } = options;
    
    // Handle both direct API and backend API response formats
    const distance = rawResult.distance;
    const duration = rawResult.durationInTraffic || rawResult.duration_in_traffic || rawResult.duration;
    const normalDuration = rawResult.duration;

    const result = {
      distance: {
        text: this.formatDistance(distance.value),
        value: distance.value, // in meters
        km: Math.round(distance.value / 1000 * 100) / 100, // in km, rounded to 2 decimals
        miles: Math.round(distance.value * 0.000621371 * 100) / 100 // in miles
      },
      duration: {
        text: this.formatDuration(duration.value),
        value: duration.value, // in seconds
        minutes: Math.round(duration.value / 60), // in minutes
        hours: Math.round(duration.value / 3600 * 100) / 100 // in hours
      },
      // Traffic-aware data
      trafficData: {
        hasTrafficData: includeTraffic && rawResult.durationInTraffic,
        normalDuration: normalDuration ? {
          text: this.formatDuration(normalDuration.value),
          value: normalDuration.value,
          minutes: Math.round(normalDuration.value / 60)
        } : null,
        trafficDelay: includeTraffic && rawResult.durationInTraffic ? 
          duration.value - (normalDuration?.value || duration.value) : 0,
        trafficCondition: this.getTrafficCondition(duration.value, normalDuration?.value)
      },
      // Additional calculated fields
      averageSpeed: {
        kmh: Math.round((distance.value / 1000) / (duration.value / 3600) * 10) / 10,
        mph: Math.round((distance.value * 0.000621371) / (duration.value / 3600) * 10) / 10
      },
      eta: this.calculateETA(duration.value),
      timestamp: new Date().toISOString(),
      raw: rawResult
    };

    return result;
  }

  /**
   * Build avoidance string for Google Maps API
   * @param {boolean} avoidTolls - Avoid toll roads
   * @param {boolean} avoidHighways - Avoid highways
   * @returns {string} Avoidance string
   */
  buildAvoidanceString(avoidTolls, avoidHighways) {
    const avoidances = [];
    if (avoidTolls) avoidances.push('tolls');
    if (avoidHighways) avoidances.push('highways');
    return avoidances.join('|');
  }

  /**
   * Check if error is non-retryable
   * @param {Error} error - Error to check
   * @returns {boolean} True if error should not be retried
   */
  isNonRetryableError(error) {
    const nonRetryableMessages = [
      'API_KEY_ERROR',
      'REQUEST_DENIED',
      'INVALID_REQUEST',
      'ZERO_RESULTS',
      'NOT_FOUND'
    ];
    
    return nonRetryableMessages.some(msg => 
      error.message.includes(msg) || error.code === msg
    );
  }

  /**
   * Get traffic condition based on duration comparison
   * @param {number} currentDuration - Current duration with traffic
   * @param {number} normalDuration - Normal duration without traffic
   * @returns {string} Traffic condition
   */
  getTrafficCondition(currentDuration, normalDuration) {
    if (!normalDuration) return 'unknown';
    
    const ratio = currentDuration / normalDuration;
    
    if (ratio <= 1.1) return 'light';
    if (ratio <= 1.3) return 'moderate';
    if (ratio <= 1.6) return 'heavy';
    return 'severe';
  }

  /**
   * Get cached result if available and not expired
   * @param {string} cacheKey - Cache key
   * @returns {Object|null} Cached result or null
   */
  getCachedResult(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cached result
   * @param {string} cacheKey - Cache key
   * @param {Object} data - Data to cache
   */
  setCachedResult(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    // Clean up old cache entries
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get fare calculation with distance and time
   * @param {string} pickup - Pickup location address
   * @param {string} destination - Destination location address
   * @returns {Promise<Object>} Fare and distance/time data
   */
  async getFareWithDistanceTime(pickup, destination) {
    if (!pickup || !destination) {
      throw new Error('Pickup and destination locations are required');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/rides/get-fare`, {
        params: { pickup, destination }
      });

      if (response.data && response.data.fare && response.data.distanceTime) {
        const { fare, distanceTime } = response.data;
        
        return {
          fare,
          distance: {
            text: distanceTime.distance.text,
            value: distanceTime.distance.value,
            km: Math.round(distanceTime.distance.value / 1000 * 10) / 10
          },
          duration: {
            text: distanceTime.duration.text,
            value: distanceTime.duration.value,
            minutes: Math.round(distanceTime.duration.value / 60)
          },
          raw: distanceTime
        };
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching fare with distance/time:', error);
      
      // Return fallback values if API fails
      const fallback = this.getFallbackDistanceTime();
      return {
        fare: { auto: 200, car: 300, bike: 150 }, // Fallback fares
        ...fallback
      };
    }
  }

  /**
   * Enhanced location suggestions with debouncing, prioritization, and auto-fill
   * @param {string} input - User input for location
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of enhanced location suggestions
   */
  async getLocationSuggestions(input, options = {}) {
    if (!input || input.length < 3) {
      return [];
    }

    const {
      userLocation = null,
      radius = 50000, // 50km radius for nearby prioritization
      types = ['establishment', 'geocode'], // Place types to include
      strictBounds = false,
      sessionToken = null,
      maxResults = 10,
      includeDetails = true
    } = options;

    // Use debounced search
    return this.debouncedLocationSearch(input, {
      userLocation,
      radius,
      types,
      strictBounds,
      sessionToken,
      maxResults,
      includeDetails
    });
  }

  /**
   * Debounced location search to prevent excessive API calls
   * @param {string} input - Search input
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async debouncedLocationSearch(input, options = {}) {
    // Clear existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Return cached results if available
    const cacheKey = `suggestions:${input}:${JSON.stringify(options)}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      return cached;
    }

    // Create debounced promise
    return new Promise((resolve, reject) => {
      this.searchTimeout = setTimeout(async () => {
        try {
          const results = await this.performLocationSearch(input, options);
          this.setCachedResult(cacheKey, results);
          resolve(results);
        } catch (error) {
          reject(error);
        }
      }, 500); // 500ms delay as specified in requirements
    });
  }

  /**
   * Perform the actual location search with prioritization
   * @param {string} input - Search input
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async performLocationSearch(input, options = {}) {
    const {
      userLocation,
      radius,
      types,
      strictBounds,
      sessionToken,
      maxResults,
      includeDetails
    } = options;

    const envConfig = getEnvironmentConfig();
    let suggestions = [];

    try {
      // Try direct Google Maps API first
      if (envConfig.enableDirectApiCalls !== false) {
        try {
          const searchOptions = {
            types: types.join('|'),
            sessiontoken: sessionToken,
            strictbounds: strictBounds
          };

          // Add location bias for nearby prioritization
          if (userLocation) {
            searchOptions.location = `${userLocation.latitude},${userLocation.longitude}`;
            searchOptions.radius = radius;
          }

          const rawSuggestions = await googleMapsApiService.getPlaceAutocomplete(input, searchOptions);
          suggestions = await this.enhanceSuggestions(rawSuggestions, userLocation, includeDetails);
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to backend:', directApiError.message);
        }
      }

      // Fallback to backend API if direct call failed
      if (suggestions.length === 0) {
        suggestions = await this.getLocationSuggestionsFromBackend(input, options);
      }

      // Apply prioritization and filtering
      const prioritizedSuggestions = this.prioritizeSuggestions(suggestions, userLocation);
      
      // Limit results
      return prioritizedSuggestions.slice(0, maxResults);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      return [];
    }
  }

  /**
   * Get location suggestions from backend API
   * @param {string} input - Search input
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Backend suggestions
   */
  async getLocationSuggestionsFromBackend(input, options = {}) {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/map/get-suggestions`, {
      params: { 
        input,
        ...options
      },
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 10000
    });

    const rawSuggestions = response.data || [];
    
    // Convert backend format to enhanced format
    return rawSuggestions.map(suggestion => ({
      placeId: suggestion.place_id || null,
      description: suggestion.description || suggestion,
      mainText: suggestion.main_text || suggestion,
      secondaryText: suggestion.secondary_text || '',
      types: suggestion.types || ['geocode'],
      distance: null,
      rating: null,
      priceLevel: null,
      isOpen: null
    }));
  }

  /**
   * Enhance suggestions with additional details
   * @param {Array} rawSuggestions - Raw suggestions from API
   * @param {Object} userLocation - User's current location
   * @param {boolean} includeDetails - Whether to include place details
   * @returns {Promise<Array>} Enhanced suggestions
   */
  async enhanceSuggestions(rawSuggestions, userLocation, includeDetails = true) {
    const enhanced = [];

    for (const suggestion of rawSuggestions) {
      const enhancedSuggestion = {
        placeId: suggestion.placeId,
        description: suggestion.description,
        mainText: suggestion.mainText || suggestion.description,
        secondaryText: suggestion.secondaryText || '',
        types: suggestion.types || [],
        distance: null,
        rating: null,
        priceLevel: null,
        isOpen: null,
        coordinates: null
      };

      // Calculate distance if user location is available
      if (userLocation && suggestion.placeId && includeDetails) {
        try {
          const placeDetails = await this.getPlaceDetails(suggestion.placeId);
          if (placeDetails && placeDetails.geometry) {
            enhancedSuggestion.coordinates = {
              latitude: placeDetails.geometry.location.lat,
              longitude: placeDetails.geometry.location.lng
            };
            
            enhancedSuggestion.distance = this.calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              placeDetails.geometry.location.lat,
              placeDetails.geometry.location.lng
            );

            // Add additional place details
            enhancedSuggestion.rating = placeDetails.rating || null;
            enhancedSuggestion.priceLevel = placeDetails.price_level || null;
            enhancedSuggestion.isOpen = placeDetails.opening_hours?.open_now || null;
          }
        } catch (error) {
          // Continue without details if place details fetch fails
          console.warn('Failed to fetch place details for:', suggestion.placeId);
        }
      }

      enhanced.push(enhancedSuggestion);
    }

    return enhanced;
  }

  /**
   * Prioritize suggestions based on proximity and relevance
   * @param {Array} suggestions - Array of suggestions
   * @param {Object} userLocation - User's current location
   * @returns {Array} Prioritized suggestions
   */
  prioritizeSuggestions(suggestions, userLocation) {
    if (!userLocation) {
      return suggestions;
    }

    // Sort by distance and relevance
    return suggestions.sort((a, b) => {
      // Prioritize places with coordinates and distance
      if (a.distance !== null && b.distance === null) return -1;
      if (a.distance === null && b.distance !== null) return 1;
      
      // If both have distances, sort by distance
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }

      // Prioritize by place type relevance
      const typeScoreA = this.getTypeRelevanceScore(a.types);
      const typeScoreB = this.getTypeRelevanceScore(b.types);
      
      if (typeScoreA !== typeScoreB) {
        return typeScoreB - typeScoreA; // Higher score first
      }

      // Prioritize by rating if available
      if (a.rating && b.rating) {
        return b.rating - a.rating;
      }

      // Default to original order
      return 0;
    });
  }

  /**
   * Get relevance score for place types
   * @param {Array} types - Place types
   * @returns {number} Relevance score
   */
  getTypeRelevanceScore(types) {
    const typeScores = {
      'establishment': 10,
      'point_of_interest': 9,
      'store': 8,
      'restaurant': 8,
      'hospital': 7,
      'school': 7,
      'transit_station': 6,
      'locality': 5,
      'sublocality': 4,
      'route': 3,
      'street_address': 2,
      'geocode': 1
    };

    let maxScore = 0;
    for (const type of types) {
      const score = typeScores[type] || 0;
      if (score > maxScore) {
        maxScore = score;
      }
    }

    return maxScore;
  }

  /**
   * Get detailed place information
   * @param {string} placeId - Google Places ID
   * @returns {Promise<Object>} Place details
   */
  async getPlaceDetails(placeId) {
    if (!placeId) {
      throw new Error('Place ID is required');
    }

    const cacheKey = `place_details:${placeId}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const details = await googleMapsApiService.getPlaceDetails(placeId);
      this.setCachedResult(cacheKey, details);
      return details;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }

  /**
   * Auto-fill location from suggestion
   * @param {Object} suggestion - Selected suggestion
   * @returns {Promise<Object>} Complete location data
   */
  async autoFillLocation(suggestion) {
    if (!suggestion) {
      throw new Error('Suggestion is required');
    }

    try {
      let locationData = {
        address: suggestion.description,
        mainText: suggestion.mainText,
        secondaryText: suggestion.secondaryText,
        placeId: suggestion.placeId,
        types: suggestion.types,
        coordinates: suggestion.coordinates
      };

      // Get coordinates if not already available
      if (!locationData.coordinates && suggestion.placeId) {
        const placeDetails = await this.getPlaceDetails(suggestion.placeId);
        if (placeDetails && placeDetails.geometry) {
          locationData.coordinates = {
            latitude: placeDetails.geometry.location.lat,
            longitude: placeDetails.geometry.location.lng
          };
          
          // Add additional details
          locationData.formattedAddress = placeDetails.formatted_address;
          locationData.rating = placeDetails.rating;
          locationData.priceLevel = placeDetails.price_level;
          locationData.isOpen = placeDetails.opening_hours?.open_now;
        }
      }

      // Fallback to geocoding if place details not available
      if (!locationData.coordinates) {
        const geocoded = await this.getCoordinates(suggestion.description);
        locationData.coordinates = {
          latitude: geocoded.latitude,
          longitude: geocoded.longitude
        };
        locationData.formattedAddress = geocoded.formattedAddress;
      }

      return locationData;
    } catch (error) {
      console.error('Error auto-filling location:', error);
      
      // Return basic data even if enhancement fails
      return {
        address: suggestion.description,
        mainText: suggestion.mainText,
        secondaryText: suggestion.secondaryText,
        placeId: suggestion.placeId,
        types: suggestion.types,
        coordinates: null
      };
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {number} lat1 - Latitude 1
   * @param {number} lon1 - Longitude 1
   * @param {number} lat2 - Latitude 2
   * @param {number} lon2 - Longitude 2
   * @returns {number} Distance in meters
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get coordinates for an address
   * @param {string} address - Address to geocode
   * @returns {Promise<Object>} Latitude and longitude
   */
  async getCoordinates(address) {
    if (!address) {
      throw new Error('Address is required');
    }

    const envConfig = getEnvironmentConfig();

    try {
      // Try direct Google Maps API first (with rate limiting and error handling)
      if (envConfig.enableDirectApiCalls !== false) {
        try {
          const result = await googleMapsApiService.geocodeAddress(address);
          return {
            latitude: result.latitude,
            longitude: result.longitude,
            formattedAddress: result.formattedAddress
          };
        } catch (directApiError) {
          console.warn('Direct API call failed, falling back to backend:', directApiError.message);
        }
      }

      // Fallback to backend API
      const response = await axios.get(`${API_BASE_URL}/map/get-coordinates`, {
        params: { address }
      });

      if (response.data && response.data.ltd && response.data.lng) {
        return {
          latitude: response.data.ltd,
          longitude: response.data.lng
        };
      }

      throw new Error('Invalid coordinates response');
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      
      // Return Colombo coordinates as fallback
      return {
        latitude: 6.9271,
        longitude: 79.8612
      };
    }
  }

  /**
   * Enhanced distance formatting with multiple units and precision options
   * @param {number} distanceInMeters - Distance in meters
   * @param {Object} options - Formatting options
   * @returns {string} Formatted distance string
   */
  formatDistance(distanceInMeters, options = {}) {
    const {
      unit = 'auto', // 'auto', 'metric', 'imperial'
      precision = 'auto', // 'auto', 'low', 'medium', 'high'
      showUnit = true
    } = options;

    if (typeof distanceInMeters !== 'number' || distanceInMeters < 0) {
      return showUnit ? '0 m' : '0';
    }

    // Auto-detect best unit and precision
    if (unit === 'auto' || unit === 'metric') {
      if (distanceInMeters < 1000) {
        const rounded = precision === 'high' ? Math.round(distanceInMeters) : 
                       precision === 'medium' ? Math.round(distanceInMeters / 10) * 10 :
                       Math.round(distanceInMeters / 50) * 50;
        return showUnit ? `${rounded} m` : rounded.toString();
      }
      
      const km = distanceInMeters / 1000;
      let formattedKm;
      
      if (precision === 'high') {
        formattedKm = Math.round(km * 100) / 100;
      } else if (precision === 'medium' || (precision === 'auto' && km < 10)) {
        formattedKm = Math.round(km * 10) / 10;
      } else {
        formattedKm = Math.round(km);
      }
      
      return showUnit ? `${formattedKm} km` : formattedKm.toString();
    }

    // Imperial units
    if (unit === 'imperial') {
      const feet = distanceInMeters * 3.28084;
      if (feet < 5280) {
        const rounded = precision === 'high' ? Math.round(feet) :
                       precision === 'medium' ? Math.round(feet / 10) * 10 :
                       Math.round(feet / 100) * 100;
        return showUnit ? `${rounded} ft` : rounded.toString();
      }
      
      const miles = feet / 5280;
      let formattedMiles;
      
      if (precision === 'high') {
        formattedMiles = Math.round(miles * 100) / 100;
      } else if (precision === 'medium' || (precision === 'auto' && miles < 10)) {
        formattedMiles = Math.round(miles * 10) / 10;
      } else {
        formattedMiles = Math.round(miles);
      }
      
      return showUnit ? `${formattedMiles} mi` : formattedMiles.toString();
    }

    return showUnit ? `${Math.round(distanceInMeters / 1000)} km` : Math.round(distanceInMeters / 1000).toString();
  }

  /**
   * Enhanced duration formatting with multiple formats and precision
   * @param {number} durationInSeconds - Duration in seconds
   * @param {Object} options - Formatting options
   * @returns {string} Formatted duration string
   */
  formatDuration(durationInSeconds, options = {}) {
    const {
      format = 'auto', // 'auto', 'short', 'long', 'precise'
      showSeconds = false,
      maxUnit = 'hours' // 'minutes', 'hours', 'days'
    } = options;

    if (typeof durationInSeconds !== 'number' || durationInSeconds < 0) {
      return format === 'long' ? '0 minutes' : '0 min';
    }

    const totalSeconds = Math.round(durationInSeconds);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Handle different formats
    if (format === 'precise' || showSeconds) {
      const parts = [];
      if (days > 0 && maxUnit !== 'hours' && maxUnit !== 'minutes') {
        parts.push(`${days}d`);
      }
      if (hours > 0 && maxUnit !== 'minutes') {
        parts.push(`${hours}h`);
      }
      if (minutes > 0 || (parts.length === 0 && seconds === 0)) {
        parts.push(`${minutes}m`);
      }
      if (showSeconds && (seconds > 0 || parts.length === 0)) {
        parts.push(`${seconds}s`);
      }
      return parts.join(' ');
    }

    if (format === 'long') {
      const parts = [];
      if (days > 0 && maxUnit !== 'hours' && maxUnit !== 'minutes') {
        parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
      }
      if (hours > 0 && maxUnit !== 'minutes') {
        parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
      }
      if (minutes > 0 || parts.length === 0) {
        parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
      }
      return parts.join(', ');
    }

    // Auto and short formats
    if (totalSeconds < 60) {
      return format === 'short' ? '<1 min' : 'Less than 1 minute';
    }

    if (totalSeconds < 3600) { // Less than 1 hour
      return format === 'short' ? `${minutes} min` : `${minutes} minutes`;
    }

    if (totalSeconds < 86400) { // Less than 1 day
      if (minutes === 0) {
        return format === 'short' ? `${hours} hr` : `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      }
      return format === 'short' ? `${hours}h ${minutes}m` : `${hours} hr ${minutes} min`;
    }

    // 1 day or more
    if (maxUnit === 'hours' || maxUnit === 'minutes') {
      const totalHours = Math.round(totalSeconds / 3600);
      return format === 'short' ? `${totalHours} hr` : `${totalHours} hours`;
    }

    if (hours === 0 && minutes === 0) {
      return format === 'short' ? `${days} day${days !== 1 ? 's' : ''}` : 
             `${days} ${days === 1 ? 'day' : 'days'}`;
    }

    return format === 'short' ? `${days}d ${hours}h` : 
           `${days} ${days === 1 ? 'day' : 'days'} ${hours} hr`;
  }

  /**
   * Format duration with traffic condition indicator
   * @param {number} durationInSeconds - Duration in seconds
   * @param {string} trafficCondition - Traffic condition
   * @returns {string} Formatted duration with traffic indicator
   */
  formatDurationWithTraffic(durationInSeconds, trafficCondition = 'unknown') {
    const baseDuration = this.formatDuration(durationInSeconds);
    
    const trafficIndicators = {
      light: '🟢',
      moderate: '🟡',
      heavy: '🟠',
      severe: '🔴',
      unknown: ''
    };

    const indicator = trafficIndicators[trafficCondition] || '';
    return indicator ? `${baseDuration} ${indicator}` : baseDuration;
  }

  /**
   * Get detailed distance breakdown
   * @param {number} distanceInMeters - Distance in meters
   * @returns {Object} Distance breakdown in multiple units
   */
  getDistanceBreakdown(distanceInMeters) {
    return {
      meters: Math.round(distanceInMeters),
      kilometers: Math.round(distanceInMeters / 1000 * 100) / 100,
      feet: Math.round(distanceInMeters * 3.28084),
      miles: Math.round(distanceInMeters * 0.000621371 * 100) / 100,
      formatted: {
        metric: this.formatDistance(distanceInMeters, { unit: 'metric' }),
        imperial: this.formatDistance(distanceInMeters, { unit: 'imperial' }),
        short: this.formatDistance(distanceInMeters, { precision: 'low' }),
        precise: this.formatDistance(distanceInMeters, { precision: 'high' })
      }
    };
  }

  /**
   * Get detailed duration breakdown
   * @param {number} durationInSeconds - Duration in seconds
   * @returns {Object} Duration breakdown in multiple formats
   */
  getDurationBreakdown(durationInSeconds) {
    const totalSeconds = Math.round(durationInSeconds);
    
    return {
      seconds: totalSeconds,
      minutes: Math.round(totalSeconds / 60 * 100) / 100,
      hours: Math.round(totalSeconds / 3600 * 100) / 100,
      days: Math.round(totalSeconds / 86400 * 100) / 100,
      breakdown: {
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60
      },
      formatted: {
        short: this.formatDuration(durationInSeconds, { format: 'short' }),
        long: this.formatDuration(durationInSeconds, { format: 'long' }),
        precise: this.formatDuration(durationInSeconds, { format: 'precise', showSeconds: true }),
        auto: this.formatDuration(durationInSeconds)
      }
    };
  }

  /**
   * Get fallback distance and time values
   * @returns {Object} Fallback distance and duration data
   */
  getFallbackDistanceTime() {
    return {
      distance: {
        text: '5.0 km',
        value: 5000, // 5km in meters
        km: 5.0
      },
      duration: {
        text: '15 mins',
        value: 900, // 15 minutes in seconds
        minutes: 15
      }
    };
  }

  /**
   * Calculate estimated arrival time
   * @param {number} durationInSeconds - Duration in seconds
   * @returns {string} Formatted ETA
   */
  calculateETA(durationInSeconds) {
    const now = new Date();
    const eta = new Date(now.getTime() + (durationInSeconds * 1000));
    
    return eta.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Get travel mode recommendations based on distance
   * @param {number} distanceInMeters - Distance in meters
   * @returns {Object} Recommended travel modes
   */
  getTravelModeRecommendations(distanceInMeters) {
    const km = distanceInMeters / 1000;
    
    return {
      bike: {
        recommended: km <= 10,
        reason: km <= 5 ? 'Perfect for short distances' : km <= 10 ? 'Good for medium distances' : 'Long distance - consider other options'
      },
      auto: {
        recommended: km >= 2 && km <= 15,
        reason: km < 2 ? 'Too short - consider walking' : km <= 15 ? 'Ideal distance for auto' : 'Long distance - car recommended'
      },
      car: {
        recommended: km >= 5,
        reason: km < 5 ? 'Short distance - auto or bike better' : 'Comfortable for longer distances'
      }
    };
  }
}

// Create and export a singleton instance
const mapService = new MapService();
export default mapService;