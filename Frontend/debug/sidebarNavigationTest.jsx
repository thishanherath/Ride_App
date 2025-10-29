/**
 * Sidebar Navigation Test Component
 * Tests the exact navigation issue with Ride History button
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History } from 'lucide-react';

const SidebarNavigationTest = () => {
  const [userData, setUserData] = useState(null);
  const [debugLog, setDebugLog] = useState([]);
  const navigate = useNavigate();

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(`[SIDEBAR TEST] ${message}`);
  };

  useEffect(() => {
    // Get user data exactly like the sidebar does
    const storedUserData = localStorage.getItem("userData");
    addLog(`Raw userData from localStorage: ${storedUserData}`);
    
    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        setUserData(parsed);
        addLog(`Parsed userData: ${JSON.stringify(parsed)}`);
        addLog(`User type: ${parsed?.type}`);
      } catch (error) {
        addLog(`Error parsing userData: ${error.message}`);
      }
    } else {
      addLog("No userData found in localStorage");
    }
  }, []);

  const testRideHistoryNavigation = () => {
    addLog("=== TESTING RIDE HISTORY NAVIGATION ===");
    addLog(`User data available: ${userData ? 'Yes' : 'No'}`);
    
    if (!userData) {
      addLog("ERROR: No user data available");
      return;
    }
    
    addLog(`User type: ${userData.type}`);
    
    if (!userData.type) {
      addLog("ERROR: No user type found");
      return;
    }
    
    const targetPath = `/${userData.type}/rides`;
    addLog(`Target path: ${targetPath}`);
    
    try {
      addLog("Attempting navigation...");
      navigate(targetPath);
      addLog("Navigation command executed successfully");
    } catch (error) {
      addLog(`Navigation error: ${error.message}`);
    }
  };

  const testDirectNavigation = () => {
    addLog("=== TESTING DIRECT NAVIGATION ===");
    try {
      navigate('/user/rides');
      addLog("Direct navigation to /user/rides executed");
    } catch (error) {
      addLog(`Direct navigation error: ${error.message}`);
    }
  };

  const testWindowLocation = () => {
    addLog("=== TESTING WINDOW LOCATION ===");
    try {
      window.location.href = '/user/rides';
      addLog("Window location change executed");
    } catch (error) {
      addLog(`Window location error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sidebar Navigation Test</h1>
          
          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">User Data Status</h3>
              <p className="text-blue-700">{userData ? 'Loaded' : 'Not loaded'}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">User Type</h3>
              <p className="text-green-700">{userData?.type || 'Unknown'}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Target Path</h3>
              <p className="text-purple-700">{userData?.type ? `/${userData.type}/rides` : 'Cannot determine'}</p>
            </div>
          </div>

          {/* User Data Display */}
          {userData && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Complete User Data</h3>
              <pre className="text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          )}

          {/* Test Buttons */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-800">Navigation Tests</h3>
            
            {/* Exact Sidebar Button Replica */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-2">Exact Sidebar Button Replica</h4>
              <div
                onClick={() => {
                  console.log("Ride History clicked, user type:", userData?.type);
                  if (userData?.type) {
                    const targetPath = `/${userData.type}/rides`;
                    console.log("Navigating to:", targetPath);
                    navigate(targetPath);
                  } else {
                    console.error("Cannot navigate: no user type found");
                  }
                }}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-gray-200"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <History className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Ride History</h4>
                  <p className="text-sm text-gray-500">View past trips</p>
                </div>
              </div>
            </div>

            {/* Test Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={testRideHistoryNavigation}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Test Navigation Logic
              </button>
              
              <button
                onClick={testDirectNavigation}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Test Direct /user/rides
              </button>
              
              <button
                onClick={testWindowLocation}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Test Window Location
              </button>
              
              <button
                onClick={() => setDebugLog([])}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear Log
              </button>
            </div>
          </div>

          {/* Debug Log */}
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg max-h-96 overflow-y-auto">
            <h3 className="text-green-300 mb-2">Debug Log</h3>
            {debugLog.length === 0 ? (
              <p className="text-gray-500">No debug information yet...</p>
            ) : (
              debugLog.map((log, index) => (
                <div key={index} className="text-sm mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Go Home
            </button>
            
            <button
              onClick={() => navigate('/user/rides')}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Force /user/rides
            </button>
            
            <button
              onClick={() => navigate('/captain/rides')}
              className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Force /captain/rides
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarNavigationTest;