import React, { useState } from 'react';
import { useDistance } from '../hooks/useDistanceTime';
import mapService from '../services/mapService';

/**
 * Test component for Google Maps distance and time integration
 * This component can be used to test the distance/time calculation functionality
 */
const DistanceTimeTest = () => {
  const [pickup, setPickup] = useState('Colombo Fort Railway Station, Colombo');
  const [destination, setDestination] = useState('Bandaranaike International Airport, Katunayake');
  
  const { distance, duration, loading, error, display, isReady } = useDistance(pickup, destination);

  const [manualTest, setManualTest] = useState({
    pickup: '',
    destination: '',
    result: null,
    loading: false
  });

  const handleManualTest = async () => {
    if (!manualTest.pickup || !manualTest.destination) return;
    
    setManualTest(prev => ({ ...prev, loading: true, result: null }));
    
    try {
      const result = await mapService.getDistanceAndDuration(manualTest.pickup, manualTest.destination);
      setManualTest(prev => ({ ...prev, result, loading: false }));
    } catch (error) {
      setManualTest(prev => ({ 
        ...prev, 
        result: { error: error.message }, 
        loading: false 
      }));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Google Maps Distance & Time Test</h2>
      
      {/* Hook Test Section */}
      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">useDistance Hook Test</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
            <input
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter pickup location"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter destination"
            />
          </div>
        </div>

        {/* Results */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium text-gray-800 mb-2">Results:</h4>
          
          {loading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Calculating distance and time...</span>
            </div>
          )}
          
          {error && (
            <div className="text-red-600 bg-red-50 p-2 rounded border border-red-200">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {isReady && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Distance</div>
                <div className="text-lg font-semibold text-gray-800">{display.distance}</div>
                <div className="text-xs text-gray-500">{distance?.km} km</div>
              </div>
              
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Duration</div>
                <div className="text-lg font-semibold text-gray-800">{display.duration}</div>
                <div className="text-xs text-gray-500">{duration?.minutes} minutes</div>
              </div>
              
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">ETA</div>
                <div className="text-lg font-semibold text-gray-800">{display.eta}</div>
                <div className="text-xs text-gray-500">Estimated arrival</div>
              </div>
            </div>
          )}
          
          {!loading && !error && !isReady && (
            <div className="text-gray-500">Enter both pickup and destination to calculate</div>
          )}
        </div>
      </div>

      {/* Manual Service Test */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Manual Service Test</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
            <input
              type="text"
              value={manualTest.pickup}
              onChange={(e) => setManualTest(prev => ({ ...prev, pickup: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter pickup location"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
            <input
              type="text"
              value={manualTest.destination}
              onChange={(e) => setManualTest(prev => ({ ...prev, destination: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter destination"
            />
          </div>
        </div>

        <button
          onClick={handleManualTest}
          disabled={manualTest.loading || !manualTest.pickup || !manualTest.destination}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {manualTest.loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          Test Distance Calculation
        </button>

        {manualTest.result && (
          <div className="mt-4 bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium text-gray-800 mb-2">Manual Test Result:</h4>
            <pre className="text-sm text-gray-700 bg-white p-2 rounded border overflow-auto">
              {JSON.stringify(manualTest.result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* API Status */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">API Configuration</h4>
        <div className="text-sm text-blue-700">
          <div>Server URL: {import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}</div>
          <div>Google Maps API: {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Configured' : 'Not configured'}</div>
          <div>Authentication: {localStorage.getItem('token') ? 'Token available' : 'No token'}</div>
        </div>
      </div>
    </div>
  );
};

export default DistanceTimeTest;