import React from 'react';
import { 
  MapPin, 
  Navigation, 
  CreditCard, 
  Phone, 
  MessageCircle, 
  Clock,
  User
} from 'lucide-react';
import { Button, Card, Input } from '../ui';
import { formatCurrency } from '../../utils/currency';

const ModernNewRide = ({
  rideData,
  showBtn,
  showPanel,
  setShowPanel,
  showPreviousPanel,
  loading,
  acceptRide,
  endRide,
  error,
}) => {
  const ignoreRide = () => {
    setShowPanel(false);
    showPreviousPanel(true);
  };

  const formatDistance = (distance) => {
    return (Number(distance?.toFixed(2)) / 1000)?.toFixed(1);
  };

  const formatLocation = (location) => {
    const parts = location.split(', ');
    return {
      main: parts[0] || location,
      secondary: parts.slice(1).join(', ')
    };
  };

  const pickupLocation = formatLocation(rideData.pickup);
  const destinationLocation = formatLocation(rideData.destination);

  return (
    <div
      className={`${
        showPanel ? 'bottom-0' : '-bottom-full'
      } transition-all duration-500 ease-in-out absolute bg-white w-full rounded-t-3xl shadow-2xl z-50`}
    >
      {/* Handle bar */}
      <div className="flex justify-center py-3">
        <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
      </div>

      <div className="px-6 pb-6">
        {/* Header with user info and fare */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-semibold text-lg">
                {rideData?.user?.fullname?.firstname?.[0]}
                {rideData?.user?.fullname?.lastname?.[0]}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {rideData?.user?.fullname?.firstname} {rideData?.user?.fullname?.lastname}
              </h2>
              <p className="text-sm text-gray-600">
                {rideData?.user?.phone || rideData?.user?.email}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(rideData?.fare)}</p>
            <p className="text-sm text-gray-500">{formatDistance(rideData?.distance)} km</p>
          </div>
        </div>

        {/* Action buttons for ongoing rides */}
        {showBtn !== 'accept' && (
          <div className="flex space-x-3 mb-6">
            <Button
              variant="secondary"
              className="flex-1 flex items-center justify-center space-x-2"
              onClick={() => window.location.href = `/captain/chat/${rideData?._id}`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message</span>
            </Button>
            <Button
              variant="secondary"
              className="px-4"
              onClick={() => window.location.href = `tel:${rideData?.user?.phone}`}
            >
              <Phone className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Trip details card */}
        <Card className="mb-6 overflow-hidden">
          {/* Pickup location */}
          <div className="flex items-start space-x-4 p-4 border-b border-gray-100">
            <div className="mt-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {pickupLocation.main}
              </h3>
              {pickupLocation.secondary && (
                <p className="text-sm text-gray-600">{pickupLocation.secondary}</p>
              )}
            </div>
            <MapPin className="w-5 h-5 text-green-500 mt-1" />
          </div>

          {/* Destination location */}
          <div className="flex items-start space-x-4 p-4 border-b border-gray-100">
            <div className="mt-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {destinationLocation.main}
              </h3>
              {destinationLocation.secondary && (
                <p className="text-sm text-gray-600">{destinationLocation.secondary}</p>
              )}
            </div>
            <Navigation className="w-5 h-5 text-red-500 mt-1" />
          </div>

          {/* Payment info */}
          <div className="flex items-center space-x-4 p-4">
            <CreditCard className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{formatCurrency(rideData.fare)}</h3>
              <p className="text-sm text-gray-600">Cash Payment</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Est. {Math.ceil(rideData?.duration / 60)} min</p>
            </div>
          </div>
        </Card>

        {/* Action buttons based on ride state */}
        {showBtn === 'accept' ? (
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={ignoreRide}
              disabled={loading}
            >
              Ignore
            </Button>
            <Button
              className="flex-1"
              onClick={acceptRide}
              loading={loading}
            >
              Accept Ride
            </Button>
          </div>
        ) : (
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={endRide}
            loading={loading}
          >
            End Ride
          </Button>
        )}
      </div>
    </div>
  );
};

export default ModernNewRide;