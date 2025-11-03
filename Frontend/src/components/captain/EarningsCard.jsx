import React from 'react';
import { Card } from '../ui';
import { TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const EarningsCard = ({ todayEarnings, totalEarnings, className = '' }) => {
  return (
    <Card className={`p-4 sm:p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white ${className}`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-orange-100 truncate">Today's Earnings</h3>
          <p className="text-2xl sm:text-3xl font-bold truncate">{formatCurrency(todayEarnings)}</p>
        </div>
        <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
          <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-orange-400/30">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <TrendingUp className="w-4 h-4 text-orange-200 flex-shrink-0" />
          <span className="text-sm text-orange-100 truncate">Total Earnings</span>
        </div>
        <span className="text-base sm:text-lg font-semibold flex-shrink-0">{formatCurrency(totalEarnings)}</span>
      </div>
    </Card>
  );
};

export default EarningsCard;