/**
 * Sidebar Debug Component
 * Identifies issues with the Ride History navigation in sidebar
 */

import React, { useEffect, useState } from 'react';
import { ChevronRight, History } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const SidebarDebug = () => {
  const [userData, setUserData] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);
  const navigate = useNavigate();

  const addDebugInfo = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  useEffect(() => {
    // Simulate the same logic as the original Sidebar component
    const storedUserData = localStorage.getItem('userData');
    
    addDebugInfo('Checking localStorage for userData...', 'info');
    
    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        setUserData(parsed);
        addDebugInfo(`Raw userData: ${storedUserData}`, 'info');
        addDebugInfo(`Parsed userData: ${JSON.stringify(parsed)}`, 'success');
        addDebugInfo(`User type: ${parsed?.type}`, 'info');
        addDebugInfo(`User data structure: ${Object.keys(parsed).join(', ')}`, 'info');
      } catch (error) {
        addDebugInfo(`Failed to parse userData: ${error.message}`, 'error');
      }
    } else {
      addDebugInfo('No userData found in localStorage', 'warning');
    }
  }, []);

  const testRideHistoryNavigation = () => {
    if (!userData) {
      addDebugInfo('Cannot navigate - no user data available', 'error');
      return;
    }

    const userType = userData.type;
    const rideHistoryPath = `/${userType}/rides`;
    
    addDebugInfo(`Attempting navigation to: ${rideHistoryPath}`, 'info');
    
    try {
      navigate(rideHistoryPath);
      addDebugInfo(`Navigation successful to: ${rideHistoryPath}`, 'success');
    } catch (error) {
      addDebugInfo(`Navigation failed: ${error.message}`, 'error');
    }
  };

  const testDirectNavigation = (path) => {
    addDebugInfo(`Testing direct navigation to: ${path}`, 'info');
    try {
      navigate(path);
      addDebugInfo(`Direct navigation successful to: ${path}`, 'success');
    } catch (error) {
      addDebugInfo(`Direct navigation failed: ${error.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sidebar Navigation Debug</h1>
          <p className="text-gray-600">Debugging the Ride History button navigation issue</p>
        </div>

        {/* User Data Analysis */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Data Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">User Type</h3>
              <p className="text-blue-700">{userData?.type || 'Not available'}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Expected Path</h3>
              <p className="text-green-700">
                {userData?.type ? `/${userData.type}/rides` : 'Cannot determine'}
              </p>
            </div>
          </div>

          {userData && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Complete User Data</h3>
              <pre className="text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Navigation Tests */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation Tests</h2>
          
          <div className="space-y-4">
            {/* Simulated Sidebar Link */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Simulated Sidebar Link</h3>
              
              {userData?.type ? (
                <Link
                  to={`/${userData.type}/rides`}
                  className="flex items-center justify-between py-4 cursor-pointer hover:bg-zinc-100 rounded-xl px-3 border border-gray-200"
                  onClick={() => addDebugInfo(`Link clicked: /${userData.type}/rides`, 'info')}
                >
                  <div className="flex gap-3">
                    <History /> <h1>Ride History</h1>
                  </div>
                  <div>
                    <ChevronRight />
                  </div>
                </Link>
              ) : (
                <div className="text-red-600 p-4 bg-red-50 rounded">
                  Cannot create link - user type not available
                </div>
              )}
            </div>

            {/* Manual Navigation Buttons */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Manual Navigation Tests</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={testRideHistoryNavigation}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Test Dynamic Path
                </button>
                
                <button
                  onClick={() => testDirectNavigation('/user/rides')}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Test /user/rides
                </button>
                
                <button
                  onClick={() => testDirectNavigation('/captain/rides')}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  Test /captain/rides
                </button>
                
                <button
                  onClick={() => setDebugInfo([])}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Clear Log
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Log */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Log</h2>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg max-h-96 overflow-y-auto">
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

        {/* Potential Issues */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Potential Issues</h2>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-gray-800">User Data Structure</h3>
                <p className="text-gray-600">Check if userData.type is correctly set</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-gray-800">Route Protection</h3>
                <p className="text-gray-600">UserProtectedWrapper might be blocking navigation</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-gray-800">Component Loading</h3>
                <p className="text-gray-600">LazyRideHistory might have loading issues</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarDebug;