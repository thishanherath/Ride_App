import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Clock, 
  Car, 
  Bike, 
  Truck,
  CheckCircle,
  CreditCard,
  Wallet,
  Banknote,
  Shield,
  Timer,
  Star,
  Route as RouteIcon,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Badge } from './ui';
import { formatCurrency } from '../utils/currency';
import { useDistance } from '../hooks/useDistanceTime';
import './ModernRideConfirmation.css';

const ModernRideConfirmation = ({
  pickupLocation,
  destinationLocation,
  selectedVehicle,
  fare,
  showPanel,
  setShowPanel,
  showPreviousPanel,
  createRide,
  loading,
  onBack
}) => {
  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({
    id: 'cash',
    type: 'cash',
    name: 'Cash Payment',
    description: 'Pay with cash to driver',
    icon: Banknote
  });

  // Get distance and time data
  const {
    distance,
    duration,
    loading: distanceLoading,
    error: distanceError,
    display,
    isReady
  } = useDistance(pickupLocation, destinationLocation);

  // Vehicle options with icons and descriptions
  const vehicleOptions = {
    car: {
      name: 'QuickCar',
      description: 'Comfortable rides for 1-4 people',
      icon: Car,
      capacity: '1-4 people',
      estimatedTime: '2-3 min'
    },
    bike: {
      name: 'QuickBike', 
      description: 'Fast & affordable motorcycle rides',
      icon: Bike,
      capacity: '1 person',
      estimatedTime: '1-2 min'
    },
    auto: {
      name: 'QuickAuto',
      description: 'Traditional auto-rickshaw experience', 
      icon: Truck,
      capacity: '1-3 people',
      estimatedTime: '2-4 min'
    }
  };

  // Payment method options
  const paymentMethods = [
    {
      id: 'cash',
      type: 'cash',
      name: 'Cash Payment',
      description: 'Pay with cash to driver',
      icon: Banknote
    },
    {
      id: 'card',
      type: 'card', 
      name: 'Credit/Debit Card',
      description: 'Pay with your card',
      icon: CreditCard
    },
    {
      id: 'wallet',
      type: 'wallet',
      name: 'Digital Wallet',
      description: 'Pay with digital wallet',
      icon: Wallet
    }
  ];

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setShowPanel(false);
      showPreviousPanel(true);
    }
  };

  // Handle ride confirmation
  const handleConfirm = async () => {
    if (!pickupLocation || !destinationLocation || !fare[selectedVehicle]) {
      alert('Please complete all trip details before confirming');
      return;
    }

    try {
      await createRide(selectedPaymentMethod);
    } catch (error) {
      console.error('❌ Ride confirmation failed:', error);
      alert('Failed to confirm ride. Please try again.');
    }
  };

  // Get current vehicle details
  const currentVehicle = vehicleOptions[selectedVehicle] || vehicleOptions.car;
  const currentFare = fare[selectedVehicle] || 0;

  // Check if all required data is available
  const canConfirm = pickupLocation && destinationLocation && currentFare > 0;

  return (
    <div
      className={`${showPanel ? "bottom-0 translate-y-0 opacity-100" : "bottom-0 translate-y-full opacity-0"
        } transition-all duration-700 ease-out absolute w-full z-20`}
    >
      <Card className="bg-white rounded-t-3xl shadow-2xl border-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Confirm your ride
          </h1>
          <div className="w-9 h-9" /> {/* Spacer for centering */}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Selected Vehicle Card */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-4">
            <div className="flex items-center gap-4">
              {/* Vehicle Icon */}
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <currentVehicle.icon className="w-8 h-8 text-orange-600" />
              </div>

              {/* Vehicle Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {currentVehicle.name}
                  </h3>
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {currentVehicle.description}
                </p>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {currentVehicle.estimatedTime} away
                  </span>
                  <span>{currentVehicle.capacity}</span>
                </div>
              </div>

              {/* Fare Display */}
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(currentFare)}
                </div>
                <Badge variant="default" color="warning" size="sm">
                  Estimated
                </Badge>
              </div>
            </div>
          </div>

          {/* Trip Details Card */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <RouteIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Trip Details</h3>
              {distanceLoading && (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            <div className="space-y-4">
              {/* Pickup Location */}
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-green-700">Pickup</span>
                    <Badge variant="solid" color="success" size="xs">From</Badge>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {pickupLocation || "Not selected"}
                  </p>
                </div>
              </div>

              {/* Route Line */}
              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-gradient-to-b from-green-300 to-red-300 rounded-full" />
              </div>

              {/* Destination Location */}
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-red-700">Destination</span>
                    <Badge variant="solid" color="error" size="xs">To</Badge>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {destinationLocation || "Not selected"}
                  </p>
                </div>
              </div>

              {/* Route Info */}
              {isReady && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {display.distance}
                    </div>
                    <div className="text-sm text-gray-500">Distance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {display.duration}
                    </div>
                    <div className="text-sm text-gray-500">Duration</div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Fare Breakdown Card */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Fare Breakdown</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Base fare</span>
                <span className="font-medium">{formatCurrency(Math.round(currentFare * 0.6))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Distance charge</span>
                <span className="font-medium">{formatCurrency(Math.round(currentFare * 0.3))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Service fee</span>
                <span className="font-medium">{formatCurrency(Math.round(currentFare * 0.1))}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {formatCurrency(currentFare)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Method Card */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                const isSelected = selectedPaymentMethod.id === method.id;
                
                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 ${isSelected ? 'text-orange-600' : 'text-gray-500'}`} />
                    <div className="flex-1">
                      <div className={`font-medium ${isSelected ? 'text-orange-900' : 'text-gray-900'}`}>
                        {method.name}
                      </div>
                      <div className="text-sm text-gray-500">{method.description}</div>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Safety Features */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-green-50">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-green-700">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Insured ride</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">GPS tracked</span>
              </div>
              <div className="flex items-center gap-2 text-purple-700">
                <Timer className="w-4 h-4" />
                <span className="font-medium">24/7 support</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Action Area */}
        <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
          <Button
            onClick={handleConfirm}
            disabled={loading || !canConfirm}
            variant="primary"
            size="lg"
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            loading={loading}
          >
            <div className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Booking your ride...</span>
                </>
              ) : !canConfirm ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  <span>Complete Trip Details</span>
                </>
              ) : (
                <>
                  <Car className="w-5 h-5" />
                  <span>Confirm & Book Ride - {formatCurrency(currentFare)}</span>
                </>
              )}
            </div>
          </Button>

          {/* Payment Info */}
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-500">
              💳 {selectedPaymentMethod.name} • 🛡️ Insured • 📍 GPS tracked
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ModernRideConfirmation;