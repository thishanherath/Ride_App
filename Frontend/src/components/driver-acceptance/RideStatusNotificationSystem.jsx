/**
 * Comprehensive Ride Status Notification System
 * Handles all ride status change notifications including driver assignment
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useDriverAcceptance } from '../../hooks/useDriverAcceptance';
import { RideStatus } from '../../types/driver.types';
import DriverAssignedNotification from './DriverAssignedNotification';
import './RideStatusNotificationSystem.css';

const RideStatusNotificationSystem = ({ 
  rideId, 
  onStatusChange,
  enableSound = true,
  position = 'top-right' 
}) => {
  const {
    driverAcceptance,
    currentStatus,
    driver,
    vehicle,
    estimatedArrival,
    isDriverEnRoute,
    isDriverArrived,
    rideProgressInfo,
    initializeDriverAcceptance,
    cleanupDriverAcceptance
  } = useDriverAcceptance(rideId);

  const [previousStatus, setPreviousStatus] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(enableSound);

  // Initialize monitoring when ride ID changes
  useEffect(() => {
    if (rideId && !driverAcceptance) {
      initializeDriverAcceptance(rideId);
    }

    return () => {
      if (rideId) {
        cleanupDriverAcceptance(rideId);
      }
    };
  }, [rideId, initializeDriverAcceptance, cleanupDriverAcceptance, driverAcceptance]);

  // Play notification sound
  const playNotificationSound = useCallback((type = 'default') => {
    if (!soundEnabled) return;

    try {
      const audio = new Audio();
      switch (type) {
        case 'driver_assigned':
          audio.src = '/sounds/driver-assigned.mp3';
          break;
        case 'driver_arrived':
          audio.src = '/sounds/driver-arrived.mp3';
          break;
        case 'ride_started':
          audio.src = '/sounds/ride-started.mp3';
          break;
        default:
          audio.src = '/sounds/notification.mp3';
      }
      audio.volume = 0.6;
      audio.play().catch(e => console.log('Could not play notification sound:', e));
    } catch (error) {
      console.log('Notification sound not available:', error);
    }
  }, [soundEnabled]);

  // Create notification object
  const createNotification = useCallback((status, data = {}) => {
    const notifications = {
      [RideStatus.DRIVER_ASSIGNED]: {
        id: `driver-assigned-${Date.now()}`,
        type: 'driver_assigned',
        title: 'Driver Assigned!',
        message: `${data.driver?.name || 'Your driver'} has accepted your ride`,
        icon: '✅',
        duration: 5000,
        priority: 'high',
        data: data
      },
      [RideStatus.DRIVER_EN_ROUTE]: {
        id: `driver-enroute-${Date.now()}`,
        type: 'driver_enroute',
        title: 'Driver En Route',
        message: `${data.driver?.name || 'Your driver'} is on the way`,
        icon: '🚗',
        duration: 4000,
        priority: 'medium',
        data: data
      },
      [RideStatus.DRIVER_ARRIVED]: {
        id: `driver-arrived-${Date.now()}`,
        type: 'driver_arrived',
        title: 'Driver Arrived',
        message: `${data.driver?.name || 'Your driver'} has arrived at pickup location`,
        icon: '📍',
        duration: 6000,
        priority: 'high',
        data: data
      },
      [RideStatus.RIDE_STARTED]: {
        id: `ride-started-${Date.now()}`,
        type: 'ride_started',
        title: 'Ride Started',
        message: 'Your ride has begun. Enjoy your trip!',
        icon: '🎯',
        duration: 4000,
        priority: 'medium',
        data: data
      },
      [RideStatus.RIDE_COMPLETED]: {
        id: `ride-completed-${Date.now()}`,
        type: 'ride_completed',
        title: 'Ride Completed',
        message: 'You have arrived at your destination',
        icon: '🏁',
        duration: 5000,
        priority: 'medium',
        data: data
      }
    };

    return notifications[status] || null;
  }, []);

  // Handle status changes
  useEffect(() => {
    if (currentStatus && currentStatus !== previousStatus) {
      const notificationData = {
        driver,
        vehicle,
        estimatedArrival,
        rideAcceptance,
        previousStatus,
        currentStatus
      };

      const notification = createNotification(currentStatus, notificationData);
      
      if (notification) {
        // Add notification to queue
        setNotifications(prev => [...prev, notification]);
        
        // Play sound
        playNotificationSound(notification.type);
        
        // Call status change callback
        if (onStatusChange) {
          onStatusChange({
            status: currentStatus,
            previousStatus,
            notification,
            data: notificationData
          });
        }

        // Auto-remove notification after duration
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, notification.duration);
      }

      setPreviousStatus(currentStatus);
    }
  }, [
    currentStatus, 
    previousStatus, 
    driver, 
    vehicle, 
    estimatedArrival, 
    rideAcceptance,
    createNotification,
    playNotificationSound,
    onStatusChange
  ]);

  // Remove notification manually
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  // Don't render if no notifications
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={`ride-status-notification-system ${position}`}>
      {/* Sound toggle button */}
      <button 
        className="sound-toggle"
        onClick={toggleSound}
        title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
        aria-label={soundEnabled ? 'Disable notification sounds' : 'Enable notification sounds'}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Notification stack */}
      <div className="notification-stack">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className={`status-notification ${notification.type} priority-${notification.priority}`}
            style={{ 
              '--notification-index': index,
              '--total-notifications': notifications.length 
            }}
          >
            <div className="notification-content">
              <div className="notification-header">
                <span className="notification-icon">{notification.icon}</span>
                <div className="notification-text">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                </div>
                <button
                  className="close-notification"
                  onClick={() => removeNotification(notification.id)}
                  aria-label="Close notification"
                >
                  ×
                </button>
              </div>

              {/* Additional content for driver assigned notification */}
              {notification.type === 'driver_assigned' && notification.data.driver && (
                <div className="driver-quick-info">
                  <img 
                    src={notification.data.driver.photo || '/default-driver-avatar.png'}
                    alt={notification.data.driver.name}
                    className="driver-avatar-small"
                    onError={(e) => {
                      e.target.src = '/default-driver-avatar.png';
                    }}
                  />
                  <div className="driver-details-small">
                    <span className="driver-name">{notification.data.driver.name}</span>
                    <span className="vehicle-info">
                      {notification.data.vehicle?.color} {notification.data.vehicle?.make}
                    </span>
                    {notification.data.estimatedArrival !== null && (
                      <span className="eta">
                        ETA: {notification.data.estimatedArrival === 0 
                          ? 'Arrived' 
                          : `${notification.data.estimatedArrival} min`
                        }
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Progress bar for timed notifications */}
              <div 
                className="notification-progress"
                style={{ 
                  animationDuration: `${notification.duration}ms` 
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RideStatusNotificationSystem;