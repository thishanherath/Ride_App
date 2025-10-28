import React from 'react';
import { MapPin, AlertCircle, RefreshCw, Settings } from 'lucide-react';
import { Button, Card } from './ui';

const LocationPermission = ({ 
  permissionStatus, 
  error, 
  onRetry, 
  onUseDefault,
  loading = false,
  className = '' 
}) => {
  
  const getPermissionMessage = () => {
    switch (permissionStatus) {
      case 'denied':
        return {
          title: 'Location Access Denied',
          message: 'To show your current location on the map and find nearby rides, please enable location permissions.',
          icon: <AlertCircle className="w-8 h-8 text-red-500" />,
          color: 'red'
        };
      case 'prompt':
        return {
          title: 'Location Permission Required',
          message: 'We need access to your location to show you on the map and find nearby rides.',
          icon: <MapPin className="w-8 h-8 text-blue-500" />,
          color: 'blue'
        };
      default:
        return {
          title: 'Getting Your Location',
          message: 'Please wait while we determine your current location...',
          icon: <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />,
          color: 'orange'
        };
    }
  };

  const getErrorMessage = () => {
    if (!error) return null;
    
    switch (error.code) {
      case 'PERMISSION_DENIED':
        return {
          title: 'Location Permission Denied',
          message: 'Please enable location access in your browser settings to use this feature.',
          instructions: [
            'Click the location icon in your browser\'s address bar',
            'Select "Allow" for location access',
            'Refresh the page and try again'
          ]
        };
      case 'POSITION_UNAVAILABLE':
        return {
          title: 'Location Unavailable',
          message: 'We couldn\'t determine your location. Please check your GPS and internet connection.',
          instructions: [
            'Make sure GPS is enabled on your device',
            'Check your internet connection',
            'Try moving to an area with better signal'
          ]
        };
      case 'TIMEOUT':
        return {
          title: 'Location Request Timed Out',
          message: 'It took too long to get your location. Please try again.',
          instructions: [
            'Make sure you have a stable internet connection',
            'Try refreshing the page',
            'Check if location services are enabled'
          ]
        };
      case 'NOT_SUPPORTED':
        return {
          title: 'Location Not Supported',
          message: 'Your browser doesn\'t support location services.',
          instructions: [
            'Try using a modern browser like Chrome, Firefox, or Safari',
            'Make sure your browser is up to date',
            'You can still use the app by entering locations manually'
          ]
        };
      default:
        return {
          title: 'Location Error',
          message: error.message || 'An unknown error occurred while getting your location.',
          instructions: [
            'Try refreshing the page',
            'Check your browser settings',
            'Contact support if the problem persists'
          ]
        };
    }
  };

  const permissionInfo = getPermissionMessage();
  const errorInfo = getErrorMessage();
  const displayInfo = errorInfo || permissionInfo;

  return (
    <Card className={`p-6 text-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
          {displayInfo.icon}
        </div>

        {/* Title and Message */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {displayInfo.title}
          </h3>
          <p className="text-sm text-gray-600 max-w-sm">
            {displayInfo.message}
          </p>
        </div>

        {/* Instructions (for errors) */}
        {displayInfo.instructions && (
          <div className="bg-gray-50 rounded-lg p-4 w-full max-w-sm">
            <h4 className="text-sm font-medium text-gray-900 mb-2">How to fix this:</h4>
            <ol className="text-xs text-gray-600 space-y-1">
              {displayInfo.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="font-medium mr-2">{index + 1}.</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          {permissionStatus === 'denied' ? (
            <>
              <Button
                onClick={() => window.open('https://support.google.com/chrome/answer/142065', '_blank')}
                variant="outline"
                size="sm"
                className="flex-1"
                icon={<Settings className="w-4 h-4" />}
              >
                Browser Settings
              </Button>
              <Button
                onClick={onUseDefault}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                Use Default Location
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={onRetry}
                disabled={loading}
                variant="primary"
                size="sm"
                className="flex-1"
                loading={loading}
                icon={!loading && <MapPin className="w-4 h-4" />}
              >
                {loading ? 'Getting Location...' : 'Try Again'}
              </Button>
              {onUseDefault && (
                <Button
                  onClick={onUseDefault}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  Skip for Now
                </Button>
              )}
            </>
          )}
        </div>

        {/* Additional Help */}
        <div className="text-xs text-gray-500 max-w-sm">
          <p>
            Don't worry! You can still use the app by manually entering pickup and destination locations.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default LocationPermission;