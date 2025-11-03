/**
 * Example showing how to replace static progress bars with auto-updating ones
 */

import React, { useState } from 'react';
import AutoUpdatingRideProgress from './AutoUpdatingRideProgress';

// BEFORE: Static progress bar that doesn't update
const StaticProgressBar = ({ progress = 50 }) => (
  <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px', marginBottom: '20px' }}>
    <h3>❌ Old Static Progress Bar</h3>
    <p>Finding your driver</p>
    <div style={{ 
      width: '100%', 
      height: '8px', 
      background: '#e5e7eb', 
      borderRadius: '4px',
      marginBottom: '10px'
    }}>
      <div style={{ 
        width: `${progress}%`, 
        height: '100%', 
        background: '#f97316', 
        borderRadius: '4px' 
      }} />
    </div>
    <p style={{ fontSize: '12px', color: '#6b7280' }}>
      ⚠️ This progress bar stays at {progress}% until page refresh
    </p>
  </div>
);

// AFTER: Auto-updating progress bar
const AutoUpdatingProgressExample = ({ rideId }) => {
  const [driverInfo, setDriverInfo] = useState(null);

  const handleDriverAccepted = (data) => {
    setDriverInfo(data);
    console.log('Driver accepted:', data);
  };

  const handleProgressUpdate = (data) => {
    console.log('Progress updated:', data);
  };

  return (
    <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #10b981' }}>
      <h3>✅ New Auto-updating Progress Bar</h3>
      
      <AutoUpdatingRideProgress
        rideId={rideId}
        onDriverAccepted={handleDriverAccepted}
        onProgressUpdate={handleProgressUpdate}
        showSteps={true}
        showPercentage={true}
      />
      
      {driverInfo && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: 'white', 
          borderRadius: '6px',
          border: '1px solid #d1fae5'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#10b981' }}>
            🎉 Driver Automatically Assigned!
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
            {driverInfo.driver?.name} • {driverInfo.vehicle?.color} {driverInfo.vehicle?.make}
            {driverInfo.estimatedArrival && ` • ETA: ${driverInfo.estimatedArrival} min`}
          </p>
        </div>
      )}
      
      <p style={{ fontSize: '12px', color: '#059669', marginTop: '10px', marginBottom: 0 }}>
        ✨ This progress bar updates automatically when driver accepts - no refresh needed!
      </p>
    </div>
  );
};

// Compact version for smaller spaces
const CompactProgressExample = ({ rideId }) => (
  <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
    <h4 style={{ margin: '0 0 12px 0' }}>Compact Version</h4>
    
    <AutoUpdatingRideProgress
      rideId={rideId}
      compact={true}
      showSteps={false}
      showPercentage={true}
      onDriverAccepted={(data) => console.log('Compact: Driver accepted', data)}
    />
    
    <p style={{ fontSize: '11px', color: '#92400e', margin: '8px 0 0 0' }}>
      Perfect for smaller UI spaces
    </p>
  </div>
);

// Main demo component
const ProgressBarReplacementDemo = () => {
  const [mockRideId, setMockRideId] = useState(null);
  const [staticProgress, setStaticProgress] = useState(50);

  const startDemo = () => {
    const rideId = `demo-ride-${Date.now()}`;
    setMockRideId(rideId);
  };

  const resetDemo = () => {
    setMockRideId(null);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Progress Bar Replacement Demo</h1>
      <p>See the difference between static and auto-updating progress bars</p>

      {/* Static Progress Bar */}
      <StaticProgressBar progress={staticProgress} />
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button 
          onClick={() => setStaticProgress(prev => Math.min(prev + 10, 100))}
          style={{
            background: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            marginRight: '8px',
            cursor: 'pointer'
          }}
        >
          Manually Update Static Bar
        </button>
        <button 
          onClick={() => setStaticProgress(20)}
          style={{
            background: '#9ca3af',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset Static Bar
        </button>
      </div>

      {/* Auto-updating Progress Bar */}
      {mockRideId ? (
        <AutoUpdatingProgressExample rideId={mockRideId} />
      ) : (
        <div style={{ 
          padding: '40px', 
          background: '#f3f4f6', 
          borderRadius: '8px', 
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
            Click below to see the auto-updating progress bar in action
          </p>
          <button 
            onClick={startDemo}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Start Auto-updating Demo
          </button>
        </div>
      )}

      {mockRideId && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button 
            onClick={resetDemo}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reset Demo
          </button>
        </div>
      )}

      {/* Compact Version */}
      {mockRideId && <CompactProgressExample rideId={`${mockRideId}-compact`} />}

      {/* Integration Instructions */}
      <div style={{ 
        marginTop: '40px', 
        padding: '24px', 
        background: '#eff6ff', 
        borderRadius: '8px',
        border: '1px solid #3b82f6'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1e40af' }}>
          🔧 How to Replace Your Static Progress Bar
        </h3>
        
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>1. Replace your existing progress bar:</h4>
          <pre style={{ 
            background: '#f1f5f9', 
            padding: '12px', 
            borderRadius: '4px', 
            fontSize: '12px',
            overflow: 'auto'
          }}>
{`// OLD: Static progress bar
<div className="progress-bar">
  <div style={{ width: '50%' }} />
</div>

// NEW: Auto-updating progress bar
<AutoUpdatingRideProgress
  rideId={rideId}
  onDriverAccepted={handleDriverAccepted}
/>`}
          </pre>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>2. Handle driver acceptance:</h4>
          <pre style={{ 
            background: '#f1f5f9', 
            padding: '12px', 
            borderRadius: '4px', 
            fontSize: '12px',
            overflow: 'auto'
          }}>
{`const handleDriverAccepted = (driverData) => {
  // Driver automatically assigned!
  console.log('Driver:', driverData.driver.name);
  console.log('Vehicle:', driverData.vehicle);
  console.log('ETA:', driverData.estimatedArrival);
  
  // Update your UI, show driver details, etc.
};`}
          </pre>
        </div>

        <div>
          <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>3. That's it! 🎉</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
            <li>Progress automatically updates when driver accepts</li>
            <li>No manual refresh or polling needed</li>
            <li>Real-time WebSocket updates</li>
            <li>Smooth animations and visual feedback</li>
            <li>Works on mobile and desktop</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProgressBarReplacementDemo;