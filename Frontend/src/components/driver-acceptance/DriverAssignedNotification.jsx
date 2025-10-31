/**
 * Driver Assigned Notification Component
 * Shows real-time notification when a driver accepts the user's ride
 */

import React, { useEffect, useState } from 'react';
import { useDriverAcceptance } from '../../hooks/useDriverAcceptance';
import { RideStatus } from '../../types/driver.types';
import './DriverAssignedNotification.css';

const DriverAssignedNotification = ({ rideId, onDriverAssigned }) => {
  const {
    driverAcceptance,
    currentStatus,
    driver,
    vehicle,
    estimatedArrival,
    isLoading,
    error,
    initializeDriverAcceptance,
    cleanupDriverAcceptance
  } = useDriverAcceptance(rideId);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationShown, setNotificationShown] = useState(false);

  // Initialize driver acceptance monitoring when component mounts
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

  // Show notification when driver is assigned
  useEffect(() => {
    if (currentStatus === RideStatus.DRIVER_ASSIGNED && driver && !notificationShown) {
      setShowNotification(true);
      setNotificationShown(true);
      
      // Call callback if provided
      if (onDriverAssigned) {
        onDriverAssigned({
          driver,
          vehicle,
          estimatedArrival,
          rideAcceptance
        });
      }

      // Auto-hide notification after 5 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentStatus, driver, notificationShown, onDriverAssigned, vehicle, estimatedArrival, rideAcceptance]);

  // Don't render anything if no driver is assigned yet
  if (!showNotification || !driver) {
    return null;
  }

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const handleViewDetails = () => {
    setShowNotification(false);
    // This could navigate to a detailed driver view or expand the ride details
    if (onDriverAssigned) {
      onDriverAssigned({
        driver,
        vehicle,
        estimatedArrival,
        rideAcceptance,
        action: 'view_details'
      });
    }
  };

  return (
    <div className={`driver-assigned-notification ${showNotification ? 'show' : ''}`}>
      <div className="notification-content">
        <div className="notification-header">
          <div className="success-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#10B981"/>
              <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="notification-title">
            <h3>Driver Assigned!</h3>
            <p>Your ride has been accepted</p>
          </div>
          <button 
            className="close-button"
            onClick={handleCloseNotification}
            aria-label="Close notification"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="driver-info">
          <div className="driver-avatar">
            <img 
              src={driver.photo || '/default-driver-avatar.png'} 
              alt={`${driver.name}'s profile`}
              onError={(e) => {
                e.target.src = '/default-driver-avatar.png';
              }}
            />
            <div className="rating-badge">
              <span>★ {driver.rating.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="driver-details">
            <h4>{driver.name}</h4>
            <p className="vehicle-info">
              {vehicle.color} {vehicle.make} {vehicle.model}
            </p>
            <p className="license-plate">{vehicle.licensePlate}</p>
            {estimatedArrival !== null && (
              <p className="arrival-time">
                {estimatedArrival === 0 
                  ? 'Driver has arrived' 
                  : estimatedArrival === 1 
                    ? 'Arriving in 1 minute'
                    : `Arriving in ${estimatedArrival} minutes`
                }
              </p>
            )}
          </div>
        </div>

        <div className="notification-actions">
          <button 
            className="view-details-button"
            onClick={handleViewDetails}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverAssignedNotification;