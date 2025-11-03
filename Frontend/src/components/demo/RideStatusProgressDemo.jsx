import React, { useState, useEffect } from 'react';
import RideStatusProgress from '../driver-acceptance/RideStatusProgress';
import { RideStatus } from '../../types/driver.types';
import Button from '../ui/Button';

const RideStatusProgressDemo = () => {
  const [currentStatus, setCurrentStatus] = useState(RideStatus.BOOKING_CONFIRMED);
  const [statusHistory, setStatusHistory] = useState([
    {
      status: RideStatus.BOOKING_CONFIRMED,
      timestamp: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
    }
  ]);
  const [showProgress, setShowProgress] = useState(true);
  const [customNextStep, setCustomNextStep] = useState('');

  // Status progression order
  const statusOrder = [
    RideStatus.BOOKING_CONFIRMED,
    RideStatus.DRIVER_ASSIGNED,
    RideStatus.DRIVER_EN_ROUTE,
    RideStatus.DRIVER_ARRIVED,
    RideStatus.RIDE_STARTED,
    RideStatus.RIDE_COMPLETED
  ];

  // Auto-progress demo
  const [autoProgress, setAutoProgress] = useState(false);

  useEffect(() => {
    if (!autoProgress) return;

    const interval = setInterval(() => {
      setCurrentStatus(prevStatus => {
        const currentIndex = statusOrder.indexOf(prevStatus);
        if (currentIndex < statusOrder.length - 1) {
          const nextStatus = statusOrder[currentIndex + 1];
          
          // Add to history
          setStatusHistory(prev => [
            ...prev,
            {
              status: nextStatus,
              timestamp: new Date()
            }
          ]);
          
          return nextStatus;
        } else {
          setAutoProgress(false);
          return prevStatus;
        }
      });
    }, 3000); // Progress every 3 seconds

    return () => clearInterval(interval);
  }, [autoProgress, statusOrder]);

  const handleStatusChange = (newStatus) => {
    setCurrentStatus(newStatus);
    
    // Update history to include all statuses up to the new one
    const newStatusIndex = statusOrder.indexOf(newStatus);
    const newHistory = statusOrder
      .slice(0, newStatusIndex + 1)
      .map((status, index) => ({
        status,
        timestamp: new Date(Date.now() - (statusOrder.length - index) * 5 * 60 * 1000)
      }));
    
    setStatusHistory(newHistory);
  };

  const handleCancelRide = () => {
    setCurrentStatus(RideStatus.RIDE_CANCELLED);
    setStatusHistory(prev => [
      ...prev,
      {
        status: RideStatus.RIDE_CANCELLED,
        timestamp: new Date()
      }
    ]);
    setAutoProgress(false);
  };

  const resetDemo = () => {
    setCurrentStatus(RideStatus.BOOKING_CONFIRMED);
    setStatusHistory([
      {
        status: RideStatus.BOOKING_CONFIRMED,
        timestamp: new Date(Date.now() - 10 * 60 * 1000)
      }
    ]);
    setAutoProgress(false);
    setCustomNextStep('');
  };

  const getStatusLabel = (status) => {
    const labels = {
      [RideStatus.BOOKING_CONFIRMED]: 'Booking Confirmed',
      [RideStatus.DRIVER_ASSIGNED]: 'Driver Assigned',
      [RideStatus.DRIVER_EN_ROUTE]: 'Driver En Route',
      [RideStatus.DRIVER_ARRIVED]: 'Driver Arrived',
      [RideStatus.RIDE_STARTED]: 'Ride Started',
      [RideStatus.RIDE_COMPLETED]: 'Ride Completed',
      [RideStatus.RIDE_CANCELLED]: 'Ride Cancelled'
    };
    return labels[status] || status;
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          marginBottom: '0.5rem',
          color: '#1f2937'
        }}>
          RideStatusProgress Demo
        </h1>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '1.1rem',
          lineHeight: '1.6'
        }}>
          Interactive demonstration of the ride status progression component with timeline design, 
          status highlighting, and smooth transitions.
        </p>
      </div>

      {/* Demo Component */}
      <div style={{ marginBottom: '2rem' }}>
        <RideStatusProgress
          currentStatus={currentStatus}
          statusHistory={statusHistory}
          nextStep={customNextStep || undefined}
          showProgress={showProgress}
        />
      </div>

      {/* Controls */}
      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '1.5rem', 
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          marginBottom: '1rem',
          color: '#1f2937'
        }}>
          Demo Controls
        </h3>

        {/* Status Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            marginBottom: '0.5rem',
            color: '#374151'
          }}>
            Current Status:
          </label>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.5rem' 
          }}>
            {statusOrder.map(status => (
              <Button
                key={status}
                variant={currentStatus === status ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleStatusChange(status)}
                disabled={autoProgress}
              >
                {getStatusLabel(status)}
              </Button>
            ))}
            <Button
              variant={currentStatus === RideStatus.RIDE_CANCELLED ? 'primary' : 'outline'}
              size="sm"
              onClick={handleCancelRide}
              disabled={autoProgress}
              style={{ 
                backgroundColor: currentStatus === RideStatus.RIDE_CANCELLED ? '#ef4444' : undefined,
                borderColor: '#ef4444',
                color: currentStatus === RideStatus.RIDE_CANCELLED ? 'white' : '#ef4444'
              }}
            >
              Cancel Ride
            </Button>
          </div>
        </div>

        {/* Options */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1rem', 
            alignItems: 'center' 
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: '#374151'
            }}>
              <input
                type="checkbox"
                checked={showProgress}
                onChange={(e) => setShowProgress(e.target.checked)}
                disabled={autoProgress}
              />
              Show Progress Timeline
            </label>

            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: '#374151'
            }}>
              <input
                type="checkbox"
                checked={autoProgress}
                onChange={(e) => setAutoProgress(e.target.checked)}
              />
              Auto Progress (3s intervals)
            </label>
          </div>
        </div>

        {/* Custom Next Step */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            marginBottom: '0.5rem',
            color: '#374151'
          }}>
            Custom Next Step (optional):
          </label>
          <input
            type="text"
            value={customNextStep}
            onChange={(e) => setCustomNextStep(e.target.value)}
            placeholder="Enter custom next step description..."
            disabled={autoProgress}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          flexWrap: 'wrap' 
        }}>
          <Button
            variant="outline"
            onClick={resetDemo}
            disabled={autoProgress}
          >
            Reset Demo
          </Button>
          
          <Button
            variant={autoProgress ? 'secondary' : 'primary'}
            onClick={() => setAutoProgress(!autoProgress)}
          >
            {autoProgress ? 'Stop Auto Progress' : 'Start Auto Progress'}
          </Button>
        </div>
      </div>

      {/* Status Information */}
      <div style={{ 
        marginTop: '2rem',
        backgroundColor: '#f0f9ff',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        border: '1px solid #bae6fd'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          marginBottom: '1rem',
          color: '#0c4a6e'
        }}>
          Current Status Information
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          fontSize: '0.875rem'
        }}>
          <div>
            <strong style={{ color: '#0c4a6e' }}>Current Status:</strong>
            <br />
            {getStatusLabel(currentStatus)}
          </div>
          
          <div>
            <strong style={{ color: '#0c4a6e' }}>History Count:</strong>
            <br />
            {statusHistory.length} status updates
          </div>
          
          <div>
            <strong style={{ color: '#0c4a6e' }}>Show Progress:</strong>
            <br />
            {showProgress ? 'Yes' : 'No'}
          </div>
          
          <div>
            <strong style={{ color: '#0c4a6e' }}>Auto Progress:</strong>
            <br />
            {autoProgress ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div style={{ 
        marginTop: '2rem',
        backgroundColor: '#f9fafb',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600', 
          marginBottom: '1rem',
          color: '#111827'
        }}>
          Component Features
        </h3>
        
        <ul style={{ 
          listStyle: 'disc',
          paddingLeft: '1.5rem',
          fontSize: '0.875rem',
          lineHeight: '1.6',
          color: '#374151'
        }}>
          <li>Timeline design with status progression indicator</li>
          <li>Current status highlighting with color coding</li>
          <li>Status-specific icons and visual feedback</li>
          <li>Smooth transitions between status changes</li>
          <li>Next step preview functionality</li>
          <li>Special handling for cancelled rides</li>
          <li>Responsive design for mobile and desktop</li>
          <li>Accessibility features with semantic HTML</li>
          <li>Timestamp display for status history</li>
          <li>Customizable progress timeline visibility</li>
        </ul>
      </div>
    </div>
  );
};

export default RideStatusProgressDemo;