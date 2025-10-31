import React from 'react';
import Card from '../ui/Card';
import { VehicleTypeBadge } from '../ui/Badge';
import './DriverVehicleDetails.css';

/**
 * DriverVehicleDetails Component
 * 
 * Displays comprehensive vehicle identification information including:
 * - Vehicle make, model, color, and year
 * - Prominent license plate display
 * - Vehicle type badge with icon
 * - Responsive card layout
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
const DriverVehicleDetails = ({ 
  vehicle, 
  compact = false,
  className = '',
  ...props 
}) => {
  if (!vehicle) {
    return (
      <Card 
        className={`driver-vehicle-details driver-vehicle-details--loading ${className}`}
        padding="default"
        shadow="sm"
        {...props}
      >
        <div className="driver-vehicle-details__content">
          <div className="driver-vehicle-details__header">
            <div className="driver-vehicle-details__icon-placeholder" />
            <div className="driver-vehicle-details__title-placeholder" />
          </div>
          <div className="driver-vehicle-details__license-placeholder" />
          <div className="driver-vehicle-details__info-placeholder" />
        </div>
      </Card>
    );
  }

  const getVehicleIcon = (type) => {
    const icons = {
      sedan: '🚗',
      suv: '🚙',
      hatchback: '🚗',
      coupe: '🚗',
      wagon: '🚗'
    };
    return icons[type] || '🚗';
  };

  const formatVehicleName = () => {
    const parts = [];
    if (vehicle.year) parts.push(vehicle.year);
    if (vehicle.make) parts.push(vehicle.make);
    if (vehicle.model) parts.push(vehicle.model);
    return parts.join(' ');
  };

  const cardClasses = [
    'driver-vehicle-details',
    compact && 'driver-vehicle-details--compact',
    className
  ].filter(Boolean).join(' ');

  return (
    <Card 
      className={cardClasses}
      padding={compact ? "sm" : "default"}
      shadow="sm"
      hover={false}
      {...props}
    >
      <div className="driver-vehicle-details__content">
        {/* Header with vehicle icon and type badge */}
        <div className="driver-vehicle-details__header">
          <div className="driver-vehicle-details__icon">
            <span className="driver-vehicle-details__emoji" role="img" aria-label={`${vehicle.type} vehicle`}>
              {getVehicleIcon(vehicle.type)}
            </span>
          </div>
          <div className="driver-vehicle-details__header-content">
            <h3 className="driver-vehicle-details__title">
              Your Vehicle
            </h3>
            <VehicleTypeBadge 
              vehicleType={vehicle.type} 
              className="driver-vehicle-details__type-badge"
            />
          </div>
        </div>

        {/* Prominent license plate display */}
        <div className="driver-vehicle-details__license-section">
          <div className="driver-vehicle-details__license-label">
            License Plate
          </div>
          <div 
            className="driver-vehicle-details__license-plate"
            role="text"
            aria-label={`License plate ${vehicle.licensePlate}`}
          >
            {vehicle.licensePlate.toUpperCase()}
          </div>
        </div>

        {/* Vehicle information */}
        <div className="driver-vehicle-details__info">
          <div className="driver-vehicle-details__info-row">
            <span className="driver-vehicle-details__info-label">Vehicle:</span>
            <span className="driver-vehicle-details__info-value">
              {formatVehicleName()}
            </span>
          </div>
          
          <div className="driver-vehicle-details__info-row">
            <span className="driver-vehicle-details__info-label">Color:</span>
            <span className="driver-vehicle-details__info-value driver-vehicle-details__color">
              <span 
                className="driver-vehicle-details__color-dot"
                style={{ backgroundColor: vehicle.color.toLowerCase() }}
                aria-hidden="true"
              />
              {vehicle.color}
            </span>
          </div>

          {vehicle.capacity && (
            <div className="driver-vehicle-details__info-row">
              <span className="driver-vehicle-details__info-label">Capacity:</span>
              <span className="driver-vehicle-details__info-value">
                {vehicle.capacity} passengers
              </span>
            </div>
          )}
        </div>

        {/* Identification helper text */}
        <div className="driver-vehicle-details__helper">
          <svg 
            className="driver-vehicle-details__helper-icon" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span className="driver-vehicle-details__helper-text">
            Look for this license plate to identify your ride
          </span>
        </div>
      </div>
    </Card>
  );
};

DriverVehicleDetails.displayName = 'DriverVehicleDetails';

export default DriverVehicleDetails;