import React from 'react';
import { Button } from './ui';
import { Car, CreditCard } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const ConfirmRideButton = ({ 
  onConfirm, 
  loading = false, 
  disabled = false, 
  fare, 
  vehicleType,
  paymentMethod,
  className = '' 
}) => {
  const handleClick = () => {
    console.log('ConfirmRideButton clicked!', { fare, vehicleType });
    if (onConfirm && !loading && !disabled) {
      onConfirm();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Fare Summary - Compact */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-2 sm:p-3 mb-2 sm:mb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Car className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 capitalize text-sm">Quick{vehicleType}</p>
              <p className="text-xs text-gray-600">Total fare</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg sm:text-xl font-bold text-orange-600">
              {formatCurrency(fare)}
            </p>
            <p className="text-xs text-gray-500">
              {paymentMethod ? paymentMethod.name : 'Cash Payment'}
            </p>
          </div>
        </div>
      </div>

      {/* Confirm Button - Compact */}
      <Button
        onClick={handleClick}
        disabled={loading || disabled}
        variant="primary"
        size="lg"
        className="w-full py-2 sm:py-3 text-sm sm:text-base font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        loading={loading}
      >
        <div className="flex items-center justify-center gap-2">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Confirming Ride...</span>
            </>
          ) : disabled ? (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Complete Trip Details</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Confirm & Book Ride</span>
              {paymentMethod && paymentMethod.type !== 'cash' && (
                <span className="text-xs opacity-75">• {paymentMethod.name}</span>
              )}
            </>
          )}
        </div>
      </Button>

      {/* Payment Info - Compact */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          💳 Cash payment • 🛡️ Insured • 📍 GPS tracked
        </p>
      </div>
    </div>
  );
};

export default ConfirmRideButton;