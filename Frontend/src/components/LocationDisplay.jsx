/**
 * Enhanced Location Display Component
 * Shows readable address with attractive animations and modern design
 */

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader, Crosshair, Zap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useReverseGeocode from '../hooks/useReverseGeocode';

const LocationDisplay = ({
  location,
  showCoordinates = false,
  showAccuracy = true,
  className = '',
  icon = true,
  compact = false,
  enhanced = true
}) => {
  const [address, setAddress] = useState('Getting location...');
  const [isVisible, setIsVisible] = useState(false);
  const { getCurrentLocationAddress, loading } = useReverseGeocode();

  useEffect(() => {
    setIsVisible(true);
  }, []);

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

  // Get accuracy status and color
  const getAccuracyStatus = (accuracy) => {
    if (!accuracy) return { status: 'Unknown', color: 'gray', icon: Navigation };
    if (accuracy <= 10) return { status: 'Excellent', color: 'green', icon: Zap };
    if (accuracy <= 50) return { status: 'Good', color: 'blue', icon: Navigation };
    if (accuracy <= 100) return { status: 'Fair', color: 'yellow', icon: Crosshair };
    return { status: 'Poor', color: 'red', icon: Crosshair };
  };

  const accuracyInfo = location ? getAccuracyStatus(location.accuracy) : null;

  if (!location) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 ${className}`}
      >
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <MapPin className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Location Unavailable</p>
          <p className="text-xs text-gray-500">Please enable location services</p>
        </div>
      </motion.div>
    );
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-200/50 shadow-sm ${className}`}
      >
        {icon && (
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            {loading && (
              <div className="absolute -inset-1 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader className="w-3 h-3 animate-spin text-blue-500" />
                  <span>Getting location...</span>
                </motion.div>
              ) : (
                <motion.span
                  key="address"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {address}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          {showCoordinates && (
            <div className="text-xs text-gray-500 font-mono mt-1">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (enhanced) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.95 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 15, scale: isVisible ? 1 : 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 backdrop-blur-sm rounded-xl p-3 shadow-md border border-blue-200/50 ${className}`}
      >
        {/* Smaller animated background elements */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-orange-400/10 to-pink-400/10 rounded-full translate-y-6 -translate-x-6" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            {icon && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
                className="relative flex-shrink-0"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                
                {/* Smaller pulsing ring animation */}
                <div className="absolute inset-0 rounded-lg border border-blue-400 animate-ping opacity-30" />
                
                {loading && (
                  <div className="absolute -inset-1 border border-blue-400 border-t-transparent rounded-lg animate-spin" />
                )}
              </motion.div>
            )}
            
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="flex items-center gap-2 mb-1"
              >
                <Crosshair className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-semibold text-gray-900">Location</span>
                
                {loading && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader className="w-3 h-3 text-blue-500" />
                  </motion.div>
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1 text-blue-600"
                    >
                      <div className="flex space-x-0.5">
                        <div className="w-0.5 h-0.5 bg-blue-500 rounded-full animate-bounce" />
                        <div className="w-0.5 h-0.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-0.5 h-0.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <span className="text-xs font-medium">Locating...</span>
                    </motion.div>
                  ) : (
                    <motion.p
                      key="address"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs font-medium text-gray-800 leading-tight truncate"
                    >
                      {address}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {(showAccuracy || showCoordinates) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="flex items-center gap-2 mt-1"
                >
                  {showAccuracy && location.accuracy && accuracyInfo && (
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-${accuracyInfo.color}-100 text-${accuracyInfo.color}-700`}>
                      <accuracyInfo.icon className="w-2 h-2" />
                      <span className="text-xs font-medium">±{Math.round(location.accuracy)}m</span>
                    </div>
                  )}
                  
                  {showCoordinates && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      <Navigation className="w-2 h-2" />
                      <span className="font-mono text-xs">
                        {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Fallback to original design
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