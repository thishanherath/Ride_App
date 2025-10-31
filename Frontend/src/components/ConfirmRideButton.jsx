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
  const handleClick = async () => {
    console.log('🚗 Book Ride button clicked!', { 
      fare, 
      vehicleType, 
      paymentMethod,
      loading,
      disabled,
      onConfirm: !!onConfirm
    });
    
    // Enhanced validation with user-friendly messages
    if (!onConfirm) {
      console.error('❌ No onConfirm function provided');
      alert('⚠️ Booking system error. Please refresh and try again.');
      return;
    }
    
    if (loading) {
      console.log('⏳ Button click ignored - booking in progress');
      return;
    }
    
    if (disabled) {
      console.log('🚫 Button click ignored - button is disabled');
      return;
    }
    
    if (!fare || fare <= 0) {
      console.error('❌ Invalid fare:', fare);
      alert('💰 Fare calculation error. Please select your locations again.');
      return;
    }
    
    if (!vehicleType) {
      console.error('❌ No vehicle type selected');
      alert('🚗 Please select a vehicle type first.');
      return;
    }
    
    // Show confirmation dialog before booking
    const confirmBooking = window.confirm(
      `🚗 Book ${vehicleType.toUpperCase()} ride for ${formatCurrency(fare)}?\n\n` +
      `💳 Payment: ${paymentMethod ? paymentMethod.name : 'Cash Payment'}\n` +
      `📱 You'll receive booking confirmation shortly.`
    );
    
    if (!confirmBooking) {
      console.log('❌ User cancelled booking');
      return;
    }
    
    console.log('✅ All validations passed, booking ride...');
    
    try {
      // Add haptic feedback for mobile devices
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      await onConfirm();
      
      // Success feedback
      console.log('🎉 Ride booking initiated successfully!');
      
    } catch (error) {
      console.error('❌ Error in ride booking:', error);
      alert('❌ Booking failed. Please check your connection and try again.');
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

      {/* Book Ride Button - Enhanced */}
      <Button
        onClick={handleClick}
        disabled={loading || disabled}
        variant="primary"
        size="lg"
        className="w-full py-3 sm:py-4 text-base sm:text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:from-orange-700 active:to-orange-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-xl"
        loading={loading}
        data-testid="book-ride-button"
      >
        <div className="flex items-center justify-center gap-2">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Booking Ride...</span>
            </>
          ) : disabled ? (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Complete Trip Details</span>
            </>
          ) : (
            <>
              <Car className="w-4 h-4" />
              <span>Book Ride</span>
              <span className="text-xs opacity-75">• {formatCurrency(fare)}</span>
            </>
          )}
        </div>
      </Button>

      {/* Payment Info & Features */}
      <div className="mt-3 text-center space-y-2">
        <p className="text-xs text-gray-500">
          💳 {paymentMethod ? paymentMethod.name : 'Cash Payment'} • 🛡️ Insured • 📍 GPS tracked
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Available drivers nearby
          </span>
          <span>•</span>
          <span>2-5 min pickup time</span>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRideButton;