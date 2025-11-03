import React, { useEffect, useState } from 'react';
import { useCaptain } from '../src/contexts/CaptainContext';

const CaptainHomeDebug = () => {
  const { captain } = useCaptain();
  const [debugInfo, setDebugInfo] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    console.log('🔍 Captain Home Debug Info:');
    console.log('Token exists:', !!token);
    console.log('Captain data:', captain);
    console.log('Current URL:', window.location.href);
    
    setDebugInfo({
      hasToken: !!token,
      tokenLength: token?.length || 0,
      captainExists: !!captain,
      captainId: captain?._id,
      captainName: captain?.fullname ? `${captain.fullname.firstname} ${captain.fullname.lastname}` : 'No name',
      captainVehicle: captain?.vehicle?.type || 'No vehicle',
      currentUrl: window.location.href
    });
  }, [captain, token]);

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      fontFamily: 'monospace',
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: 9999,
      border: '2px solid #333',
      borderRadius: '8px',
      maxWidth: '400px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>🐛 Captain Home Debug</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Authentication:</strong>
        <div>Has Token: {debugInfo.hasToken ? '✅' : '❌'}</div>
        <div>Token Length: {debugInfo.tokenLength}</div>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Captain Data:</strong>
        <div>Captain Exists: {debugInfo.captainExists ? '✅' : '❌'}</div>
        <div>Captain ID: {debugInfo.captainId || 'None'}</div>
        <div>Captain Name: {debugInfo.captainName}</div>
        <div>Vehicle Type: {debugInfo.captainVehicle}</div>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Environment:</strong>
        <div>Current URL: {debugInfo.currentUrl}</div>
        <div>Server URL: {import.meta.env.VITE_SERVER_URL}</div>
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        Check browser console for more details
      </div>
    </div>
  );
};

export default CaptainHomeDebug;