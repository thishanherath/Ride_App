/**
 * Enhanced Ride Action Panel for Captains
 * Handles ride acceptance, cancellation, and status updates
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Navigation,
  User,
  Phone,
  Car,
  AlertTriangle,
  MessageCircle,
  Route
} from 'lucide-react';
import { Card, Button, Badge } from '../ui';
import { formatCurrency } from '../../utils/currency';

const RideActionPanel = ({
  ride,
  onAccept,
  onCancel,
  onStartRide,
  onEndRide,
  loading = false,
  currentStatus = 'pending',
  otp = '',
  onOtpChange,
  className = ''
}) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer for ride duration
  useEffect(() => {
    let interval;
    if (currentStatus === 'ongoing') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setTimeElapsed(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStatus]);

  // Format time elapsed
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle accept ride
  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await onAccept(ride);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle cancel ride
  const handleCancel = async () => {
    if (!confirmCancel) {
      setConfirmCancel(true);
      setTimeout(() => setConfirmCancel(false), 5000); // Auto-reset after 5 seconds
      return;
    }
    
    setActionLoading(true);
    try {
      await onCancel(ride);
      setConfirmCancel(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle start ride
  const handleStartRide = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter the 6-digit OTP from the passenger');
      return;
    }
    
    setActionLoading(true);
    try {
      await onStartRide(ride, otp);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle end ride
  const handleEndRide = async () => {
    setActionLoading(true);
    try {
      await onEndRide(ride);
    } finally {
      setActionLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'accepted': return 'blue';
      case 'ongoing': return 'green';
      case 'completed': return 'gray';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ride Request';
      case 'accepted': return 'Ride Accepted';
      case 'ongoing': return 'Ride in Progress';
      case 'completed': return 'Ride Completed';
      case 'cancelled': return 'Ride Cancelled';
      default: return 'Unknown Status';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`bg-white rounded-t-3xl shadow-2xl ${className}`}
    >
      {/* Panel Handle */}
      <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-6" />
      
      {/* Status Header */}
      <div className="px-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <Badge 
            variant="solid" 
            color={getStatusColor(currentStatus)}
            size="lg"
            className="px-3 py-1"
          >
            {getStatusText(currentStatus)}
          </Badge>
          {currentStatus === 'ongoing' && (
            <div className="flex items-center gap-2 text-green-600">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-lg font-semibold">
                {formatTime(timeElapsed)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {ride.user?.fullname?.firstname} {ride.user?.fullname?.lastname}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-3 h-3" />
              <span>{ride.user?.phone}</span>
            </div>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(ride.fare)}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {ride.vehicle} ride
            </p>
          </div>
        </div>
      </div>

      {/* Route Information */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Pickup Location</p>
              <p className="text-sm text-gray-600">{ride.pickup}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Navigation className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Destination</p>
              <p className="text-sm text-gray-600">{ride.destination}</p>
            </div>
          </div>
          
          {ride.distanceToPickup && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Route className="w-4 h-4" />
              <span>{ride.distanceToPickup}km to pickup</span>
              {ride.estimatedArrival && (
                <span>• {ride.estimatedArrival} min ETA</span>
              )}
            </div>
          )}
        </div>
      </div>



      {/* Action Buttons */}
      <div className="px-6 py-6">
        <AnimatePresence mode="wait">
          {currentStatus === 'pending' && (
            <motion.div
              key="pending-actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-3"
            >
              <Button
                onClick={handleAccept}
                disabled={actionLoading || loading}
                variant="primary"
                size="lg"
                className="flex-1"
                loading={actionLoading}
                icon={<CheckCircle className="w-5 h-5" />}
              >
                Accept Ride
              </Button>
              <Button
                onClick={handleCancel}
                disabled={actionLoading || loading}
                variant={confirmCancel ? "danger" : "secondary"}
                size="lg"
                className="px-6"
                icon={<XCircle className="w-5 h-5" />}
              >
                {confirmCancel ? 'Confirm' : 'Decline'}
              </Button>
            </motion.div>
          )}

          {currentStatus === 'accepted' && (
            <motion.div
              key="accepted-actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-3"
            >
              <div className="flex-1 bg-green-50 rounded-xl p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900 mb-1">Ride Accepted!</h4>
                <p className="text-sm text-green-700">
                  Navigate to pickup location and start the ride
                </p>
              </div>
              <Button
                onClick={handleCancel}
                disabled={actionLoading || loading}
                variant={confirmCancel ? "danger" : "secondary"}
                size="lg"
                className="px-6"
                icon={<XCircle className="w-5 h-5" />}
              >
                {confirmCancel ? 'Confirm' : 'Cancel'}
              </Button>
            </motion.div>
          )}

          {currentStatus === 'ongoing' && (
            <motion.div
              key="ongoing-actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <Button
                onClick={handleEndRide}
                disabled={actionLoading || loading}
                variant="primary"
                size="lg"
                className="w-full"
                loading={actionLoading}
                icon={<CheckCircle className="w-5 h-5" />}
              >
                Complete Ride
              </Button>
              
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  icon={<MessageCircle className="w-4 h-4" />}
                >
                  Message
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  icon={<Phone className="w-4 h-4" />}
                >
                  Call
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel Confirmation Message */}
        {confirmCancel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl"
          >
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Click "Confirm" again to cancel this ride
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default RideActionPanel;