import React, { useState, useEffect, useCallback } from 'react';
import { Clock, RefreshCw, MapPin } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import './ArrivalTimeEstimate.css';

const ArrivalTimeEstimate = ({
  estimatedArrival,
  isUpdating = false,
  lastUpdated,
  onRefresh,
  compact = false,
  className = ''
}) => {
  const [displayTime, setDisplayTime] = useState(estimatedArrival);
  const [isCountingDown, setIsCountingDown] = useState(false);

  // Format time for display
  const formatArrivalTime = useCallback((minutes) => {
    if (typeof minutes !== 'number' || minutes < 0) {
      return null;
    }

    if (minutes === 0) {
      return 'Arriving now';
    }

    if (minutes < 1) {
      return 'Less than 1 minute';
    }

    if (minutes === 1) {
      return '1 minute';
    }

    return `${Math.round(minutes)} minutes`;
  }, []);

  // Format last updated time
  const formatLastUpdated = useCallback((date) => {
    if (!date) return null;

    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) {
      return 'Just now';
    }

    if (diffMinutes === 1) {
      return '1 minute ago';
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    }

    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  // Update display time with countdown animation
  useEffect(() => {
    if (typeof estimatedArrival === 'number' && estimatedArrival >= 0) {
      setDisplayTime(estimatedArrival);
      
      // Start countdown animation if time is reasonable (< 60 minutes)
      if (estimatedArrival > 0 && estimatedArrival <= 60) {
        setIsCountingDown(true);
        
        // Auto-refresh every minute for countdown
        const interval = setInterval(() => {
          setDisplayTime(prev => {
            const newTime = Math.max(0, prev - 1);
            if (newTime === 0) {
              setIsCountingDown(false);
            }
            return newTime;
          });
        }, 60000); // Update every minute

        return () => clearInterval(interval);
      } else {
        setIsCountingDown(false);
      }
    } else {
      setIsCountingDown(false);
    }
  }, [estimatedArrival]);

  // Handle refresh action
  const handleRefresh = useCallback(() => {
    if (onRefresh && !isUpdating) {
      onRefresh();
    }
  }, [onRefresh, isUpdating]);

  // Determine display content
  const getDisplayContent = () => {
    if (isUpdating) {
      return {
        mainText: 'Calculating...',
        subText: 'Getting latest arrival time',
        showSpinner: true
      };
    }

    const formattedTime = formatArrivalTime(displayTime);
    
    if (!formattedTime) {
      return {
        mainText: 'Driver is on the way',
        subText: 'Arrival time will be updated shortly',
        showSpinner: false
      };
    }

    if (displayTime === 0) {
      return {
        mainText: 'Driver has arrived!',
        subText: 'Look for your driver',
        showSpinner: false,
        isArrived: true
      };
    }

    return {
      mainText: `Arriving in ${formattedTime}`,
      subText: lastUpdated ? `Updated ${formatLastUpdated(lastUpdated)}` : null,
      showSpinner: false
    };
  };

  const content = getDisplayContent();
  const canRefresh = onRefresh && !isUpdating;
  const lastUpdatedText = formatLastUpdated(lastUpdated);

  return (
    <Card 
      className={`arrival-time-estimate ${compact ? 'arrival-time-estimate--compact' : ''} ${content.isArrived ? 'arrival-time-estimate--arrived' : ''} ${className}`}
      padding={compact ? "md" : "lg"}
      shadow="md"
    >
      <div className="arrival-time-estimate__content">
        {/* Main Time Display */}
        <div className="arrival-time-estimate__main">
          <div className="arrival-time-estimate__icon-container">
            {content.showSpinner ? (
              <LoadingSpinner size="sm" color="primary" />
            ) : content.isArrived ? (
              <MapPin className="arrival-time-estimate__icon arrival-time-estimate__icon--arrived" />
            ) : (
              <Clock className="arrival-time-estimate__icon" />
            )}
          </div>

          <div className="arrival-time-estimate__text">
            <div className={`arrival-time-estimate__main-text ${isCountingDown ? 'arrival-time-estimate__main-text--countdown' : ''}`}>
              {content.mainText}
            </div>
            
            {content.subText && (
              <div className="arrival-time-estimate__sub-text">
                {content.subText}
              </div>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        {onRefresh && !compact && (
          <div className="arrival-time-estimate__actions">
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />}
              onClick={handleRefresh}
              disabled={isUpdating}
              className="arrival-time-estimate__refresh-button"
              aria-label="Refresh arrival time"
            >
              {isUpdating ? 'Updating...' : 'Refresh'}
            </Button>
          </div>
        )}

        {/* Compact Refresh Button */}
        {onRefresh && compact && (
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
            disabled={isUpdating}
            className="arrival-time-estimate__compact-refresh"
            aria-label="Refresh arrival time"
          />
        )}
      </div>

      {/* Progress Indicator for Countdown */}
      {isCountingDown && displayTime > 0 && !compact && (
        <div className="arrival-time-estimate__progress">
          <div className="arrival-time-estimate__progress-bar">
            <div 
              className="arrival-time-estimate__progress-fill"
              style={{
                animationDuration: `${displayTime * 60}s`
              }}
            />
          </div>
        </div>
      )}

      {/* Last Updated Info */}
      {lastUpdatedText && !compact && !isUpdating && (
        <div className="arrival-time-estimate__footer">
          <span className="arrival-time-estimate__last-updated">
            Last updated: {lastUpdatedText}
          </span>
        </div>
      )}
    </Card>
  );
};

export default ArrivalTimeEstimate;