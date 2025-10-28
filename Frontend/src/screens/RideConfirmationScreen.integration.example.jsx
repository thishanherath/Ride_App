/**
 * Integration Example: RideConfirmationScreen with UserHomeScreen
 * 
 * This file demonstrates how the new RideConfirmationScreen component
 * can be integrated into the existing ride booking flow.
 */

import React, { useState, useEffect } from 'react';
import { RideConfirmationScreen } from './index';
import { SelectVehicle, RideDetails } from '../components';

const RideConfirmationIntegrationExample = () => {
  // Existing state from UserHomeScreen
  const [pickupLocation, setPickupLocation] = useState("Colombo Fort Railway Station");
  const [destinationLocation, setDestinationLocation] = useState("Bandaranaike International Airport");
  const [selectedVehicle, setSelectedVehicle] = useState("car");
  const [fare, setFare] = useState({
    auto: 2000,
    car: 2500,
    bike: 1800,
  });
  const [loading, setLoading] = useState(false);
  const [rideCreated, setRideCreated] = useState(false);
  const [confirmedRideData, setConfirmedRideData] = useState(null);

  // Panel state management
  const [currentStep, setCurrentStep] = useState('confirmation'); // 'selection', 'confirmation', 'details'
  const [showRideConfirmation, setShowRideConfirmation] = useState(true);

  // Handlers for the new RideConfirmationScreen
  const handleBack = () => {
    console.log('Going back to vehicle selection');
    setCurrentStep('selection');
    setShowRideConfirmation(false);
  };

  const handleClose = () => {
    console.log('Closing ride confirmation');
    setShowRideConfirmation(false);
    // Reset to initial state or navigate to home
  };

  const handleConfirmRide = async () => {
    console.log('Confirming ride with:', {
      pickup: pickupLocation,
      destination: destinationLocation,
      vehicle: selectedVehicle,
      fare: fare[selectedVehicle]
    });

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Move to ride details step
      setCurrentStep('details');
      setRideCreated(true);
      
      console.log('Ride confirmed successfully');
    } catch (error) {
      console.error('Failed to confirm ride:', error);
    } finally {
      setLoading(false);
    }
  };

  // Integration with existing components
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'selection':
        return (
          <SelectVehicle
            selectedVehicle={setSelectedVehicle}
            showPanel={true}
            setShowPanel={() => {}}
            showPreviousPanel={() => setCurrentStep('confirmation')}
            showNextPanel={() => setCurrentStep('confirmation')}
            fare={fare}
          />
        );

      case 'confirmation':
        return showRideConfirmation ? (
          <RideConfirmationScreen
            pickupLocation={pickupLocation}
            destinationLocation={destinationLocation}
            selectedVehicle={selectedVehicle}
            fare={fare}
            onBack={handleBack}
            onClose={handleClose}
            onConfirm={handleConfirmRide}
            loading={loading}
          >
            {/* Custom content sections for the confirmation screen */}
            <VehicleSelectionSection
              selectedVehicle={selectedVehicle}
              onVehicleChange={setSelectedVehicle}
              fare={fare}
            />
            
            <TripDetailsSection
              pickupLocation={pickupLocation}
              destinationLocation={destinationLocation}
              onLocationChange={(type, value) => {
                if (type === 'pickup') setPickupLocation(value);
                else setDestinationLocation(value);
              }}
            />
            
            <FareBreakdownSection
              selectedVehicle={selectedVehicle}
              fare={fare}
            />
            
            <ConfirmationButtonSection
              onConfirm={handleConfirmRide}
              loading={loading}
              disabled={!pickupLocation || !destinationLocation}
              fare={fare[selectedVehicle]}
              vehicleType={selectedVehicle}
            />
          </RideConfirmationScreen>
        ) : null;

      case 'details':
        return (
          <RideDetails
            pickupLocation={pickupLocation}
            destinationLocation={destinationLocation}
            selectedVehicle={selectedVehicle}
            fare={fare}
            showPanel={true}
            setShowPanel={() => {}}
            showPreviousPanel={() => setCurrentStep('confirmation')}
            createRide={() => {}}
            cancelRide={() => {
              setCurrentStep('confirmation');
              setRideCreated(false);
              setConfirmedRideData(null);
            }}
            loading={loading}
            rideCreated={rideCreated}
            confirmedRideData={confirmedRideData}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-50">
      {/* Background Map (simulated) */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <div className="text-6xl mb-4">🗺️</div>
          <p>Map Background</p>
          <p className="text-sm mt-2">Current Step: {currentStep}</p>
        </div>
      </div>

      {/* Render current step */}
      {renderCurrentStep()}

      {/* Debug Panel */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-xs">
        <h3 className="font-semibold mb-2">Integration Debug</h3>
        <div className="text-sm space-y-1">
          <p><strong>Step:</strong> {currentStep}</p>
          <p><strong>Vehicle:</strong> {selectedVehicle}</p>
          <p><strong>Fare:</strong> Rs. {fare[selectedVehicle]}</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="mt-3 space-y-2">
          <button
            onClick={() => setCurrentStep('selection')}
            className="block w-full text-left px-2 py-1 text-xs bg-blue-100 rounded"
          >
            Go to Selection
          </button>
          <button
            onClick={() => {
              setCurrentStep('confirmation');
              setShowRideConfirmation(true);
            }}
            className="block w-full text-left px-2 py-1 text-xs bg-orange-100 rounded"
          >
            Go to Confirmation
          </button>
          <button
            onClick={() => setCurrentStep('details')}
            className="block w-full text-left px-2 py-1 text-xs bg-green-100 rounded"
          >
            Go to Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom content sections for the RideConfirmationScreen
const VehicleSelectionSection = ({ selectedVehicle, onVehicleChange, fare }) => {
  const vehicles = [
    { id: 'car', name: 'QuickCar', icon: '🚗', description: 'Comfortable rides for 1-4 people' },
    { id: 'bike', name: 'QuickBike', icon: '🏍️', description: 'Fast & affordable motorcycle rides' },
    { id: 'auto', name: 'QuickAuto', icon: '🛺', description: 'Traditional auto-rickshaw experience' }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose your ride</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className={`
              p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
              ${selectedVehicle === vehicle.id 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => onVehicleChange(vehicle.id)}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">{vehicle.icon}</div>
              <h3 className="font-medium">{vehicle.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{vehicle.description}</p>
              <p className="text-lg font-bold text-orange-600">Rs. {fare[vehicle.id]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TripDetailsSection = ({ pickupLocation, destinationLocation, onLocationChange }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Location
          </label>
          <input
            type="text"
            value={pickupLocation}
            onChange={(e) => onLocationChange('pickup', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination
          </label>
          <input
            type="text"
            value={destinationLocation}
            onChange={(e) => onLocationChange('destination', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
    </div>
  );
};

const FareBreakdownSection = ({ selectedVehicle, fare }) => {
  const baseFare = Math.round(fare[selectedVehicle] * 0.6);
  const distanceCharge = Math.round(fare[selectedVehicle] * 0.3);
  const serviceFee = Math.round(fare[selectedVehicle] * 0.1);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Fare Breakdown</h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Base fare</span>
          <span>Rs. {baseFare}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Distance charge</span>
          <span>Rs. {distanceCharge}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Service fee</span>
          <span>Rs. {serviceFee}</span>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>Rs. {fare[selectedVehicle]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmationButtonSection = ({ onConfirm, loading, disabled, fare, vehicleType }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <button
        onClick={onConfirm}
        disabled={disabled || loading}
        className={`
          w-full py-4 px-6 rounded-xl font-semibold text-lg
          transition-all duration-200
          ${disabled || loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700'
          }
        `}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Booking your ride...</span>
          </div>
        ) : (
          `Confirm & Book - Rs. ${fare}`
        )}
      </button>
      
      <div className="mt-3 text-center text-sm text-gray-500">
        💳 Cash payment • 🛡️ Insured ride • 📍 GPS tracked
      </div>
    </div>
  );
};

export default RideConfirmationIntegrationExample;