import React from 'react';
import { Card } from '../ui';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  subtitle,
  className = '' 
}) => {
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-50',
    green: 'text-green-500 bg-green-50',
    yellow: 'text-yellow-500 bg-yellow-50',
    orange: 'text-orange-500 bg-orange-50',
    purple: 'text-purple-500 bg-purple-50',
    red: 'text-red-500 bg-red-50'
  };

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;