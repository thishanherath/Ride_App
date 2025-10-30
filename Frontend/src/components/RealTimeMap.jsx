/**
 * Real-Time Interactive Google Maps Component
 * Features: Live location tracking, route visualization, real-time updates
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const RealTimeMap = ({
  pickup,
  destination,
  userLocation,
  captainLocation,
  showRoute = false,
  trackingMode = 'user', // 'user', 'captain', 'route'
  onLocationUpdate,
  className = "w-full h-full"
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const routeRendererRef = useRef(null);
  const watchIdRef = useRef(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Google Maps
  const initializeMap = useCallback(async () => {
    try {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
        version: 'weekly',
        libraries: ['places', 'geometry']
      });

      const google = await loader.load();
      
      if (!mapRef.current) return;

      // Default center (Colombo, Sri Lanka)
      const defaultCenter = { lat: 6.9271, lng: 79.8612 };
      const center = userLocation ? 
        { lat: userLocation.latitude, lng: userLocation.longitude } : 
        defaultCenter;

      // Create map instance
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        options: {
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true
        }
      });

      // Initialize route renderer
      routeRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#FF6B35',
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      });

      setIsLoaded(true);
      
    } catch (err) {
      console.error('Error initializing Google Maps:', err);
      setError('Failed to load Google Maps. Please check your API key.');
    }
  }, [userLocation]);

  // Add or update marker
  const updateMarker = useCallback((key, position, options = {}) => {
    if (!mapInstanceRef.current || !window.google) return;

    const {
      title = '',
      icon = null,
      animation = null,
      draggable = false
    } = options;

    // Remove existing marker
    if (markersRef.current[key]) {
      markersRef.current[key].setMap(null);
    }

    // Create new marker
    const marker = new window.google.maps.Marker({
      position,
      map: mapInstanceRef.current,
      title,
      icon,
      animation,
      draggable
    });

    markersRef.current[key] = marker;

    return marker;
  }, []);

  // Update user location marker
  const updateUserLocation = useCallback((location) => {
    if (!location) return;

    const position = { lat: location.latitude, lng: location.longitude };
    
    updateMarker('user', position, {
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24),
        anchor: new window.google.maps.Point(12, 12)
      },
      animation: window.google.maps.Animation.DROP
    });

    // Center map on user location if in user tracking mode
    if (trackingMode === 'user') {
      mapInstanceRef.current.panTo(position);
    }
  }, [trackingMode, updateMarker]);

  // Update captain location marker
  const updateCaptainLocation = useCallback((location) => {
    if (!location) return;

    const position = { lat: location.latitude, lng: location.longitude };
    
    updateMarker('captain', position, {
      title: 'Driver Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2L20 12H28L22 18L24 28L16 22L8 28L10 18L4 12H12L16 2Z" fill="#FFD700" stroke="#FF6B35" stroke-width="2"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 16)
      },
      animation: window.google.maps.Animation.BOUNCE
    });

    // Center map on captain location if in captain tracking mode
    if (trackingMode === 'captain') {
      mapInstanceRef.current.panTo(position);
    }
  }, [trackingMode, updateMarker]);

  // Update pickup and destination markers
  const updateRouteMarkers = useCallback(() => {
    if (!pickup || !destination) return;

    // Geocode pickup location
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ address: pickup }, (results, status) => {
      if (status === 'OK' && results[0]) {
        updateMarker('pickup', results[0].geometry.location, {
          title: `Pickup: ${pickup}`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C10.48 2 6 6.48 6 12C6 20 16 30 16 30S26 20 26 12C26 6.48 21.52 2 16 2ZM16 16C13.79 16 12 14.21 12 12S13.79 8 16 8S20 9.79 20 12S18.21 16 16 16Z" fill="#4CAF50"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 32)
          }
        });
      }
    });

    // Geocode destination location
    geocoder.geocode({ address: destination }, (results, status) => {
      if (status === 'OK' && results[0]) {
        updateMarker('destination', results[0].geometry.location, {
          title: `Destination: ${destination}`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C10.48 2 6 6.48 6 12C6 20 16 30 16 30S26 20 26 12C26 6.48 21.52 2 16 2ZM16 16C13.79 16 12 14.21 12 12S13.79 8 16 8S20 9.79 20 12S18.21 16 16 16Z" fill="#F44336"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 32)
          }
        });
      }
    });
  }, [pickup, destination, updateMarker]);

  // Show route between pickup and destination
  const showRouteOnMap = useCallback(() => {
    if (!pickup || !destination || !routeRendererRef.current) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route({
      origin: pickup,
      destination: destination,
      travelMode: window.google.maps.TravelMode.DRIVING,
      avoidHighways: false,
      avoidTolls: false
    }, (result, status) => {
      if (status === 'OK') {
        routeRendererRef.current.setDirections(result);
        routeRendererRef.current.setMap(mapInstanceRef.current);

        // Fit map to show entire route
        const bounds = new window.google.maps.LatLngBounds();
        result.routes[0].legs.forEach(leg => {
          bounds.extend(leg.start_location);
          bounds.extend(leg.end_location);
        });
        mapInstanceRef.current.fitBounds(bounds);
      } else {
        console.error('Directions request failed:', status);
      }
    });
  }, [pickup, destination]);

  // Start real-time location tracking
  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) return;

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        updateUserLocation(location);
        onLocationUpdate?.(location);
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      options
    );
  }, [updateUserLocation, onLocationUpdate]);

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Initialize map on component mount
  useEffect(() => {
    initializeMap();
    
    return () => {
      stopLocationTracking();
    };
  }, [initializeMap, stopLocationTracking]);

  // Update user location when prop changes
  useEffect(() => {
    if (isLoaded && userLocation) {
      updateUserLocation(userLocation);
    }
  }, [isLoaded, userLocation, updateUserLocation]);

  // Update captain location when prop changes
  useEffect(() => {
    if (isLoaded && captainLocation) {
      updateCaptainLocation(captainLocation);
    }
  }, [isLoaded, captainLocation, updateCaptainLocation]);

  // Update route markers when pickup/destination changes
  useEffect(() => {
    if (isLoaded && pickup && destination) {
      updateRouteMarkers();
      
      if (showRoute) {
        showRouteOnMap();
      }
    }
  }, [isLoaded, pickup, destination, showRoute, updateRouteMarkers, showRouteOnMap]);

  // Start location tracking when component mounts
  useEffect(() => {
    if (isLoaded && trackingMode === 'user') {
      startLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [isLoaded, trackingMode, startLocationTracking, stopLocationTracking]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-600">{error}</p>
          <p className="text-xs text-gray-500 mt-2">
            Please configure your Google Maps API key
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full" />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeMap;