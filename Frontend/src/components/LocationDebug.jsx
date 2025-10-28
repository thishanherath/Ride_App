import React, { useState } from 'react';
import { Card, Button } from './ui';
import { MapPin, RefreshCw, Eye, EyeOff, Navigation, Clock } from 'lucide-react';

/**
 * Debug component for monitoring location services
 * Shows detailed location information and controls
 */
const LocationDebug = ({ 
  location, 
  error, 
  loading, 
  permissionStatus, 
  hasLocation,
  isLocationStale,
  onRefresh,
  onStartTracking,
  onStopTracking,
  watchId,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="shadow-lg"
          icon={<Eye className="w-4 h-4" />}
        >
          Location Debug
        </Button>
      </div>
    );
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusColor = () => {
    if (hasLocation && !location?.isFallback) return 'text-green-600';
    if (loading) return 'text-orange-600';
    if (error) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusText = () => {
    if (hasLocation && !location?.isFallback) return 'Active';
    if (loading) return 'Loading';
    if (error) return 'Error';
    return 'Inactive';
  };

  return (
    <div className={`fixed bottom-4 right-4 z-40 w-80 ${className}`}>
      <Card className="p-4 shadow-xl border-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Location Debug</h3>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setIsVisible(false)}
            icon={<EyeOff className="w-4 h-4" />}
          />
        </div>

        {/* Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Permission:</span>
            <span className="text-sm font-medium capitalize">
              {permissionStatus}
            </span>
          </div>

          {/* Location Data */}
          {hasLocation && (
            <>
              <div className="border-t pt-3">
                <div className="text-xs text-gray-500 mb-2">Coordinates:</div>
                <div className="text-xs font-mono bg-gray-50 p-2 rounded">
                  <div>Lat: {location.latitude?.toFixed(6)}</div>
                  <div>Lng: {location.longitude?.toFixed(6)}</div>
                  {location.accuracy && (
                    <div>Accuracy: ±{Math.round(location.accuracy)}m</div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Update:</span>
                <span className="text-xs text-gray-500">
                  {formatTimestamp(location.timestamp)}
                </span>
              </div>

              {location.isFallback && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                  <div className="text-xs text-yellow-700 font-medium">
                    Using fallback location
                  </div>
                </div>
              )}

              {isLocationStale && (
                <div className="bg-orange-50 border border-orange-200 rounded p-2">
                  <div className="text-xs text-orange-700 font-medium">
                    Location data is stale
                  </div>
                </div>
              )}
            </>
          )}

          {/* Error Display */}
          {error && (
            <div className="border-t pt-3">
              <div className="bg-red-50 border border-red-200 rounded p-2">
                <div className="text-xs text-red-700 font-medium mb-1">
                  Error: {error.code}
                </div>
                <div className="text-xs text-red-600">
                  {error.message}
                </div>
              </div>
            </div>
          )}

          {/* Tracking Status */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Real-time Tracking:</span>
              <span className={`text-xs font-medium ${
                watchId ? 'text-green-600' : 'text-gray-500'
              }`}>
                {watchId ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="xs"
                onClick={onRefresh}
                disabled={loading}
                className="flex-1"
                icon={<RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />}
              >
                Refresh
              </Button>

              {watchId ? (
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={onStopTracking}
                  className="flex-1"
                  icon={<Navigation className="w-3 h-3" />}
                >
                  Stop Track
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="xs"
                  onClick={onStartTracking}
                  className="flex-1"
                  icon={<Navigation className="w-3 h-3" />}
                >
                  Start Track
                </Button>
              )}
            </div>
          </div>

          {/* Performance Info */}
          <div className="border-t pt-3">
            <div className="text-xs text-gray-500 space-y-1">
              <div>Browser: {navigator.userAgent.split(' ')[0]}</div>
              <div>Geolocation: {navigator.geolocation ? 'Supported' : 'Not supported'}</div>
              <div>HTTPS: {location.protocol === 'https:' ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LocationDebug;