/**
 * Real-Time Location Tracking Hook
 * Provides continuous location updates with high accuracy
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export const useRealTimeLocation = (options = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 5000,
    autoStart = true,
    onLocationUpdate = null,
    onError = null
  } = options;

  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  const watchIdRef = useRef(null);
  const locationHistoryRef = useRef([]);

  // Geolocation options
  const geoOptions = {
    enableHighAccuracy,
    timeout,
    maximumAge
  };

  // Success callback
  const handleLocationSuccess = useCallback((position) => {
    const newLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp
    };

    // Add to location history
    locationHistoryRef.current.push(newLocation);
    
    // Keep only last 10 locations
    if (locationHistoryRef.current.length > 10) {
      locationHistoryRef.current.shift();
    }

    setLocation(newLocation);
    setAccuracy(position.coords.accuracy);
    setLastUpdate(new Date());
    setError(null);

    // Call external callback
    onLocationUpdate?.(newLocation);
  }, [onLocationUpdate]);

  // Error callback
  const handleLocationError = useCallback((error) => {
    let errorMessage = 'Location access denied';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied by user';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out';
        break;
      default:
        errorMessage = 'Unknown location error';
        break;
    }

    setError({ code: error.code, message: errorMessage });
    onError?.(error);
  }, [onError]);

  // Start location tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError({ code: 0, message: 'Geolocation not supported' });
      return false;
    }

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setIsTracking(true);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleLocationSuccess,
      handleLocationError,
      geoOptions
    );

    return true;
  }, [handleLocationSuccess, handleLocationError, geoOptions]);

  // Stop location tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Get current position once
  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          resolve(location);
        },
        (error) => {
          reject(error);
        },
        geoOptions
      );
    });
  }, [geoOptions]);

  // Calculate distance between two points
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  }, []);

  // Calculate speed based on location history
  const calculateSpeed = useCallback(() => {
    const history = locationHistoryRef.current;
    if (history.length < 2) return null;

    const current = history[history.length - 1];
    const previous = history[history.length - 2];
    
    const distance = calculateDistance(
      previous.latitude, previous.longitude,
      current.latitude, current.longitude
    );
    
    const timeDiff = (current.timestamp - previous.timestamp) / 1000; // seconds
    
    if (timeDiff === 0) return null;
    
    return distance / timeDiff; // meters per second
  }, [calculateDistance]);

  // Get location accuracy status
  const getAccuracyStatus = useCallback(() => {
    if (!accuracy) return 'unknown';
    if (accuracy <= 5) return 'excellent';
    if (accuracy <= 10) return 'good';
    if (accuracy <= 20) return 'fair';
    return 'poor';
  }, [accuracy]);

  // Check if location is stale
  const isLocationStale = useCallback((maxAgeMinutes = 2) => {
    if (!lastUpdate) return true;
    const ageMs = Date.now() - lastUpdate.getTime();
    return ageMs > (maxAgeMinutes * 60 * 1000);
  }, [lastUpdate]);

  // Auto-start tracking
  useEffect(() => {
    if (autoStart) {
      startTracking();
    }

    return () => {
      stopTracking();
    };
  }, [autoStart, startTracking, stopTracking]);

  return {
    // Current state
    location,
    error,
    isTracking,
    accuracy,
    lastUpdate,
    
    // Actions
    startTracking,
    stopTracking,
    getCurrentLocation,
    
    // Utilities
    calculateDistance,
    calculateSpeed,
    getAccuracyStatus,
    isLocationStale,
    
    // Location history
    locationHistory: locationHistoryRef.current
  };
};