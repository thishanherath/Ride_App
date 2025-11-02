import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  Car,
  Navigation,
  MapPin,
  Phone,
  MessageCircle,
  Star,
  User
} from 'lucide-react';
import { Card, Button } from './ui';
import { formatCurrency } from '../utils/currency';

const RideProcessFlow = ({
  rideStatus = 'searching',
  rideDetails = null,
  driverInfo = null,
  onCall = null,
  onMessage = null,
  onCancel = null,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showDetails, setShowDetails] = useState(true);

  // Update current step based on ride status
  useEffect(() => {
    switch (rideStatus) {
      case 'searching':
      case 'pending':
        setCurrentStep(1);
        break;
      case 'accepted':
        setCurrentStep(2);
        break;
      case 'ongoing':
        setCurrentStep(3);
        break;
      case 'completed':
        setCurrentStep(4);
        break;
      case 'cancelled':
        setCurrentStep(5); // Show cancelled step
        break;
      default:
        setCurrentStep(1);
    }
  }, [rideStatus]);

  const steps = [
    {
      id: 1,
      title: 'Searching for Driver',
      description: 'We\'re finding the best driver for you',
      icon: Clock,
      color: 'orange',
      status: 'searching'
    },
    {
      id: 2,
      title: 'Driver Assigned',
      description: 'Your driver is on the way to pick you up',
      icon: Car,
      color: 'blue',
      status: 'accepted'
    },
    {
      id: 3,
      title: 'Driver Arriving',
      description: 'Your driver is arriving at pickup location',
      icon: Navigation,
      color: 'green',
      status: 'ongoing'
    },
    {
      id: 4,
      title: 'Ride Complete',
      description: 'Thank you for riding with us!',
      icon: CheckCircle,
      color: 'gray',
      status: 'completed'
    },
    {
      id: 5,
      title: 'Ride Cancelled',
      description: 'Your ride has been cancelled',
      icon: XCircle,
      color: 'red',
      status: 'cancelled'
    }
  ];

  const getCurrentStepData = () => {
    return steps.find(step => step.id === currentStep) || steps[0];
  };

  const currentStepData = getCurrentStepData();
  const StepIcon = currentStepData.icon;

  const getColorClasses = (color) => {
    const colors = {
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-800',
        icon: 'text-orange-600',
        button: 'bg-orange-600 hover:bg-orange-700'
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: 'text-green-600',
        button: 'bg-green-600 hover:bg-green-700'
      },
      gray: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-800',
        icon: 'text-gray-600',
        button: 'bg-gray-600 hover:bg-gray-700'
      },
      red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-600',
        button: 'bg-red-600 hover:bg-red-700'
      }
    };
    return colors[color] || colors.orange;
  };

  const colorClasses = getColorClasses(currentStepData.color);

  return (
    <div className={`fixed inset-0 bg-white z-50 flex flex-col ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Your Ride</h1>
          <div className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-4 py-6 bg-gray-50">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step.id <= currentStep 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
                }
              `}>
                {step.id <= currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-12 h-0.5 mx-2
                  ${step.id < currentStep ? 'bg-green-600' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-md mx-auto"
          >
            {/* Current Step Card */}
            <Card className={`${colorClasses.bg} ${colorClasses.border} border-2 mb-6`}>
              <div className="p-6 text-center">
                <div className={`w-16 h-16 ${colorClasses.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <StepIcon className={`w-8 h-8 ${colorClasses.icon}`} />
                </div>
                <h2 className={`text-xl font-semibold ${colorClasses.text} mb-2`}>
                  {currentStepData.title}
                </h2>
                <p className={`text-sm ${colorClasses.text} opacity-80`}>
                  {currentStepData.description}
                </p>
              </div>
            </Card>

            {/* Ride Details */}
            {rideDetails && (
              <Card className="mb-6">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Trip Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Pickup</p>
                        <p className="text-sm text-gray-600">{rideDetails.pickup}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-gray-900">Destination</p>
                        <p className="text-sm text-gray-600">{rideDetails.destination}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Fare</span>
                      <span className="font-semibold text-lg text-green-600">
                        {formatCurrency(rideDetails.fare)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Driver Information */}
            {driverInfo && currentStep >= 2 && (
              <Card className="mb-6">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Your Driver</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {driverInfo.fullname?.firstname} {driverInfo.fullname?.lastname}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{driverInfo.vehicle?.type}</span>
                        <span>•</span>
                        <span>{driverInfo.vehicle?.plate}</span>
                        {driverInfo.rating && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{driverInfo.rating}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Driver Actions */}
                  <div className="flex gap-2">
                    {onCall && (
                      <Button
                        onClick={() => onCall(driverInfo.phone)}
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
                        onClick={() => onMessage(driverInfo._id)}
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
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        {currentStep === 1 && onCancel && (
          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
          >
            Cancel Ride
          </Button>
        )}
        {currentStep >= 2 && (
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="secondary"
            className="w-full"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default RideProcessFlow;