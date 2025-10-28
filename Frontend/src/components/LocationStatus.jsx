/**
 * Real-Time Location Status Component
 * Shows current location tracking status and accuracy
 */

import React from 'react';
import { MapPin, Wifi, WifiOff, Navigation, Clock } from 'lucide-react';
import { Badge } from './ui';

const LocationStatus = ({ 
  location, 
  isTracking, 
  accuracy, 
  lastUpdate, 
  error,
  className = ""
}) => {
  const getAccuracyColor = (acc) => {
    if (!acc) return 'gray';
    if (acc <= 5) return 'green';
    if (acc <= 10) return 'blue';
    if (acc <= 20) return 'yellow';
    return 'red';
  };

  const getAccuracyText = (acc) => {
    if (!acc) return 'Unknown';
    if (acc <= 5) return 'Excellent';
    if (acc <= 10) return 'Good';
    if (acc <= 20) return 'Fair';
    return 'Poor';
  };

  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Never';
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  if (error) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <WifiOff className="w-4 h-4 text-red-500" />
        <span className="text-sm text-red-700">{error.message}</span>
      </div>
    );
  }

  if (!location) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <MapPin className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">Location not available</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Tracking Status */}
      <div className="flex items-center gap-1">
        {isTracking ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-gray-400" />
        )}
        <span className="text-xs text-gray-600">
          {isTracking ? 'Live' : 'Offline'}
        </span>
      </div>

      {/* Accuracy */}
      {accuracy && (
        <Badge 
          variant="outline" 
          color={getAccuracyColor(accuracy)}
          size="xs"
        >
          <Navigation className="w-3 h-3 mr-1" />
          {getAccuracyText(accuracy)} (±{Math.round(accuracy)}m)
        </Badge>
      )}

      {/* Last Update */}
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3 text-gray-400" />
        <span className="text-xs text-gray-500">
          {formatLastUpdate(lastUpdate)}
        </span>
      </div>

      {/* Coordinates (for debugging) */}
      {location && (
        <span className="text-xs text-gray-400 font-mono">
          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </span>
      )}
    </div>
  );
};

export default LocationStatus;