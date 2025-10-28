/**
 * Ride Status Notification Component
 * Shows real-time updates about ride status to users
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  Car,
  Navigation,
  Phone,
  MessageCircle,
  MapPin,
  AlertTriangle,
  Star
} from 'lucide-react';
import { Card, Button, Badge } from './ui';
import { formatCurrency } from '../utils/currency';

const RideStatusNotification = ({
  rideStatus = 'pending',
  captainInfo = null,
  rideDetails = null,
  onCall,
  onMessage,
  onCancel,
  className = ''
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [estimatedArrival, setEstimatedArrival] = useState(null);

  // Timer for ride duration
  useEffect(() => {
    let interval;
    if (rideStatus === 'ongoing') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setTimeElapsed(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rideStatus]);

  // Calculate estimated arrival time
  useEffect(() => {
    if (rideStatus === 'accepted' && captainInfo?.location) {
      // Rough calculation: 2 minutes per km
      const distance = captainInfo.distanceToPickup || 5;
      setEstimatedArrival(Math.ceil(distance * 2));
    }
  }, [rideStatus, captainInfo]);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get status configuration
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          color: 'yellow',
          icon: Clock,
          title: 'Finding Driver',
          message: 'We\'re looking for a nearby driver for you...',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
      case 'accepted':
        return {
          color: 'blue',
          icon: Car,
          title: 'Driver Found!',
          message: captainInfo ? `${captainInfo.fullname?.firstname} is coming to pick you up` : 'Your driver is on the way',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800'
        };
      case 'ongoing':
        return {
          color: 'green',
          icon: Navigation,
          title: 'Ride in Progress',
          message: 'Enjoy your ride! You\'re on your way to your destination.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'completed':
        return {
          color: 'gray',
          icon: CheckCircle,
          title: 'Ride Completed',
          message: 'Thank you for riding with us! Hope you had a great trip.',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800'
        };
      case 'cancelled':
        return {
          color: 'red',
          icon: XCircle,
          title: 'Ride Cancelled',
          message: 'Your ride has been cancelled. You can book another ride anytime.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800'
        };
      default:
        return {
          color: 'gray',
          icon: Clock,
          title: 'Unknown Status',
          message: 'Please refresh the app if you see this message.',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800'
        };
    }
  };

  const statusConfig = getStatusConfig(rideStatus);
  const StatusIcon = statusConfig.icon;

  if (rideStatus === 'pending') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-xl p-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="animate-spin">
            <StatusIcon className={`w-6 h-6 ${statusConfig.textColor}`} />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${statusConfig.textColor}`}>
              {statusConfig.title}
            </h3>
            <p className={`text-sm ${statusConfig.textColor} opacity-80`}>
              {statusConfig.message}
            </p>
          </div>
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="secondary"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              Cancel
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  if (!captainInfo && rideStatus !== 'completed' && rideStatus !== 'cancelled') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={className}
      >
        <Card className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2`}>
          <div className="p-4">
            {/* Status Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
                  <StatusIcon className={`w-5 h-5 ${statusConfig.textColor}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${statusConfig.textColor}`}>
                    {statusConfig.title}
                  </h3>
                  <p className={`text-sm ${statusConfig.textColor} opacity-80`}>
                    {statusConfig.message}
                  </p>
                </div>
              </div>
              
              {rideStatus === 'ongoing' && (
                <div className={`text-right ${statusConfig.textColor}`}>
                  <div className="text-lg font-mono font-semibold">
                    {formatTime(timeElapsed)}
                  </div>
                  <div className="text-xs opacity-80">Duration</div>
                </div>
              )}
            </div>

            {/* Captain Information */}
            {captainInfo && rideStatus !== 'completed' && rideStatus !== 'cancelled' && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Car className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {captainInfo.fullname?.firstname} {captainInfo.fullname?.lastname}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{captainInfo.vehicle?.type}</span>
                        <span>•</span>
                        <span>{captainInfo.vehicle?.plate}</span>
                        {captainInfo.rating && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{captainInfo.rating}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {estimatedArrival && rideStatus === 'accepted' && (
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-600">
                        {estimatedArrival} min
                      </div>
                      <div className="text-xs text-gray-500">ETA</div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {onCall && (
                    <Button
                      onClick={() => onCall(captainInfo.phone)}
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      icon={<Phone className="w-4 h-4" />}
                    >
                      Call
                    </Button>
                  )}
                  {onMessage && (
                    <Button
                      onClick={() => onMessage(captainInfo._id)}
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      icon={<MessageCircle className="w-4 h-4" />}
                    >
                      Message
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Ride Details */}
            {rideDetails && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">Pickup</div>
                    <div className="font-medium text-gray-900 line-clamp-2">
                      {rideDetails.pickup}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Destination</div>
                    <div className="font-medium text-gray-900 line-clamp-2">
                      {rideDetails.destination}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Fare</div>
                    <div className="font-semibold text-lg text-orange-600">
                      {formatCurrency(rideDetails.fare)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Vehicle</div>
                    <div className="font-medium text-gray-900 capitalize">
                      {rideDetails.vehicle}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default RideStatusNotification;