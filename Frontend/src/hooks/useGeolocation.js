import { useState, useEffect, useCallback, useRef } from 'react';
import googleMapsApiService from '../services/googleMapsApi.js';

/**
 * Custom hook for handling geolocation with real-time GPS tracking, accuracy validation, and caching
 */
export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'granted', 'denied', 'prompt'
  const [isWatching, setIsWatching] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Refs for managing watch and retry logic
  const watchIdRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const lastGoodLocationRef = useRef(null);

  // Default options with enhanced settings for real-time tracking
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 15000, // 15 seconds for better accuracy
    maximumAge: 60000, // 1 minute for real-time updates
    desiredAccuracy: 50, // 50 meters desired accuracy
    maxRetries: 3, // Maximum retry attempts
    retryDelay: 2000, // 2 seconds between retries
    staleThreshold: 300000, // 5 minutes staleness threshold
    watchOptions: {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000 // 30 seconds for continuous tracking
    },
    fallbackLocation: {
      latitude: 6.9271, // Colombo, Sri Lanka
      longitude: 79.8612
    },
    enableCaching: true,
    cacheKey: 'geolocation_cache',
    ...options
  };

  // Check if geolocation is supported
  const isSupported = 'geolocation' in navigator;

  // Location caching utilities
  const saveLocationToCache = useCallback((locationData) => {
    if (!defaultOptions.enableCaching) return;
    
    try {
      const cacheData = {
        ...locationData,
        cachedAt: Date.now()
      };
      localStorage.setItem(defaultOptions.cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('⚠️ Failed to cache location:', error);
    }
  }, [defaultOptions.enableCaching, defaultOptions.cacheKey]);

  const getLocationFromCache = useCallback(() => {
    if (!defaultOptions.enableCaching) return null;
    
    try {
      const cached = localStorage.getItem(defaultOptions.cacheKey);
      if (cached) {
        const cacheData = JSON.parse(cached);
        const age = Date.now() - cacheData.cachedAt;
        
        // Return cached location if it's not too old
        if (age < defaultOptions.staleThreshold) {
          return {
            ...cacheData,
            isCached: true
          };
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to retrieve cached location:', error);
    }
    
    return null;
  }, [defaultOptions.enableCaching, defaultOptions.cacheKey, defaultOptions.staleThreshold]);

  // Location accuracy validation
  const isLocationAccurate = useCallback((accuracy) => {
    return accuracy && accuracy <= defaultOptions.desiredAccuracy;
  }, [defaultOptions.desiredAccuracy]);

  // Location staleness detection
  const isLocationStale = useCallback((timestamp) => {
    if (!timestamp) return true;
    return Date.now() - timestamp > defaultOptions.staleThreshold;
  }, [defaultOptions.staleThreshold]);

  // Retry logic with exponential backoff
  const scheduleRetry = useCallback((callback, attempt = 0) => {
    if (attempt >= defaultOptions.maxRetries) {
      console.warn('⚠️ Max retries reached for location request');
      return;
    }

    const delay = defaultOptions.retryDelay * Math.pow(2, attempt);
    
    retryTimeoutRef.current = setTimeout(() => {
      console.log(`🔄 Retrying location request (attempt ${attempt + 1}/${defaultOptions.maxRetries})`);
      setRetryCount(attempt + 1);
      callback();
    }, delay);
  }, [defaultOptions.maxRetries, defaultOptions.retryDelay]);

  // Get current position with accuracy validation and retry logic
  const getCurrentPosition = useCallback((attempt = 0) => {
    if (!isSupported) {
      setError({
        code: 'NOT_SUPPORTED',
        message: 'Geolocation is not supported by this browser'
      });
      return;
    }

    // Try cached location first if available
    if (attempt === 0) {
      const cachedLocation = getLocationFromCache();
      if (cachedLocation && !isLocationStale(cachedLocation.timestamp)) {
        console.log('📍 Using cached location:', cachedLocation);
        setLocation(cachedLocation);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        console.log('✅ Location obtained:', {
          lat: locationData.latitude,
          lng: locationData.longitude,
          accuracy: locationData.accuracy,
          attempt: attempt + 1
        });

        // Validate location accuracy
        if (!isLocationAccurate(locationData.accuracy) && attempt < defaultOptions.maxRetries - 1) {
          console.warn(`⚠️ Location accuracy (${locationData.accuracy}m) exceeds desired accuracy (${defaultOptions.desiredAccuracy}m). Retrying...`);
          scheduleRetry(() => getCurrentPosition(attempt + 1), attempt);
          return;
        }

        // Store as last good location
        lastGoodLocationRef.current = locationData;
        
        // Cache the location
        saveLocationToCache(locationData);
        
        setLocation(locationData);
        setPermissionStatus('granted');
        setLoading(false);
        setRetryCount(0);
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
        
        let errorInfo = {
          code: error.code,
          message: error.message
        };

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorInfo = {
              code: 'PERMISSION_DENIED',
              message: 'Location access denied by user. Please enable location permissions in your browser settings.'
            };
            setPermissionStatus('denied');
            setLoading(false);
            setError(errorInfo);
            return;
          case error.POSITION_UNAVAILABLE:
            errorInfo = {
              code: 'POSITION_UNAVAILABLE',
              message: 'Location information is unavailable. Please check your GPS or internet connection.'
            };
            break;
          case error.TIMEOUT:
            errorInfo = {
              code: 'TIMEOUT',
              message: 'Location request timed out. Please try again.'
            };
            break;
          default:
            errorInfo = {
              code: 'UNKNOWN_ERROR',
              message: 'An unknown error occurred while retrieving location.'
            };
        }

        // Retry logic for recoverable errors
        if (attempt < defaultOptions.maxRetries - 1 && 
            (error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT)) {
          console.log(`🔄 Retrying location request due to ${errorInfo.code}`);
          scheduleRetry(() => getCurrentPosition(attempt + 1), attempt);
          return;
        }

        setError(errorInfo);
        
        // Use last good location if available
        if (lastGoodLocationRef.current) {
          console.log('🔄 Using last good location:', lastGoodLocationRef.current);
          setLocation({
            ...lastGoodLocationRef.current,
            isStale: true
          });
        } else if (defaultOptions.fallbackLocation) {
          console.log('🔄 Using fallback location:', defaultOptions.fallbackLocation);
          setLocation({
            latitude: defaultOptions.fallbackLocation.latitude,
            longitude: defaultOptions.fallbackLocation.longitude,
            accuracy: null,
            timestamp: Date.now(),
            isFallback: true
          });
        }
        
        setLoading(false);
      },
      {
        enableHighAccuracy: defaultOptions.enableHighAccuracy,
        timeout: defaultOptions.timeout,
        maximumAge: defaultOptions.maximumAge
      }
    );
  }, [isSupported, defaultOptions, getLocationFromCache, isLocationStale, isLocationAccurate, saveLocationToCache, scheduleRetry]);

  // Enhanced watch position for continuous real-time tracking
  const startWatching = useCallback(() => {
    if (!isSupported) {
      setError({
        code: 'NOT_SUPPORTED',
        message: 'Geolocation is not supported by this browser'
      });
      return null;
    }

    if (watchIdRef.current) {
      console.log('📍 Location watching already active');
      return watchIdRef.current;
    }

    console.log('🎯 Starting continuous location tracking...');
    setIsWatching(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          isLive: true
        };

        console.log('📍 Live location update:', {
          lat: locationData.latitude,
          lng: locationData.longitude,
          accuracy: locationData.accuracy,
          speed: locationData.speed
        });

        // Enhanced accuracy validation for continuous tracking
        const isAccurate = isLocationAccurate(locationData.accuracy);
        const hasImprovedAccuracy = !lastGoodLocationRef.current || 
          locationData.accuracy < lastGoodLocationRef.current.accuracy;

        // Only update if accuracy is acceptable or has improved
        if (isAccurate || hasImprovedAccuracy) {
          // Store as last good location
          lastGoodLocationRef.current = locationData;
          
          // Cache the location
          saveLocationToCache(locationData);
          
          setLocation(locationData);
          setPermissionStatus('granted');
          setError(null);
        } else {
          console.warn(`⚠️ Location accuracy (${locationData.accuracy}m) not sufficient for update. Keeping previous location.`);
          
          // Update timestamp but keep previous coordinates
          if (lastGoodLocationRef.current) {
            setLocation({
              ...lastGoodLocationRef.current,
              timestamp: locationData.timestamp,
              isStale: false,
              accuracyWarning: true
            });
          }
        }
      },
      (error) => {
        console.error('❌ Watch position error:', error);
        
        let errorInfo = {
          code: error.code,
          message: error.message
        };

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorInfo = {
              code: 'PERMISSION_DENIED',
              message: 'Location access denied. Please enable location permissions.'
            };
            setPermissionStatus('denied');
            stopWatching();
            break;
          case error.POSITION_UNAVAILABLE:
            errorInfo = {
              code: 'POSITION_UNAVAILABLE',
              message: 'Location temporarily unavailable. Continuing to track...'
            };
            break;
          case error.TIMEOUT:
            errorInfo = {
              code: 'TIMEOUT',
              message: 'Location update timed out. Continuing to track...'
            };
            break;
          default:
            errorInfo = {
              code: 'UNKNOWN_ERROR',
              message: 'Location tracking error. Continuing to track...'
            };
        }

        setError(errorInfo);
        
        // For non-permission errors, continue watching but use last good location
        if (error.code !== error.PERMISSION_DENIED && lastGoodLocationRef.current) {
          setLocation({
            ...lastGoodLocationRef.current,
            isStale: true
          });
        }
      },
      {
        enableHighAccuracy: defaultOptions.watchOptions.enableHighAccuracy,
        timeout: defaultOptions.watchOptions.timeout,
        maximumAge: defaultOptions.watchOptions.maximumAge
      }
    );

    return watchIdRef.current;
  }, [isSupported, defaultOptions.watchOptions, saveLocationToCache, isLocationAccurate]);

  // Stop watching position
  const stopWatching = useCallback(() => {
    if (watchIdRef.current && isSupported) {
      console.log('🛑 Stopping location tracking...');
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsWatching(false);
    }
  }, [isSupported]);

  // Legacy watchPosition for backward compatibility
  const watchPosition = useCallback(() => {
    return startWatching();
  }, [startWatching]);

  // Clear watch
  const clearWatch = useCallback((watchId) => {
    if (watchId && isSupported) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, [isSupported]);

  // Request permission (for browsers that support it)
  const requestPermission = useCallback(async () => {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(permission.state);
        
        permission.addEventListener('change', () => {
          setPermissionStatus(permission.state);
        });
        
        return permission.state;
      } catch (error) {
        console.warn('⚠️ Could not query geolocation permission:', error);
      }
    }
    
    // Fallback: try to get position to trigger permission prompt
    getCurrentPosition();
    return permissionStatus;
  }, [getCurrentPosition, permissionStatus]);

  // Auto-request location on mount
  useEffect(() => {
    if (options.autoRequest !== false) {
      getCurrentPosition();
    }
  }, [getCurrentPosition, options.autoRequest]);

  // Generate map URL
  const getMapUrl = useCallback((customLocation = null) => {
    const loc = customLocation || location;
    
    if (!loc.latitude || !loc.longitude) {
      // Use fallback location for map
      const fallback = defaultOptions.fallbackLocation;
      return `https://www.google.com/maps?q=${fallback.latitude},${fallback.longitude}&output=embed`;
    }
    
    return `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}&output=embed`;
  }, [location, defaultOptions.fallbackLocation]);

  // Get distance between two points (Haversine formula)
  const getDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }, []);

  // Enhanced location refresh mechanism
  const refreshLocation = useCallback(() => {
    console.log('🔄 Refreshing location...');
    if (isWatching) {
      // If watching, just clear error and wait for next update
      setError(null);
    } else {
      // If not watching, get current position
      getCurrentPosition();
    }
  }, [isWatching, getCurrentPosition]);

  // Check if location needs refresh based on staleness
  const needsRefresh = useCallback(() => {
    if (!location.timestamp) return true;
    
    const age = Date.now() - location.timestamp;
    const isStale = age > defaultOptions.staleThreshold;
    const isVeryStale = age > (defaultOptions.staleThreshold * 2);
    
    return {
      isStale,
      isVeryStale,
      ageInMinutes: Math.round(age / 60000),
      shouldRefresh: isVeryStale || (isStale && !isWatching)
    };
  }, [location.timestamp, defaultOptions.staleThreshold, isWatching]);

  // Reverse geocoding - convert coordinates to address
  const [address, setAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState(null);
  const addressCacheRef = useRef(new Map());

  // Address caching utilities
  const getAddressCacheKey = useCallback((lat, lng) => {
    // Round to 4 decimal places for caching (about 11m precision)
    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLng = Math.round(lng * 10000) / 10000;
    return `${roundedLat},${roundedLng}`;
  }, []);

  const getCachedAddress = useCallback((lat, lng) => {
    const cacheKey = getAddressCacheKey(lat, lng);
    const cached = addressCacheRef.current.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
      return cached.address;
    }
    
    return null;
  }, [getAddressCacheKey]);

  const setCachedAddress = useCallback((lat, lng, addressData) => {
    const cacheKey = getAddressCacheKey(lat, lng);
    addressCacheRef.current.set(cacheKey, {
      address: addressData,
      timestamp: Date.now()
    });
    
    // Limit cache size to prevent memory issues
    if (addressCacheRef.current.size > 50) {
      const firstKey = addressCacheRef.current.keys().next().value;
      addressCacheRef.current.delete(firstKey);
    }
  }, [getAddressCacheKey]);

  // Convert coordinates to address using Google Maps Geocoding API
  const reverseGeocode = useCallback(async (lat, lng, options = {}) => {
    if (!lat || !lng) {
      throw new Error('Latitude and longitude are required');
    }

    // Check cache first
    const cached = getCachedAddress(lat, lng);
    if (cached && !options.forceRefresh) {
      console.log('📍 Using cached address:', cached);
      return cached;
    }

    setAddressLoading(true);
    setAddressError(null);

    try {
      // Use the existing Google Maps API service for reverse geocoding
      const result = await googleMapsApiService.geocodeCoordinates(lat, lng);
      
      const addressData = {
        formattedAddress: result.formattedAddress,
        components: result.components || {},
        placeId: result.placeId,
        types: result.types || [],
        timestamp: Date.now()
      };

      // Cache the result
      setCachedAddress(lat, lng, addressData);
      
      console.log('✅ Address obtained:', addressData.formattedAddress);
      setAddress(addressData);
      setAddressLoading(false);
      
      return addressData;
    } catch (error) {
      console.error('❌ Reverse geocoding error:', error);
      
      const errorInfo = {
        code: error.code || 'GEOCODING_ERROR',
        message: error.message || 'Failed to get address for location'
      };
      
      setAddressError(errorInfo);
      setAddressLoading(false);
      
      // Return a fallback address
      const fallbackAddress = {
        formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        components: {},
        placeId: null,
        types: ['coordinate'],
        isFallback: true,
        timestamp: Date.now()
      };
      
      setAddress(fallbackAddress);
      return fallbackAddress;
    }
  }, [getCachedAddress, setCachedAddress]);

  // Auto-convert location to address when coordinates change
  useEffect(() => {
    if (location.latitude && location.longitude && !location.isFallback) {
      const shouldGetAddress = !address || 
        Math.abs(address.latitude - location.latitude) > 0.0001 || 
        Math.abs(address.longitude - location.longitude) > 0.0001;
      
      if (shouldGetAddress) {
        reverseGeocode(location.latitude, location.longitude).catch(error => {
          console.warn('Auto-reverse geocoding failed:', error);
        });
      }
    }
  }, [location.latitude, location.longitude, location.isFallback, address, reverseGeocode]);

  // Format address for display
  const formatAddress = useCallback((addressData, options = {}) => {
    if (!addressData) return null;
    
    const { short = false, includeCoordinates = false } = options;
    
    if (addressData.isFallback || !addressData.formattedAddress) {
      return includeCoordinates ? 
        `${addressData.formattedAddress}` : 
        'Location coordinates';
    }
    
    if (short && addressData.components) {
      // Try to create a short version using components
      const components = addressData.components;
      const shortParts = [];
      
      if (components.street_number && components.route) {
        shortParts.push(`${components.street_number} ${components.route}`);
      } else if (components.route) {
        shortParts.push(components.route);
      }
      
      if (components.locality) {
        shortParts.push(components.locality);
      } else if (components.administrative_area_level_2) {
        shortParts.push(components.administrative_area_level_2);
      }
      
      if (shortParts.length > 0) {
        return shortParts.join(', ');
      }
    }
    
    return addressData.formattedAddress;
  }, []);

  // Auto-refresh stale location
  useEffect(() => {
    if (!location.timestamp) return;
    
    const refreshCheck = needsRefresh();
    if (refreshCheck.shouldRefresh && !loading) {
      console.log(`🔄 Auto-refreshing stale location (${refreshCheck.ageInMinutes} minutes old)`);
      refreshLocation();
    }
  }, [location.timestamp, needsRefresh, refreshLocation, loading]);

  return {
    location,
    error,
    loading,
    permissionStatus,
    isSupported,
    isWatching,
    retryCount,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    requestPermission,
    getMapUrl,
    getDistance,
    startWatching,
    stopWatching,
    refreshLocation,
    // Address-related functionality
    address,
    addressLoading,
    addressError,
    reverseGeocode,
    formatAddress,
    // Enhanced utility functions
    hasLocation: !!(location.latitude && location.longitude),
    hasAddress: !!(address && address.formattedAddress),
    isLocationStale: location.timestamp && (Date.now() - location.timestamp > defaultOptions.maximumAge),
    isLocationAccurate: location.accuracy ? isLocationAccurate(location.accuracy) : false,
    locationAge: location.timestamp ? Math.round((Date.now() - location.timestamp) / 60000) : null,
    needsRefresh: needsRefresh(),
    coordinates: location.latitude && location.longitude ? [location.longitude, location.latitude] : null,
    // Cache utilities
    clearLocationCache: () => {
      try {
        localStorage.removeItem(defaultOptions.cacheKey);
        console.log('🗑️ Location cache cleared');
      } catch (error) {
        console.warn('⚠️ Failed to clear location cache:', error);
      }
    },
    clearAddressCache: () => {
      addressCacheRef.current.clear();
      console.log('🗑️ Address cache cleared');
    }
  };
};

export default useGeolocation;