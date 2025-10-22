import React from 'react';
import { Card } from '../ui';
import { TrendingUp, DollarSign } from 'lucide-react';

const EarningsCard = ({ todayEarnings, totalEarnings, className = '' }) => {
  return (
    <Card className={`p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-orange-100">Today's Earnings</h3>
          <p className="text-3xl font-bold">₹{todayEarnings}</p>
        </div>
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          <DollarSign className="w-6 h-6" />
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-orange-400/30">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-orange-200" />
          <span className="text-sm text-orange-100">Total Earnings</span>
        </div>
        <span className="text-lg font-semibold">₹{totalEarnings}</span>
      </div>
    </Card>
  );
};

export default EarningsCard;