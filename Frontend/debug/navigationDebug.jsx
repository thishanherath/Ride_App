/**
 * Navigation Debug Component
 * Tests and debugs the Ride History navigation issue
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationDebug = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);

  const addDebugInfo = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        setUserData(parsed);
        addDebugInfo(`User data loaded: ${JSON.stringify(parsed)}`, 'success');
      } catch (error) {
        addDebugInfo(`Failed to parse user data: ${error.message}`, 'error');
      }
    } else {
      addDebugInfo('No user data found in localStorage', 'warning');
    }

    // Log current location
    addDebugInfo(`Current location: ${location.pathname}`, 'info');
  }, [location]);

  const testNavigation = (path, description) => {
    addDebugInfo(`Testing navigation to: ${path} (${description})`, 'info');
    try {
      navigate(path);
      addDebugInfo(`Navigation successful to: ${path}`, 'success');
    } catch (error) {
      addDebugInfo(`Navigation failed: ${error.message}`, 'error');
    }
  };

  const testSidebarNavigation = () => {
    if (!userData) {
      addDebugInfo('Cannot test sidebar navigation - no user data', 'error');
      return;
    }

    const userType = userData.type;
    const rideHistoryPath = `/${userType}/rides`;
    
    addDebugInfo(`User type: ${userType}`, 'info');
    addDebugInfo(`Expected ride history path: ${rideHistoryPath}`, 'info');
    
    testNavigation(rideHistoryPath, 'Sidebar Ride History');
  };

  const clearDebugInfo = () => {
    setDebugInfo([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Navigation Debug Tool</h1>
          
          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Current Location</h3>
              <p className="text-blue-700">{location.pathname}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">User Type</h3>
              <p className="text-green-700">{userData?.type || 'Not loaded'}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Token Status</h3>
              <p className="text-purple-700">
                {localStorage.getItem('token') ? 'Present' : 'Missing'}
              </p>
            </div>
          </div>

          {/* User Data Display */}
          {userData && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">User Data Structure</h3>
              <pre className="text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          )}

          {/* Test Buttons */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-800">Navigation Tests</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={testSidebarNavigation}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Test Sidebar Navigation
              </button>
              
              <button
                onClick={() => testNavigation('/user/rides', 'Direct User Route')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Test /user/rides
              </button>
              
              <button
                onClick={() => testNavigation('/captain/rides', 'Direct Captain Route')}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Test /captain/rides
              </button>
              
              <button
                onClick={clearDebugInfo}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear Debug
              </button>
            </div>
          </div>

          {/* Debug Log */}
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg max-h-96 overflow-y-auto">
            <h3 className="text-green-300 mb-2">Debug Log</h3>
            {debugInfo.length === 0 ? (
              <p className="text-gray-500">No debug information yet...</p>
            ) : (
              debugInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-2 mb-1 text-sm">
                  <span className="text-gray-500">{info.timestamp}</span>
                  <span className={`${
                    info.type === 'error' ? 'text-red-400' :
                    info.type === 'success' ? 'text-green-400' :
                    info.type === 'warning' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}>
                    [{info.type.toUpperCase()}]
                  </span>
                  <span>{info.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Navigation Panel */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Home
            </button>
            
            <button
              onClick={() => navigate('/user/home')}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              User Home
            </button>
            
            <button
              onClick={() => navigate('/captain/home')}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Captain Home
            </button>
            
            <button
              onClick={() => navigate('/login')}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationDebug;