/**
 * Sidebar Navigation Test
 * Tests if sidebar navigation is working properly
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SidebarNavigationTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, { test, result, details, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testNavigation = (path, description) => {
    console.log(`🧪 Testing navigation to: ${path}`);
    addTestResult(description, 'Testing...', `Navigating to ${path}`);
    
    try {
      navigate(path);
      setTimeout(() => {
        if (window.location.pathname === path) {
          addTestResult(description, 'SUCCESS', `Successfully navigated to ${path}`);
          console.log(`✅ Navigation to ${path} successful`);
        } else {
          addTestResult(description, 'FAILED', `Expected ${path}, got ${window.location.pathname}`);
          console.log(`❌ Navigation to ${path} failed`);
        }
      }, 100);
    } catch (error) {
      addTestResult(description, 'ERROR', error.message);
      console.error(`❌ Navigation to ${path} failed:`, error);
    }
  };

  const testUserData = () => {
    const userData = localStorage.getItem('userData');
    const token = localStorage.getItem('token');
    
    addTestResult('User Data Check', userData ? 'SUCCESS' : 'FAILED', 
      userData ? `User data exists: ${JSON.parse(userData)?.data?.fullname?.firstname || 'No name'}` : 'No user data found');
    
    addTestResult('Token Check', token ? 'SUCCESS' : 'FAILED', 
      token ? 'Token exists' : 'No token found');
    
    console.log('User Data:', userData ? JSON.parse(userData) : 'None');
    console.log('Token:', token ? 'Present' : 'None');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="fixed top-4 left-4 bg-white p-4 rounded-lg shadow-lg border z-50 max-w-md max-h-96 overflow-y-auto">
      <h3 className="font-bold mb-2">Sidebar Navigation Test</h3>
      <p className="text-sm text-gray-600 mb-2">Current: {location.pathname}</p>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={() => testNavigation('/user/rides', 'User Ride History')}
          className="block w-full px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Test /user/rides
        </button>
        
        <button
          onClick={() => testNavigation('/captain/rides', 'Captain Ride History')}
          className="block w-full px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          Test /captain/rides
        </button>
        
        <button
          onClick={() => testNavigation('/user/home', 'User Home')}
          className="block w-full px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
        >
          Test /user/home
        </button>
        
        <button
          onClick={testUserData}
          className="block w-full px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
        >
          Test User Data
        </button>
        
        <button
          onClick={clearResults}
          className="block w-full px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      {/* Test Results */}
      <div className="space-y-1">
        <h4 className="font-semibold text-sm">Test Results:</h4>
        {testResults.map((result, index) => (
          <div key={index} className={`text-xs p-2 rounded ${
            result.result === 'SUCCESS' ? 'bg-green-100 text-green-800' :
            result.result === 'FAILED' ? 'bg-red-100 text-red-800' :
            result.result === 'ERROR' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            <div className="font-medium">{result.test}</div>
            <div className="text-xs opacity-75">{result.details}</div>
            <div className="text-xs opacity-50">{result.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarNavigationTest;