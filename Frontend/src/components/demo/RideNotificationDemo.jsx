/**
 * Demo component showing how to integrate ride notifications
 */

import React, { useState, useEffect } from 'react';
import RideNotificationProvider, { useRideNotifications } from '../driver-acceptance/RideNotificationProvider';
import { RideStatus } from '../../types/driver.types';

// Mock ride data for demo
const mockRideData = {
  rideId: 'demo-ride-123',
  driver: {
    id: 'driver-456',
    name: 'John Smith',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    totalRides: 150,
    phoneNumber: '+1234567890',
    isOnline: true,
    currentLocation: {
      latitude: 40.7128,
      longitude: -74.0060
    }
  },
  vehicle: {
    id: 'vehicle-789',
    make: 'Toyota',
    model: 'Camry',
    color: 'Blue',
    licensePlate: 'ABC123',
    type: 'sedan',
    year: 2022,
    capacity: 4
  },
  estimatedArrival: 5
};

const RideNotificationDemoContent = () => {
  const { 
    startMonitoring, 
    stopMonitoring, 
    isMonitoring, 
    notificationHistory,
    clearHistory 
  } = useRideNotifications();

  const [currentStatus, setCurrentStatus] = useState(null);
  const [demoStep, setDemoStep] = useState(0);

  const demoSteps = [
    { status: null, label: 'Waiting for ride booking...' },
    { status: RideStatus.BOOKING_CONFIRMED, label: 'Ride booked, looking for driver...' },
    { status: RideStatus.DRIVER_ASSIGNED, label: 'Driver assigned!' },
    { status: RideStatus.DRIVER_EN_ROUTE, label: 'Driver en route' },
    { status: RideStatus.DRIVER_ARRIVED, label: 'Driver arrived' },
    { status: RideStatus.RIDE_STARTED, label: 'Ride started' },
    { status: RideStatus.RIDE_COMPLETED, label: 'Ride completed' }
  ];

  // Simulate ride progression
  const simulateRideProgression = () => {
    if (!isMonitoring) {
      startMonitoring(mockRideData.rideId);
      setDemoStep(1);
      setCurrentStatus(RideStatus.BOOKING_CONFIRMED);
      
      // Auto-progress through steps
      let step = 2;
      const interval = setInterval(() => {
        if (step < demoSteps.length) {
          setDemoStep(step);
          setCurrentStatus(demoSteps[step].status);
          step++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            stopMonitoring();
            setDemoStep(0);
            setCurrentStatus(null);
          }, 3000);
        }
      }, 3000);
    }
  };

  const resetDemo = () => {
    stopMonitoring();
    setDemoStep(0);
    setCurrentStatus(null);
    clearHistory();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Ride Notification System Demo</h2>
      <p>This demo shows how users are notified when a driver accepts their ride.</p>
      
      <div style={{ 
        background: '#f9fafb', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #e5e7eb'
      }}>
        <h3>Current Status</h3>
        <p><strong>Step {demoStep}:</strong> {demoSteps[demoStep]?.label}</p>
        <p><strong>Monitoring:</strong> {isMonitoring ? 'Active' : 'Inactive'}</p>
        {currentStatus && (
          <p><strong>Status:</strong> {currentStatus}</p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={simulateRideProgression}
          disabled={isMonitoring}
          style={{
            background: isMonitoring ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: isMonitoring ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isMonitoring ? 'Demo Running...' : 'Start Demo'}
        </button>
        
        <button 
          onClick={resetDemo}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Reset Demo
        </button>
      </div>

      {notificationHistory.length > 0 && (
        <div style={{ 
          background: '#f3f4f6', 
          padding: '15px', 
          borderRadius: '8px',
          border: '1px solid #d1d5db'
        }}>
          <h4>Notification History</h4>
          {notificationHistory.map((notification, index) => (
            <div key={notification.id} style={{ 
              marginBottom: '8px', 
              fontSize: '14px',
              color: '#374151'
            }}>
              <strong>{notification.timestamp.toLocaleTimeString()}:</strong> {notification.status}
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: '#fef3c7', 
        borderRadius: '8px',
        border: '1px solid #f59e0b'
      }}>
        <h4>Integration Instructions</h4>
        <p>To integrate this notification system into your app:</p>
        <ol>
          <li>Wrap your app or specific screens with <code>RideNotificationProvider</code></li>
          <li>Use <code>useRideNotifications()</code> hook to control monitoring</li>
          <li>Call <code>startMonitoring(rideId)</code> when a ride is booked</li>
          <li>The system will automatically show notifications when the ride status changes</li>
        </ol>
      </div>
    </div>
  );
};

const RideNotificationDemo = () => {
  const handleDriverAssigned = (driverData) => {
    console.log('Driver assigned:', driverData);
  };

  const handleStatusChange = (statusData) => {
    console.log('Status changed:', statusData);
  };

  return (
    <RideNotificationProvider
      enableSound={true}
      position="top-right"
      onDriverAssigned={handleDriverAssigned}
      onStatusChange={handleStatusChange}
    >
      <RideNotificationDemoContent />
    </RideNotificationProvider>
  );
};

export default RideNotificationDemo;