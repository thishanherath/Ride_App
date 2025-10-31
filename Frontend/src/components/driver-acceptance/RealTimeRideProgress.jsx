/**
 * Real-time Ride Progress Component
 * Automatically updates the progress slider when driver accepts the ride
 */

import React, { useEffect, useState } from 'react';
import { useDriverAcceptance } from '../../hooks/useDriverAcceptance';
import { RideStatus } from '../../types/driver.types';
import './RealTimeRideProgress.css';

const RealTimeRideProgress = ({ rideId, onProgressChange }) => {
  const {
    currentStatus,
    rideProgressInfo,
    isLoading,
    initializeDriverAcceptance,
    cleanupDriverAcceptance
  } = useDriverAcceptance(rideId);

  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Initialize monitoring when component mounts
  useEffect(() => {
    if (rideId) {
      initializeDriverAcceptance(rideId);
    }

    return () => {
      if (rideId) {
        cleanupDriverAcceptance(rideId);
      }
    };
  }, [rideId, initializeDriverAcceptance, cleanupDriverAcceptance]);

  // Update progress when status changes
  useEffect(() => {
    if (rideProgressInfo) {
      const targetProgress = rideProgressInfo.progress;
      const targetStep = rideProgressInfo.currentStepIndex;

      // Animate progress bar
      const duration = 1000; // 1 second animation
      const startProgress = animatedProgress;
      const progressDiff = targetProgress - startProgress;
      const startTime = Date.now();

      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentProgress = startProgress + (progressDiff * easeOutCubic);
        
        setAnimatedProgress(currentProgress);
        
        if (progress < 1) {
          requestAnimationFrame(animateProgress);
        } else {
          setAnimatedProgress(targetProgress);
        }
      };

      requestAnimationFrame(animateProgress);
      setCurrentStep(targetStep);

      // Call progress change callback
      if (onProgressChange) {
        onProgressChange({
          progress: targetProgress,
          step: targetStep,
          status: currentStatus,
          stepInfo: rideProgressInfo
        });
      }
    }
  }, [rideProgressInfo, currentStatus, onProgressChange]);

  // Default steps if no ride progress info
  const defaultSteps = [
    { label: 'Confirm Booking', status: RideStatus.BOOKING_CONFIRMED, completed: true },
    { label: 'Finding Driver', status: 'finding_driver', completed: false },
    { label: 'Driver Assigned', status: RideStatus.DRIVER_ASSIGNED, completed: false }
  ];

  const steps = rideProgressInfo?.steps || defaultSteps;
  const progress = animatedProgress || 0;

  return (
    <div className="real-time-ride-progress">
      <div className="progress-header">
        <h3 className="progress-title">
          {currentStatus === RideStatus.DRIVER_ASSIGNED 
            ? 'Driver Found!' 
            : currentStatus === RideStatus.DRIVER_EN_ROUTE
            ? 'Driver En Route'
            : currentStatus === RideStatus.DRIVER_ARRIVED
            ? 'Driver Arrived'
            : isLoading 
            ? 'Finding your driver'
            : 'We\'re connecting you with nearby drivers'
          }
        </h3>
        <p className="progress-subtitle">
          {currentStatus === RideStatus.DRIVER_ASSIGNED 
            ? 'Your driver is preparing to pick you up'
            : currentStatus === RideStatus.DRIVER_EN_ROUTE
            ? 'Your driver is on the way'
            : currentStatus === RideStatus.DRIVER_ARRIVED
            ? 'Your driver has arrived at the pickup location'
            : 'Please wait while we find the best driver for you'
          }
        </p>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-track">
          <div 
            className="progress-fill"
            style={{ 
              width: `${progress}%`,
              transition: 'width 0.3s ease-out'
            }}
          />
          <div 
            className="progress-glow"
            style={{ 
              width: `${progress}%`,
              opacity: progress > 0 ? 1 : 0
            }}
          />
        </div>
        
        {/* Progress percentage */}
        <div className="progress-percentage">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Step indicators */}
      <div className="step-indicators">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`step-indicator ${
              index <= currentStep ? 'completed' : ''
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

      {/* Loading animation when searching for driver */}
      {isLoading && currentStatus !== RideStatus.DRIVER_ASSIGNED && (
        <div className="searching-animation">
          <div className="searching-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <p>Searching for nearby drivers...</p>
        </div>
      )}

      {/* Success animation when driver is found */}
      {currentStatus === RideStatus.DRIVER_ASSIGNED && (
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
    </div>
  );
};

export default RealTimeRideProgress;