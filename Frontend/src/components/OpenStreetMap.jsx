/**
 * OpenStreetMap Component with Route Visualization
 * Free alternative to Google Maps for ride-sharing
 * Features: Route display, real-time tracking, custom markers
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const OpenStreetMap = ({
  pickup,
  destination,
  userLocation,
  captainLocation,
  showRoute = false,
  trackingMode = 'user',
  onLocationUpdate,
  className = "w-full h-full"
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const routeControlRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Custom icons for different markers
  const createCustomIcon = useCallback((type, color = '#3388ff') => {
    const iconHtml = {
      user: `
        <div style="
          width: 20px; 
          height: 20px; 
          background: ${color}; 
          border: 3px solid white; 
          border-radius: 50%; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          animation: pulse 2s infinite;
        "></div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
      `,
      pickup: `
        <div style="
          width: 30px; 
          height: 30px; 
          background: #4CAF50; 
          border: 3px solid white; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg);
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      destination: `
        <div style="
          width: 30px; 
          height: 30px; 
          background: #F44336; 
          border: 3px solid white; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg);
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      captain: `
        <div style="
          width: 32px; 
          height: 32px; 
          background: #FFD700; 
          border: 3px solid #FF6B35; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          animation: bounce 1s infinite;
        ">
          <span style="color: #FF6B35; font-size: 16px; font-weight: bold;">🚗</span>
        </div>
        <style>
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-5px); }
            60% { transform: translateY(-3px); }
          }
        </style>
      `
    };

    return L.divIcon({
      html: iconHtml[type] || iconHtml.user,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  }, []);

  // Initialize map
  const initializeMap = useCallback(() => {
    try {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Default center (Colombo, Sri Lanka)
      const defaultCenter = [6.9271, 79.8612];
      const center = userLocation ? 
        [userLocation.latitude, userLocation.longitude] : 
        defaultCenter;

      // Create map instance
      mapInstanceRef.current = L.map(mapRef.current, {
        center,
        zoom: 15,
        zoomControl: true,
        attributionControl: true,
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      setIsLoaded(true);
      setError(null);
      
    } catch (err) {
      console.error('Error initializing OpenStreetMap:', err);
      setError('Failed to load map. Please check your internet connection.');
    }
  }, [userLocation]);

  // Geocoding function using Nominatim (free OpenStreetMap service)
  const geocodeAddress = useCallback(async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          display_name: data[0].display_name
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }, []);

  // Add or update marker
  const updateMarker = useCallback((key, position, options = {}) => {
    if (!mapInstanceRef.current) return;

    const { title = '', type = 'user', popup = '' } = options;

    // Remove existing marker
    if (markersRef.current[key]) {
      mapInstanceRef.current.removeLayer(markersRef.current[key]);
    }

    // Create new marker with custom icon
    const marker = L.marker([position.lat, position.lng], {
      icon: createCustomIcon(type),
      title
    }).addTo(mapInstanceRef.current);

    // Add popup if provided
    if (popup) {
      marker.bindPopup(popup);
    }

    markersRef.current[key] = marker;

    return marker;
  }, [createCustomIcon]);

  // Update user location
  const updateUserLocation = useCallback((location) => {
    if (!location || !mapInstanceRef.current) return;

    const position = { lat: location.latitude, lng: location.longitude };
    
    updateMarker('user', position, {
      title: 'Your Location',
      type: 'user',
      popup: `
        <div style="text-align: center;">
          <strong>📍 Your Location</strong><br/>
          <small>Accuracy: ±${Math.round(location.accuracy || 0)}m</small><br/>
          <small>${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}</small>
        </div>
      `
    });

    // Center map on user location if in user tracking mode
    if (trackingMode === 'user') {
      mapInstanceRef.current.setView([position.lat, position.lng], 16);
    }
  }, [trackingMode, updateMarker]);

  // Update captain location
  const updateCaptainLocation = useCallback((location) => {
    if (!location || !mapInstanceRef.current) return;

    const position = { lat: location.latitude, lng: location.longitude };
    
    updateMarker('captain', position, {
      title: 'Captain Location',
      type: 'captain',
      popup: `
        <div style="text-align: center;">
          <strong>🚗 Your Captain</strong><br/>
          <small>Live Location</small><br/>
          <small>${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}</small>
        </div>
      `
    });

    // Center map on captain location if in captain tracking mode
    if (trackingMode === 'captain') {
      mapInstanceRef.current.setView([position.lat, position.lng], 16);
    }
  }, [trackingMode, updateMarker]);

  // Show route between pickup and destination
  const showRouteOnMap = useCallback(async () => {
    if (!pickup || !destination || !mapInstanceRef.current) return;

    try {
      // Remove existing route
      if (routeControlRef.current) {
        mapInstanceRef.current.removeControl(routeControlRef.current);
      }

      // Geocode pickup and destination
      const pickupCoords = await geocodeAddress(pickup);
      const destCoords = await geocodeAddress(destination);

      if (!pickupCoords || !destCoords) {
        console.error('Could not geocode addresses');
        return;
      }

      // Add pickup and destination markers
      updateMarker('pickup', pickupCoords, {
        title: `Pickup: ${pickup}`,
        type: 'pickup',
        popup: `
          <div style="text-align: center;">
            <strong>🟢 Pickup Location</strong><br/>
            <small>${pickup}</small>
          </div>
        `
      });

      updateMarker('destination', destCoords, {
        title: `Destination: ${destination}`,
        type: 'destination',
        popup: `
          <div style="text-align: center;">
            <strong>🔴 Destination</strong><br/>
            <small>${destination}</small>
          </div>
        `
      });

      // Create route using Leaflet Routing Machine
      routeControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(pickupCoords.lat, pickupCoords.lng),
          L.latLng(destCoords.lat, destCoords.lng)
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        createMarker: () => null, // Don't create default markers
        lineOptions: {
          styles: [
            {
              color: '#3388ff',
              weight: 6,
              opacity: 0.8
            }
          ]
        },
        show: false, // Hide the instruction panel
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1'
        })
      }).addTo(mapInstanceRef.current);

      // Fit map to show entire route
      const group = new L.featureGroup([
        L.marker([pickupCoords.lat, pickupCoords.lng]),
        L.marker([destCoords.lat, destCoords.lng])
      ]);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));

    } catch (error) {
      console.error('Error showing route:', error);
    }
  }, [pickup, destination, geocodeAddress, updateMarker]);

  // Initialize map on component mount
  useEffect(() => {
    initializeMap();
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initializeMap]);

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

  // Show route when pickup/destination changes
  useEffect(() => {
    if (isLoaded && pickup && destination && showRoute) {
      showRouteOnMap();
    }
  }, [isLoaded, pickup, destination, showRoute, showRouteOnMap]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-600">{error}</p>
          <p className="text-xs text-gray-500 mt-2">
            Using OpenStreetMap - Free & Open Source
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
            <p className="text-xs text-gray-500">OpenStreetMap</p>
          </div>
        </div>
      )}
      
      {/* Map attribution */}
      <div className="absolute bottom-2 right-2 bg-white/80 px-2 py-1 rounded text-xs text-gray-600">
        🗺️ OpenStreetMap
      </div>
    </div>
  );
};

export default OpenStreetMap;