/**
 * Ride Notification Provider
 * Easy-to-use wrapper component for integrating ride notifications into any screen
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import RideStatusNotificationSystem from './RideStatusNotificationSystem';

const RideNotificationContext = createContext();

export const useRideNotifications = () => {
  const context = useContext(RideNotificationContext);
  if (!context) {
    throw new Error('useRideNotifications must be used within a RideNotificationProvider');
  }
  return context;
};

const RideNotificationProvider = ({ 
  children, 
  enableSound = true,
  position = 'top-right',
  onDriverAssigned,
  onStatusChange 
}) => {
  const [activeRideId, setActiveRideId] = useState(null);
  const [notificationHistory, setNotificationHistory] = useState([]);

  // Start monitoring a ride
  const startMonitoring = useCallback((rideId) => {
    if (rideId && rideId !== activeRideId) {
      setActiveRideId(rideId);
    }
  }, [activeRideId]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setActiveRideId(null);
  }, []);

  // Handle status changes
  const handleStatusChange = useCallback((statusData) => {
    // Add to history
    setNotificationHistory(prev => [...prev, {
      ...statusData,
      timestamp: new Date(),
      id: `status-${Date.now()}`
    }]);

    // Call external callback
    if (onStatusChange) {
      onStatusChange(statusData);
    }

    // Handle driver assigned specifically
    if (statusData.status === 'driver_assigned' && onDriverAssigned) {
      onDriverAssigned(statusData.data);
    }
  }, [onStatusChange, onDriverAssigned]);

  // Clear notification history
  const clearHistory = useCallback(() => {
    setNotificationHistory([]);
  }, []);

  // Get latest notification
  const getLatestNotification = useCallback(() => {
    return notificationHistory[notificationHistory.length - 1] || null;
  }, [notificationHistory]);

  const contextValue = {
    activeRideId,
    notificationHistory,
    startMonitoring,
    stopMonitoring,
    clearHistory,
    getLatestNotification,
    isMonitoring: !!activeRideId
  };

  return (
    <RideNotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Render notification system if monitoring a ride */}
      {activeRideId && (
        <RideStatusNotificationSystem
          rideId={activeRideId}
          enableSound={enableSound}
          position={position}
          onStatusChange={handleStatusChange}
        />
      )}
    </RideNotificationContext.Provider>
  );
};

export default RideNotificationProvider;