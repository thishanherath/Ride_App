import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  Car, 
  MapPin, 
  Play, 
  CheckSquare,
  XCircle 
} from 'lucide-react';
import Card from '../ui/Card';
import { RideStatus } from '../../types/driver.types';
import './RideStatusProgress.css';

const RideStatusProgress = ({
  currentStatus,
  statusHistory = [],
  nextStep,
  showProgress = true,
  className = ''
}) => {
  // Define status configuration with icons, colors, and descriptions
  const statusConfig = {
    [RideStatus.BOOKING_CONFIRMED]: {
      icon: CheckSquare,
      label: 'Booking Confirmed',
      description: 'Your ride request has been confirmed',
      color: 'success',
      order: 1
    },
    [RideStatus.DRIVER_ASSIGNED]: {
      icon: CheckCircle,
      label: 'Driver Assigned',
      description: 'A driver has been assigned to your ride',
      color: 'success',
      order: 2
    },
    [RideStatus.DRIVER_EN_ROUTE]: {
      icon: Car,
      label: 'Driver En Route',
      description: 'Your driver is on the way to pick you up',
      color: 'primary',
      order: 3
    },
    [RideStatus.DRIVER_ARRIVED]: {
      icon: MapPin,
      label: 'Driver Arrived',
      description: 'Your driver has arrived at the pickup location',
      color: 'warning',
      order: 4
    },
    [RideStatus.RIDE_STARTED]: {
      icon: Play,
      label: 'Ride Started',
      description: 'Your ride is now in progress',
      color: 'primary',
      order: 5
    },
    [RideStatus.RIDE_COMPLETED]: {
      icon: CheckCircle,
      label: 'Ride Completed',
      description: 'Your ride has been completed successfully',
      color: 'success',
      order: 6
    },
    [RideStatus.RIDE_CANCELLED]: {
      icon: XCircle,
      label: 'Ride Cancelled',
      description: 'Your ride has been cancelled',
      color: 'error',
      order: 0
    }
  };

  // Get ordered status list for progression
  const getOrderedStatuses = () => {
    return Object.entries(statusConfig)
      .filter(([status]) => status !== RideStatus.RIDE_CANCELLED)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([status]) => status);
  };

  // Check if a status is completed
  const isStatusCompleted = (status) => {
    const currentOrder = statusConfig[currentStatus]?.order || 0;
    const statusOrder = statusConfig[status]?.order || 0;
    
    // Special handling for cancelled rides
    if (currentStatus === RideStatus.RIDE_CANCELLED) {
      return statusHistory.some(h => h.status === status);
    }
    
    return statusOrder <= currentOrder;
  };

  // Check if a status is current
  const isStatusCurrent = (status) => {
    return status === currentStatus;
  };

  // Get next step description
  const getNextStepDescription = () => {
    if (nextStep) return nextStep;
    
    const orderedStatuses = getOrderedStatuses();
    const currentIndex = orderedStatuses.indexOf(currentStatus);
    
    if (currentIndex >= 0 && currentIndex < orderedStatuses.length - 1) {
      const nextStatus = orderedStatuses[currentIndex + 1];
      return statusConfig[nextStatus]?.description;
    }
    
    return null;
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get status from history
  const getStatusFromHistory = (status) => {
    return statusHistory.find(h => h.status === status);
  };

  const currentConfig = statusConfig[currentStatus];
  const nextStepDescription = getNextStepDescription();
  const orderedStatuses = getOrderedStatuses();

  return (
    <Card 
      className={`ride-status-progress ${className}`}
      padding="lg"
      shadow="md"
    >
      <div className="ride-status-progress__content">
        {/* Current Status Header */}
        <div className="ride-status-progress__header">
          <div className="ride-status-progress__current-status">
            <div className={`ride-status-progress__current-icon ride-status-progress__current-icon--${currentConfig?.color || 'primary'}`}>
              {currentConfig?.icon && (
                <currentConfig.icon className="w-6 h-6" />
              )}
            </div>
            
            <div className="ride-status-progress__current-text">
              <h3 className="ride-status-progress__current-label">
                {currentConfig?.label || 'Unknown Status'}
              </h3>
              <p className="ride-status-progress__current-description">
                {currentConfig?.description || 'Status update in progress'}
              </p>
            </div>
          </div>

          {/* Current Status Timestamp */}
          {getStatusFromHistory(currentStatus) && (
            <div className="ride-status-progress__timestamp">
              {formatTimestamp(getStatusFromHistory(currentStatus).timestamp)}
            </div>
          )}
        </div>

        {/* Progress Timeline */}
        {showProgress && currentStatus !== RideStatus.RIDE_CANCELLED && (
          <div className="ride-status-progress__timeline">
            <div className="ride-status-progress__timeline-header">
              <h4 className="ride-status-progress__timeline-title">Progress</h4>
            </div>

            <div className="ride-status-progress__steps">
              {orderedStatuses.map((status, index) => {
                const config = statusConfig[status];
                const isCompleted = isStatusCompleted(status);
                const isCurrent = isStatusCurrent(status);
                const statusFromHistory = getStatusFromHistory(status);
                const IconComponent = config.icon;

                return (
                  <div
                    key={status}
                    className={`ride-status-progress__step ${
                      isCompleted ? 'ride-status-progress__step--completed' : ''
                    } ${
                      isCurrent ? 'ride-status-progress__step--current' : ''
                    }`}
                  >
                    {/* Step Connector Line */}
                    {index > 0 && (
                      <div className={`ride-status-progress__connector ${
                        isCompleted ? 'ride-status-progress__connector--completed' : ''
                      }`} />
                    )}

                    {/* Step Icon */}
                    <div className={`ride-status-progress__step-icon ride-status-progress__step-icon--${config.color} ${
                      isCompleted ? 'ride-status-progress__step-icon--completed' : ''
                    } ${
                      isCurrent ? 'ride-status-progress__step-icon--current' : ''
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Step Content */}
                    <div className="ride-status-progress__step-content">
                      <div className="ride-status-progress__step-label">
                        {config.label}
                      </div>
                      
                      {statusFromHistory && (
                        <div className="ride-status-progress__step-time">
                          {formatTimestamp(statusFromHistory.timestamp)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Next Step Preview */}
        {nextStepDescription && currentStatus !== RideStatus.RIDE_COMPLETED && currentStatus !== RideStatus.RIDE_CANCELLED && (
          <div className="ride-status-progress__next-step">
            <div className="ride-status-progress__next-step-header">
              <Clock className="w-4 h-4 ride-status-progress__next-step-icon" />
              <span className="ride-status-progress__next-step-label">Next</span>
            </div>
            <p className="ride-status-progress__next-step-description">
              {nextStepDescription}
            </p>
          </div>
        )}

        {/* Cancelled Status Special Display */}
        {currentStatus === RideStatus.RIDE_CANCELLED && (
          <div className="ride-status-progress__cancelled">
            <div className="ride-status-progress__cancelled-content">
              <XCircle className="w-8 h-8 ride-status-progress__cancelled-icon" />
              <div className="ride-status-progress__cancelled-text">
                <h4 className="ride-status-progress__cancelled-title">Ride Cancelled</h4>
                <p className="ride-status-progress__cancelled-description">
                  Your ride has been cancelled. You can book a new ride anytime.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RideStatusProgress;