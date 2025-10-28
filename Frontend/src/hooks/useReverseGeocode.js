/**
 * Reverse Geocoding Hook
 * Converts GPS coordinates to readable address
 */

import { useState, useEffect, useCallback } from 'react';

const useReverseGeocode = () => {
  const [addressCache, setAddressCache] = useState(new Map());
  const [loading, setLoading] = useState(false);

  // Free reverse geocoding using Nominatim (OpenStreetMap)
  const reverseGeocode = useCallback(async (latitude, longitude) => {
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    
    // Check cache first
    if (addressCache.has(cacheKey)) {
      return addressCache.get(cacheKey);
    }

    try {
      setLoading(true);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RideApp/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();
      
      let address = 'Unknown Location';
      
      if (data && data.address) {
        // Build a readable address from components
        const components = [];
        
        // Add house number and road
        if (data.address.house_number && data.address.road) {
          components.push(`${data.address.house_number} ${data.address.road}`);
        } else if (data.address.road) {
          components.push(data.address.road);
        }
        
        // Add neighborhood or suburb
        if (data.address.neighbourhood) {
          components.push(data.address.neighbourhood);
        } else if (data.address.suburb) {
          components.push(data.address.suburb);
        }
        
        // Add city or town
        if (data.address.city) {
          components.push(data.address.city);
        } else if (data.address.town) {
          components.push(data.address.town);
        } else if (data.address.village) {
          components.push(data.address.village);
        }
        
        // Join components with commas
        if (components.length > 0) {
          address = components.join(', ');
        } else if (data.display_name) {
          // Fallback to display name but make it shorter
          const parts = data.display_name.split(',');
          address = parts.slice(0, 3).join(', ');
        }
      }
      
      // Cache the result
      setAddressCache(prev => new Map(prev.set(cacheKey, address)));
      
      return address;
      
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      
      // Return a fallback based on coordinates
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      // Simple region detection for Sri Lanka (you can expand this)
      if (lat >= 5.9 && lat <= 9.9 && lng >= 79.5 && lng <= 81.9) {
        if (lat >= 6.8 && lat <= 7.0 && lng >= 79.8 && lng <= 80.0) {
          return 'Colombo Area';
        } else if (lat >= 6.0 && lat <= 6.2 && lng >= 80.2 && lng <= 80.4) {
          return 'Galle Area';
        } else if (lat >= 7.2 && lat <= 7.4 && lng >= 80.6 && lng <= 80.8) {
          return 'Kandy Area';
        } else {
          return 'Sri Lanka';
        }
      }
      
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      
    } finally {
      setLoading(false);
    }
  }, [addressCache]);

  // Get current location address
  const getCurrentLocationAddress = useCallback(async (location) => {
    if (!location || !location.latitude || !location.longitude) {
      return 'Location unavailable';
    }
    
    return await reverseGeocode(location.latitude, location.longitude);
  }, [reverseGeocode]);

  // Clear cache (useful for memory management)
  const clearCache = useCallback(() => {
    setAddressCache(new Map());
  }, []);

  return {
    reverseGeocode,
    getCurrentLocationAddress,
    loading,
    clearCache,
    cacheSize: addressCache.size
  };
};

export default useReverseGeocode;