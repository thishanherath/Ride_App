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
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {vehicle?.number || 'N/A'}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Palette className="w-4 h-4" />
              <span>{vehicle?.color || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{vehicle?.capacity || 0} seats</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
              {vehicle?.type || 'car'}
            </span>
          </div>
        </div>
        <div className="ml-4">
          <img
            className="w-16 h-16 object-contain transform scale-x-[-1]"
            src={getVehicleImage(vehicle?.type)}
            alt="Vehicle"
          />
        </div>
      </div>
    </Card>
  );
};

export default VehicleInfoCard;