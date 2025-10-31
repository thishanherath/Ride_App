/**
 * Ride Search Progress Component
 * Shows progress while searching for drivers and automatically updates when driver accepts
 * Integrates directly with UserHomeScreen's existing socket system
 */

import React, { useState, useEffect, useContext } from 'react';
import { SocketDataContext } from '../contexts/SocketContext';
import { ArrowLeft, MapPin, Clock, Car, CheckCircle, Phone, MessageCircle, RefreshCw } from 'lucide-react';
import { Card, Button } from './ui';
import { formatCurrency } from '../utils/currency';
import './RideSearchProgress.css';

const RideSearchProgress = ({
  pickupLocation,
  destinationLocation,
  selectedVehicle,
  fare,
  onCancel,
  onDriverAccepted,
  rideId,
  onRefresh
}) => {
  const { socket } = useContext(SocketDataContext);
  const [progress, setProgress] = useState(20);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSearching, setIsSearching] = useState(true);
  const [driverInfo, setDriverInfo] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Vehicle icons
  const vehicleIcons = {
    car: Car,
    bike: Car, // You can add specific bike icon
    auto: Car  // You can add specific auto icon
  };

  const VehicleIcon = vehicleIcons[selectedVehicle] || Car;

  // Steps for progress
  const steps = [
    { label: 'Ride Booked', completed: true },
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

  // Search timer
  useEffect(() => {
    if (isSearching) {
      const timer = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSearching]);

  // Initialize progress
  useEffect(() => {
    // Start with searching state
    setCurrentStep(1);
    animateProgress(50);
    setIsSearching(true);
  }, []);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    console.log('🔌 RideSearchProgress: Setting up socket listeners');

    // Listen for ride confirmation (driver accepted)
    const handleRideConfirmed = (data) => {
      console.log('🎉 RideSearchProgress: Ride confirmed event received:', data);
      
      setIsSearching(false);
      setShowSuccess(true);
      setCurrentStep(2);
      animateProgress(100);

      // Extract driver info
      const driverData = {
        name: data.captain ? 
          `${data.captain.fullname.firstname} ${data.captain.fullname.lastname}` : 
          'Driver',
        phone: data.captain?.phone || '',
        vehicle: data.captain?.vehicle || {},
        rating: data.captain?.rating || 4.5,
        estimatedArrival: 5, // Default estimate
        rideId: data._id,
        captain: data.captain
      };

      setDriverInfo(driverData);

      // Call callback
      if (onDriverAccepted) {
        onDriverAccepted(driverData);
      }

      // Hide success animation after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    };

    // Add event listener
    socket.on('ride-confirmed', handleRideConfirmed);

    // Cleanup
    return () => {
      console.log('🧹 RideSearchProgress: Cleaning up socket listeners');
      socket.off('ride-confirmed', handleRideConfirmed);
    };
  }, [socket, onDriverAccepted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle refresh for booking updates
  const handleRefresh = async () => {
    if (isRefreshing || driverInfo) return;
    
    setIsRefreshing(true);
    console.log('🔄 Refreshing ride status...');
    
    try {
      // Call the refresh callback if provided
      if (onRefresh) {
        await onRefresh(rideId);
      }
      
      // Reset search animation to show activity
      setProgress(30);
      setTimeout(() => {
        if (isSearching) {
          animateProgress(50);
        }
      }, 200);
      
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  return (
    <div className="ride-search-progress">
      <Card className="bg-white rounded-t-3xl shadow-2xl border-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {driverInfo ? 'Driver Found!' : isSearching ? 'Finding your driver' : 'Connecting...'}
          </h1>
          
          {/* Refresh Button */}
          {isSearching && !driverInfo && (
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-full transition-all duration-200 ${
                isRefreshing 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-orange-600'
              }`}
              title="Refresh booking status"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress Header */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {driverInfo ? `${driverInfo.name} is your driver` : 
               isSearching ? 'Looking for nearby drivers' : 
               'We\'re connecting you with drivers'}
            </h2>
            <p className="text-gray-600">
              {driverInfo ? 'Your driver is preparing to pick you up' :
               isSearching ? `Searching for ${formatTime(searchTime)}${isRefreshing ? ' • Refreshing...' : ''}` :
               'Please wait while we find the best driver for you'}
            </p>
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

          {/* Step Indicators */}
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
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="step-number">{index + 1}</span>
                  )}
                </div>
                <span className="step-label">{step.label}</span>
              </div>
            ))}
          </div>

          {/* Ride Details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <VehicleIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 capitalize">{selectedVehicle}</h3>
                <p className="text-sm text-gray-600">{formatCurrency(fare[selectedVehicle])}</p>
              </div>
            </div>

            {/* Route */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-700">Pickup</p>
                  <p className="text-gray-900 text-sm">{pickupLocation}</p>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="w-0.5 h-6 bg-gray-300 rounded-full" />
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700">Destination</p>
                  <p className="text-gray-900 text-sm">{destinationLocation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Searching Animation */}
          {isSearching && (
            <div className="searching-animation">
              <div className="searching-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
              <p className="text-center text-gray-600 mt-3">
                Searching for nearby drivers...
              </p>
            </div>
          )}

          {/* Success Animation */}
          {showSuccess && (
            <div className="driver-found-animation">
              <div className="success-checkmark">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <p className="success-message">Driver assigned successfully!</p>
            </div>
          )}

          {/* Driver Info */}
          {driverInfo && !showSuccess && (
            <div className="driver-info-card">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="driver-avatar">
                  {driverInfo.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{driverInfo.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span>⭐ {driverInfo.rating}</span>
                    <span>•</span>
                    <span>ETA: 5 min</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {driverInfo.phone && (
                    <button className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
                      <Phone className="w-4 h-4 text-green-600" />
                    </button>
                  )}
                  <button className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cancel Button */}
          {isSearching && (
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={onCancel}
            >
              Cancel Ride
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default RideSearchProgress;