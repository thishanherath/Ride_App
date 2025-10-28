/**
 * Map Diagnostic Component
 * Helps debug map and location issues
 */

import React, { useEffect, useState } from 'react';
import { useGeolocation } from '../src/hooks/useGeolocation';

const MapDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState({});
  const [logs, setLogs] = useState([]);
  
  const {
    location,
    error: locationError,
    loading: locationLoading,
    permissionStatus,
    hasLocation,
    isWatching
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 60000,
    autoRequest: true
  });

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    addLog('🚀 Map diagnostic started');
    
    // Check browser capabilities
    const browserChecks = {
      geolocationSupported: 'geolocation' in navigator,
      localStorageSupported: typeof(Storage) !== "undefined",
      fetchSupported: typeof fetch !== 'undefined',
      promiseSupported: typeof Promise !== 'undefined'
    };
    
    setDiagnostics(prev => ({ ...prev, browser: browserChecks }));
    addLog(`📱 Browser checks: ${Object.values(browserChecks).every(Boolean) ? 'PASS' : 'FAIL'}`);
  }, []);

  useEffect(() => {
    if (location) {
      addLog(`📍 Location updated: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
      setDiagnostics(prev => ({ 
        ...prev, 
        location: {
          ...location,
          timestamp: new Date().toISOString()
        }
      }));
    }
  }, [location]);

  useEffect(() => {
    if (locationError) {
      addLog(`❌ Location error: ${locationError.message || locationError.code}`);
      setDiagnostics(prev => ({ ...prev, error: locationError }));
    }
  }, [locationError]);

  useEffect(() => {
    addLog(`🔐 Permission status: ${permissionStatus}`);
    setDiagnostics(prev => ({ ...prev, permissionStatus }));
  }, [permissionStatus]);

  useEffect(() => {
    addLog(`👁️ Watching: ${isWatching ? 'YES' : 'NO'}, Has location: ${hasLocation ? 'YES' : 'NO'}`);
  }, [isWatching, hasLocation]);

  const testLocation = async () => {
    addLog('🧪 Testing location manually...');
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      addLog(`✅ Manual location test: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
    } catch (error) {
      addLog(`❌ Manual location test failed: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('🧹 Logs cleared');
  };

  return (
    <div className="fixed top-0 right-0 w-80 h-screen bg-white shadow-lg border-l border-gray-200 z-50 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">🔍 Map Diagnostic</h2>
          <button 
            onClick={() => window.mapDiagnosticVisible = false}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Status Overview */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">📊 Status</h3>
          <div className="space-y-1 text-sm">
            <div className={`flex justify-between ${hasLocation ? 'text-green-600' : 'text-red-600'}`}>
              <span>Location:</span>
              <span>{hasLocation ? '✅ Active' : '❌ None'}</span>
            </div>
            <div className={`flex justify-between ${isWatching ? 'text-green-600' : 'text-gray-600'}`}>
              <span>Tracking:</span>
              <span>{isWatching ? '✅ Watching' : '⏸️ Stopped'}</span>
            </div>
            <div className={`flex justify-between ${permissionStatus === 'granted' ? 'text-green-600' : 'text-red-600'}`}>
              <span>Permission:</span>
              <span>{permissionStatus || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Current Location */}
        {location && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">📍 Current Location</h3>
            <div className="text-sm space-y-1">
              <div>Lat: {location.latitude.toFixed(6)}</div>
              <div>Lng: {location.longitude.toFixed(6)}</div>
              {location.accuracy && <div>Accuracy: ±{Math.round(location.accuracy)}m</div>}
              {location.timestamp && <div>Updated: {new Date(location.timestamp).toLocaleTimeString()}</div>}
            </div>
          </div>
        )}

        {/* Error Display */}
        {locationError && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg">
            <h3 className="font-semibold mb-2 text-red-700">❌ Error</h3>
            <div className="text-sm text-red-600">
              <div>Code: {locationError.code}</div>
              <div>Message: {locationError.message}</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mb-4 space-y-2">
          <button 
            onClick={testLocation}
            className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            🧪 Test Location
          </button>
          <button 
            onClick={clearLogs}
            className="w-full px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            🧹 Clear Logs
          </button>
        </div>

        {/* Live Logs */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">📝 Live Logs</h3>
          <div className="bg-black text-green-400 p-2 rounded text-xs font-mono h-40 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>

        {/* Browser Info */}
        <div className="text-xs text-gray-500">
          <h3 className="font-semibold mb-1">🌐 Browser</h3>
          <div>User Agent: {navigator.userAgent.slice(0, 50)}...</div>
          <div>Geolocation: {diagnostics.browser?.geolocationSupported ? '✅' : '❌'}</div>
        </div>
      </div>
    </div>
  );
};

// Global function to show diagnostic
window.showMapDiagnostic = () => {
  window.mapDiagnosticVisible = true;
  // Force re-render of the component that includes this
};

export default MapDiagnostic;