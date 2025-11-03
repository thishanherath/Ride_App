import React, { useState, useEffect } from 'react';
import { ArrivalTimeEstimate } from '../driver-acceptance';

const ArrivalTimeEstimateDemo = () => {
  const [estimatedArrival, setEstimatedArrival] = useState(5);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [compact, setCompact] = useState(false);

  const handleRefresh = () => {
    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      const newTime = Math.max(0, estimatedArrival + Math.floor(Math.random() * 3) - 1);
      setEstimatedArrival(newTime);
      setLastUpdated(new Date());
      setIsUpdating(false);
    }, 2000);
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isUpdating && estimatedArrival > 0) {
        setEstimatedArrival(prev => Math.max(0, prev - 1));
        setLastUpdated(new Date());
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isUpdating, estimatedArrival]);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>ArrivalTimeEstimate Demo</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Controls</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <button onClick={() => setEstimatedArrival(0)}>Driver Arrived</button>
          <button onClick={() => setEstimatedArrival(1)}>1 Minute</button>
          <button onClick={() => setEstimatedArrival(5)}>5 Minutes</button>
          <button onClick={() => setEstimatedArrival(15)}>15 Minutes</button>
          <button onClick={() => setEstimatedArrival(null)}>No Time</button>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setCompact(!compact)}>
            Toggle {compact ? 'Normal' : 'Compact'}
          </button>
          <button onClick={handleRefresh} disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Manual Refresh'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Current State</h3>
        <p>
          Time: {estimatedArrival === null ? 'No time' : `${estimatedArrival} minutes`} | 
          Updating: {isUpdating ? 'Yes' : 'No'} | 
          Layout: {compact ? 'Compact' : 'Normal'}
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Component</h3>
        <ArrivalTimeEstimate
          estimatedArrival={estimatedArrival}
          isUpdating={isUpdating}
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          compact={compact}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Compact Version</h3>
        <ArrivalTimeEstimate
          estimatedArrival={estimatedArrival}
          isUpdating={isUpdating}
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          compact={true}
        />
      </div>

      <div>
        <h3>Without Refresh</h3>
        <ArrivalTimeEstimate
          estimatedArrival={estimatedArrival}
          isUpdating={isUpdating}
          lastUpdated={lastUpdated}
        />
      </div>
    </div>
  );
};

export default ArrivalTimeEstimateDemo;