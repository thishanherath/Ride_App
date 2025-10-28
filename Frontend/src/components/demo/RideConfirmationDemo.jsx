import React, { useState } from 'react';
import { RideConfirmationScreen } from '../../screens';
import { Button } from '../ui';

const RideConfirmationDemo = () => {
  const [showScreen, setShowScreen] = useState(false);
  const [demoData, setDemoData] = useState({
    pickupLocation: 'Colombo Fort Railway Station',
    destinationLocation: 'Bandaranaike International Airport',
    selectedVehicle: 'car',
    fare: { car: 2500, bike: 1800, auto: 2000 },
    loading: false
  });

  const handleBack = () => {
    console.log('Back button clicked');
    setShowScreen(false);
  };

  const handleClose = () => {
    console.log('Close button clicked');
    setShowScreen(false);
  };

  const handleConfirm = () => {
    console.log('Confirm button clicked');
    setDemoData(prev => ({ ...prev, loading: true }));
    
    // Simulate API call
    setTimeout(() => {
      setDemoData(prev => ({ ...prev, loading: false }));
      alert('Ride confirmed!');
    }, 2000);
  };

  if (showScreen) {
    return (
      <RideConfirmationScreen
        pickupLocation={demoData.pickupLocation}
        destinationLocation={demoData.destinationLocation}
        selectedVehicle={demoData.selectedVehicle}
        fare={demoData.fare}
        onBack={handleBack}
        onClose={handleClose}
        onConfirm={handleConfirm}
        loading={demoData.loading}
      >
        {/* Demo content sections */}
        <div className="space-y-6">
          {/* Vehicle Selection Demo */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Selection</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['car', 'bike', 'auto'].map((vehicle) => (
                <div
                  key={vehicle}
                  className={`
                    p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                    ${demoData.selectedVehicle === vehicle 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setDemoData(prev => ({ ...prev, selectedVehicle: vehicle }))}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">
                      {vehicle === 'car' ? '🚗' : vehicle === 'bike' ? '🏍️' : '🛺'}
                    </div>
                    <h3 className="font-medium capitalize">Quick{vehicle}</h3>
                    <p className="text-sm text-gray-600">Rs. {demoData.fare[vehicle]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trip Details Demo */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-600">From: {demoData.pickupLocation}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm text-gray-600">To: {demoData.destinationLocation}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm text-gray-600">Distance: ~25 km</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span className="text-sm text-gray-600">Duration: ~45 mins</span>
              </div>
            </div>
          </div>

          {/* Confirmation Button Demo */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleConfirm}
              loading={demoData.loading}
            >
              {demoData.loading ? 'Booking...' : `Confirm & Book - Rs. ${demoData.fare[demoData.selectedVehicle]}`}
            </Button>
          </div>
        </div>
      </RideConfirmationScreen>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Ride Confirmation Screen Demo
        </h1>
        <p className="text-gray-600 mb-6">
          Click the button below to see the ride confirmation screen in action.
        </p>
        
        {/* Demo Controls */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Location
            </label>
            <input
              type="text"
              value={demoData.pickupLocation}
              onChange={(e) => setDemoData(prev => ({ ...prev, pickupLocation: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <input
              type="text"
              value={demoData.destinationLocation}
              onChange={(e) => setDemoData(prev => ({ ...prev, destinationLocation: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => setShowScreen(true)}
        >
          Open Ride Confirmation Screen
        </Button>
      </div>
    </div>
  );
};

export default RideConfirmationDemo;