/**
 * Auto-updating Ride Progress Component
 * Drop-in replacement for static progress bars that updates automatically when driver accepts
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useDriverAcceptance } from '../../hooks/useDriverAcceptance';
import { RideStatus } from '../../types/driver.types';
import './AutoUpdatingRideProgress.css';

const AutoUpdatingRideProgress = ({ 
  rideId, 
  initialProgress = 20,
  onDriverAccepted,
  onProgressUpdate,
  showSteps = true,
  showPercentage = true,
  compact = false,
  className = ''
}) => {
  const {
    currentStatus,
    driver,
    vehicle,
    estimatedArrival,
    isLoading,
    initializeDriverAcceptance,
    cleanupDriverAcceptance
  } = useDriverAcceptance(rideId);

  const [animatedProgress, setAnimatedProgress] = useState(initialProgress);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize monitoring when rideId is provided
  useEffect(() => {
    if (rideId) {
      initializeDriverAcceptance(rideId);
      setIsSearching(true);
    }

    return () => {
      if (rideId) {
        cleanupDriverAcceptance(rideId);
      }
    };
  }, [rideId, initializeDriverAcceptance, cleanupDriverAcceptance]);

  // Animate progress smoothly
  const animateToProgress = useCallback((targetProgress, duration = 1000) => {
    const startProgress = animatedProgress;
    const progressDiff = targetProgress - startProgress;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentProgress = startProgress + (progressDiff * easeOutCubic);
      
      setAnimatedProgress(currentProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedProgress(targetProgress);
      }
    };

    requestAnimationFrame(animate);
  }, [animatedProgress]);

  // Handle status changes
  useEffect(() => {
    let targetProgress = initialProgress;
    let targetStep = 0;

    switch (currentStatus) {
      case RideStatus.BOOKING_CONFIRMED:
        targetProgress = 20;
        targetStep = 0;
        setIsSearching(true);
        break;
      
      case RideStatus.DRIVER_ASSIGNED:
        targetProgress = 100;
        targetStep = 2;
        setIsSearching(false);
        setShowSuccess(true);
        
        // Call callback when driver is accepted
        if (onDriverAccepted) {
          onDriverAccepted({
            driver,
            vehicle,
            estimatedArrival,
            status: currentStatus
          });
        }
        
        // Hide success animation after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
        break;
      
      case RideStatus.DRIVER_EN_ROUTE:
        targetProgress = 100;
        targetStep = 2;
        setIsSearching(false);
        break;
      
      default:
        if (isLoading) {
          targetProgress = 50;
          targetStep = 1;
          setIsSearching(true);
        }
    }

    animateToProgress(targetProgress);
    setCurrentStep(targetStep);

    // Call progress update callback
    if (onProgressUpdate) {
      onProgressUpdate({
        progress: targetProgress,
        step: targetStep,
        status: currentStatus,
        isSearching,
        driver
      });
    }
  }, [currentStatus, driver, vehicle, estimatedArrival, isLoading, onDriverAccepted, onProgressUpdate, animateToProgress, isSearching]);

  const steps = [
    { label: 'Confirm Booking', completed: true },
    { label: 'Finding Driver', completed: currentStep > 1 },
    { label: 'Driver Assigned', completed: currentStep > 2 }
  ];

  const getTitle = () => {
    if (currentStatus === RideStatus.DRIVER_ASSIGNED) return 'Driver Found!';
    if (currentStatus === RideStatus.DRIVER_EN_ROUTE) return 'Driver En Route';
    if (isSearching) return 'Finding your driver';
    return 'We\'re connecting you with nearby drivers';
  };

  const getSubtitle = () => {
    if (currentStatus === RideStatus.DRIVER_ASSIGNED) return 'Your driver is preparing to pick you up';
    if (currentStatus === RideStatus.DRIVER_EN_ROUTE) return 'Your driver is on the way';
    if (isSearching) return 'Please wait while we find the best driver for you';
    return 'Your ride request has been confirmed';
  };

  return (
    <div className={`auto-updating-ride-progress ${compact ? 'compact' : ''} ${className}`}>
      {!compact && (
        <div className="progress-header">
          <h3 className="progress-title">{getTitle()}</h3>
          <p className="progress-subtitle">{getSubtitle()}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-track">
          <div 
            className="progress-fill"
            style={{ width: `${animatedProgress}%` }}
          />
          <div 
            className="progress-glow"
            style={{ 
              width: `${animatedProgress}%`,
              opacity: animatedProgress > 0 ? 1 : 0
            }}
          />
        </div>
        
        {showPercentage && (
          <div className="progress-percentage">
            {Math.round(animatedProgress)}%
          </div>
        )}
      </div>

      {/* Step indicators */}
      {showSteps && !compact && (
        <div className="step-indicators">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`step-indicator ${
                index < currentStep ? 'completed' : ''
              } ${index === currentStep ? 'active' : ''}`}
            >
              <div className="step-circle">
                {index < currentStep ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M20 6L9 17l-5-5" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className="step-number">{index + 1}</span>
                )}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Searching animation */}
      {isSearching && !compact && (
        <div className="searching-animation">
          <div className="searching-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <p>Searching for nearby drivers...</p>
        </div>
      )}

      {/* Success animation */}
      {showSuccess && !compact && (
        <div className="driver-found-animation">
          <div className="success-checkmark">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#10B981"/>
              <path 
                d="m9 12 2 2 4-4" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="success-message">Driver assigned successfully!</p>
        </div>
      )}

      {/* Compact mode searching indicator */}
      {isSearching && compact && (
        <div className="compact-searching">
          <div className="compact-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <span>Finding driver...</span>
        </div>
      )}
    </div>
  );
};

export default AutoUpdatingRideProgress;