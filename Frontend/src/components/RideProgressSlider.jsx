/**
 * Simple Auto-updating Ride Progress Slider
 * Integrates directly with existing socket system - no complex state management needed
 */

import React, { useState, useEffect, useContext } from 'react';
import { SocketDataContext } from '../contexts/SocketContext';
import './RideProgressSlider.css';

const RideProgressSlider = ({ 
  rideId, 
  initialProgress = 20,
  onDriverAccepted,
  showSteps = true,
  className = ''
}) => {
  const { socket } = useContext(SocketDataContext);
  const [progress, setProgress] = useState(initialProgress);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSearching, setIsSearching] = useState(true);
  const [driverInfo, setDriverInfo] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Steps configuration
  const steps = [
    { label: 'Confirm Booking', completed: true },
    { label: 'Finding Driver', completed: false },
    { label: 'Driver Assigned', completed: false }
  ];

  // Animate progress smoothly
  const animateProgress = (targetProgress, duration = 1000) => {
    const startProgress = progress;
    const progressDiff = targetProgress - startProgress;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const animationProgress = Math.min(elapsed / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - animationProgress, 3);
      const currentProgress = startProgress + (progressDiff * easeOutCubic);
      
      setProgress(currentProgress);
      
      if (animationProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        setProgress(targetProgress);
      }
    };

    requestAnimationFrame(animate);
  };

  // Listen for socket events
  useEffect(() => {
    if (!socket || !rideId) return;

    console.log('🔌 Setting up socket listeners for ride:', rideId);

    // Listen for ride confirmation (driver accepted)
    const handleRideConfirmed = (data) => {
      console.log('🎉 Ride confirmed event received:', data);
      
      if (data._id === rideId || data.rideId === rideId) {
        setIsSearching(false);
        setShowSuccess(true);
        setCurrentStep(2);
        animateProgress(100);

        // Extract driver info
        const driverData = {
          name: data.captain ? 
            `${data.captain.fullname.firstname} ${data.captain.fullname.lastname}` : 
            'Driver',
          vehicle: data.captain?.vehicle || {},
          estimatedArrival: 5, // Default estimate
          rideId: data._id
        };

        setDriverInfo(driverData);

        // Call callback
        if (onDriverAccepted) {
          onDriverAccepted(driverData);
        }

        // Hide success animation after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
      }
    };

    // Listen for ride started
    const handleRideStarted = (data) => {
      console.log('🚗 Ride started event received:', data);
      if (data._id === rideId || data.rideId === rideId) {
        setCurrentStep(2);
        animateProgress(100);
      }
    };

    // Listen for ride cancelled
    const handleRideCancelled = (data) => {
      console.log('❌ Ride cancelled event received:', data);
      if (data._id === rideId || data.rideId === rideId) {
        setIsSearching(false);
        setCurrentStep(0);
        animateProgress(20);
      }
    };

    // Add event listeners
    socket.on('ride-confirmed', handleRideConfirmed);
    socket.on('ride-started', handleRideStarted);
    socket.on('ride-cancelled', handleRideCancelled);

    // Start with searching state
    setIsSearching(true);
    setCurrentStep(1);
    animateProgress(50);

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up socket listeners for ride:', rideId);
      socket.off('ride-confirmed', handleRideConfirmed);
      socket.off('ride-started', handleRideStarted);
      socket.off('ride-cancelled', handleRideCancelled);
    };
  }, [socket, rideId, onDriverAccepted]);

  const getTitle = () => {
    if (driverInfo) return 'Driver Found!';
    if (isSearching) return 'Finding your driver';
    return 'We\'re connecting you with nearby drivers';
  };

  const getSubtitle = () => {
    if (driverInfo) return `${driverInfo.name} is preparing to pick you up`;
    if (isSearching) return 'Please wait while we find the best driver for you';
    return 'Your ride request has been confirmed';
  };

  return (
    <div className={`ride-progress-slider ${className}`}>
      <div className="progress-header">
        <h3 className="progress-title">{getTitle()}</h3>
        <p className="progress-subtitle">{getSubtitle()}</p>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-track">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="progress-glow"
            style={{ 
              width: `${progress}%`,
              opacity: progress > 0 ? 1 : 0
            }}
          />
        </div>
        <div className="progress-percentage">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Step indicators */}
      {showSteps && (
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
      {isSearching && (
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
      {showSuccess && (
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

      {/* Driver info display */}
      {driverInfo && !showSuccess && (
        <div className="driver-info-display">
          <div className="driver-card">
            <div className="driver-avatar">
              {driverInfo.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="driver-details">
              <h4>{driverInfo.name}</h4>
              <p>Your driver is on the way</p>
              <p className="eta">ETA: {driverInfo.estimatedArrival} minutes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideProgressSlider;