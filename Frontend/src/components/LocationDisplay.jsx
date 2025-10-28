/**
 * Location Display Component
 * Shows readable address instead of coordinates
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader } from 'lucide-react';
import useReverseGeocode from '../hooks/useReverseGeocode';

const LocationDisplay = ({
  location,
  showCoordinates = false,
  showAccuracy = true,
  className = '',
  icon = true,
  compact = false
}) => {
  const [address, setAddress] = useState('Getting location...');
  const { getCurrentLocationAddress, loading } = useReverseGeocode();

  useEffect(() => {
    const getAddress = async () => {
      if (location && location.latitude && location.longitude) {
        try {
          const locationAddress = await getCurrentLocationAddress(location);
          setAddress(locationAddress);
        } catch (error) {
          console.warn('Failed to get address:', error);
          setAddress(`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
        }
      } else {
        setAddress('Location unavailable');
      }
    };

    getAddress();
  }, [location, getCurrentLocationAddress]);

  if (!location) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        {icon && <MapPin className="w-4 h-4" />}
        <span className="text-sm">Location unavailable</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {icon && <MapPin className="w-4 h-4 text-blue-500" />}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {loading ? (
              <div className="flex items-center gap-1">
                <Loader className="w-3 h-3 animate-spin" />
                <span>Getting location...</span>
              </div>
            ) : (
              address
            )}
          </div>
          {showCoordinates && (
            <div className="text-xs text-gray-500 font-mono">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gray-200 ${className}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-blue-500" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">Current Location</span>
            {loading && <Loader className="w-3 h-3 animate-spin text-blue-500" />}
          </div>
          
          <div className="text-sm text-gray-700 mb-2">
            {loading ? 'Getting location...' : address}
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {showAccuracy && location.accuracy && (
              <span className="flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                ±{Math.round(location.accuracy)}m accuracy
              </span>
            )}
            
            {showCoordinates && (
              <span className="font-mono">
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </span>
            )}
            
            {location.timestamp && (
              <span>
                Updated {new Date(location.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDisplay;