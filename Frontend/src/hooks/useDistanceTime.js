import { useState, useEffect, useCallback } from 'react';
import mapService from '../services/mapService';

/**
 * Custom hook for managing distance and time calculations
 * @param {string} pickup - Pickup location
 * @param {string} destination - Destination location
 * @param {Object} options - Configuration options
 * @returns {Object} Distance/time data and utilities
 */
export const useDistanceTime = (pickup, destination, options = {}) => {
  const {
    autoFetch = true,
    includefare = false,
    debounceMs = 500
  } = options;

  const [data, setData] = useState({
    distance: null,
    duration: null,
    fare: null,
    loading: false,
    error: null,
    lastUpdated: null
  });

  const [debounceTimer, setDebounceTimer] = useState(null);

  /**
   * Fetch distance and time data
   */
  const fetchDistanceTime = useCallback(async (pickupLoc, destinationLoc) => {
    if (!pickupLoc || !destinationLoc) {
      setData(prev => ({
        ...prev,
        distance: null,
        duration: null,
        fare: null,
        error: 'Both pickup and destination locations are required',
        loading: false
      }));
      return;
    }

    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      let result;
      
      if (includefare) {
        result = await mapService.getFareWithDistanceTime(pickupLoc, destinationLoc);
      } else {
        result = await mapService.getDistanceAndDuration(pickupLoc, destinationLoc);
      }

      setData(prev => ({
        ...prev,
        distance: result.distance,
        duration: result.duration,
        fare: result.fare || prev.fare,
        loading: false,
        error: null,
        lastUpdated: new Date()
      }));
    } catch (error) {
      console.error('Error fetching distance/time:', error);
      
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to calculate distance and time'
      }));
    }
  }, [includefare]);

  /**
   * Debounced fetch function
   */
  const debouncedFetch = useCallback((pickupLoc, destinationLoc) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      fetchDistanceTime(pickupLoc, destinationLoc);
    }, debounceMs);

    setDebounceTimer(timer);
  }, [fetchDistanceTime, debounceMs, debounceTimer]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(() => {
    if (pickup && destination) {
      fetchDistanceTime(pickup, destination);
    }
  }, [pickup, destination, fetchDistanceTime]);

  /**
   * Clear data function
   */
  const clear = useCallback(() => {
    setData({
      distance: null,
      duration: null,
      fare: null,
      loading: false,
      error: null,
      lastUpdated: null
    });
  }, []);

  // Auto-fetch when locations change
  useEffect(() => {
    if (autoFetch && pickup && destination) {
      debouncedFetch(pickup, destination);
    } else if (!pickup || !destination) {
      clear();
    }

    // Cleanup debounce timer on unmount
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [pickup, destination, autoFetch, debouncedFetch, clear]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, []);

  // Computed values
  const isReady = !data.loading && !data.error && data.distance && data.duration;
  const hasLocations = Boolean(pickup && destination);
  
  // Formatted display values
  const displayValues = {
    distance: data.distance ? mapService.formatDistance(data.distance.value) : null,
    duration: data.duration ? mapService.formatDuration(data.duration.value) : null,
    eta: data.duration ? mapService.calculateETA(data.duration.value) : null,
    distanceKm: data.distance ? data.distance.km : null,
    durationMinutes: data.duration ? data.duration.minutes : null
  };

  // Travel recommendations
  const recommendations = data.distance 
    ? mapService.getTravelModeRecommendations(data.distance.value)
    : null;

  return {
    // Core data
    ...data,
    
    // Status flags
    isReady,
    hasLocations,
    isCalculating: data.loading,
    
    // Display values
    display: displayValues,
    
    // Recommendations
    recommendations,
    
    // Actions
    refresh,
    clear,
    fetchDistanceTime: (pickup, destination) => fetchDistanceTime(pickup, destination),
    
    // Raw service access
    mapService
  };
};

/**
 * Simplified hook for just getting distance and duration
 */
export const useDistance = (pickup, destination) => {
  const { distance, duration, loading, error, display, isReady } = useDistanceTime(
    pickup, 
    destination, 
    { autoFetch: true, includefare: false }
  );

  return {
    distance,
    duration,
    loading,
    error,
    isReady,
    display: {
      distance: display.distance,
      duration: display.duration,
      eta: display.eta
    }
  };
};

/**
 * Hook for getting fare with distance and time
 */
export const useFareCalculation = (pickup, destination) => {
  const { fare, distance, duration, loading, error, display, isReady } = useDistanceTime(
    pickup, 
    destination, 
    { autoFetch: true, includefare: true }
  );

  return {
    fare,
    distance,
    duration,
    loading,
    error,
    isReady,
    display
  };
};

export default useDistanceTime;