/**
 * Simple Map Component - Fallback for OpenStreetMap
 * Shows real-time location with basic map functionality
 */

import React, { useEffect, useRef, useState } from 'react';
import LocationDisplay from './LocationDisplay';

const SimpleMap = ({
  pickup,
  destination,
  userLocation,
  captainLocation,
  showRoute = false,
  trackingMode = 'user',
  onLocationUpdate,
  className = "w-full h-full"
}) => {
  const [mapUrl, setMapUrl] = useState('');
  const [error, setError] = useState(null);

  // Generate map URL based on locations
  useEffect(() => {
    try {
      let url = '';
      
      if (showRoute && pickup && destination) {
        // Show route between pickup and destination
        url = `https://www.google.com/maps?q=${encodeURIComponent(pickup)} to ${encodeURIComponent(destination)}&output=embed`;
      } else if (userLocation && userLocation.latitude && userLocation.longitude) {
        // Show user location
        url = `https://www.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}&output=embed&z=16`;
      } else if (captainLocation && captainLocation.latitude && captainLocation.longitude) {
        // Show captain location
        url = `https://www.google.com/maps?q=${captainLocation.latitude},${captainLocation.longitude}&output=embed&z=16`;
      } else {
        // Default location (Colombo, Sri Lanka)
        url = 'https://www.google.com/maps?q=6.9271,79.8612&output=embed&z=13';
      }
      
      setMapUrl(url);
      setError(null);
    } catch (err) {
      console.error('Map URL generation error:', err);
      setError('Failed to generate map');
    }
  }, [pickup, destination, userLocation, captainLocation, showRoute]);

  // Call location update callback
  useEffect(() => {
    if (userLocation && onLocationUpdate) {
      onLocationUpdate(userLocation);
    }
  }, [userLocation, onLocationUpdate]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-600">{error}</p>
          <p className="text-xs text-gray-500 mt-2">
            Using fallback map display
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Map iframe */}
      <iframe
        src={mapUrl}
        className="w-full h-full border-0 rounded-lg"
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Map"
      />
      
      {/* Loading indicator */}
      {!mapUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Location indicators overlay */}
      {userLocation && userLocation.latitude && (
        <div className="absolute top-4 left-4">
          <LocationDisplay 
            location={userLocation}
            showCoordinates={false}
            showAccuracy={true}
            compact={true}
            className="shadow-lg"
          />
        </div>
      )}
      
      {/* Route indicator */}
      {showRoute && pickup && destination && (
        <div className="absolute top-4 right-4 bg-blue-500/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm text-white">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span>Route Active</span>
          </div>
        </div>
      )}
      
      {/* Driver indicator */}
      {captainLocation && captainLocation.latitude && (
        <div className="absolute bottom-4 left-4 bg-yellow-500/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm text-white">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <span>🚗 Driver Nearby</span>
          </div>
        </div>
      )}
      
      {/* Map attribution */}
      <div className="absolute bottom-2 right-2 bg-white/80 px-2 py-1 rounded text-xs text-gray-600">
        🗺️ Map
      </div>
    </div>
  );
};

export default SimpleMap;