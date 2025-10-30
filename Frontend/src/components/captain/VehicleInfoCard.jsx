import React from 'react';
import { Card } from '../ui';
import { Car, Users, Palette } from 'lucide-react';

const VehicleInfoCard = ({ vehicle, className = '' }) => {
  const getVehicleImage = (type) => {
    switch (type) {
      case 'car':
        return '/car.png';
      case 'motorcycle':
        return '/motorcycle.webp';
      case 'auto':
        return '/auto.webp';
      default:
        return '/car.png';
    }
  };

  return (
    <Card className={`p-3 sm:p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
            {vehicle?.number || 'N/A'}
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-600 gap-1 sm:gap-0">
            <div className="flex items-center space-x-1">
              <Palette className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{vehicle?.color || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>{vehicle?.capacity || 0} seats</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
              {vehicle?.type || 'car'}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <img
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain transform scale-x-[-1]"
            src={getVehicleImage(vehicle?.type)}
            alt="Vehicle"
          />
        </div>
      </div>
    </Card>
  );
};

export default VehicleInfoCard;