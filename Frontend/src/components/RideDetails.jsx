import {
  MapPin,
  PhoneCall,
  SendHorizontal,
  User,
  Star,
  Clock,
  Navigation,
  Shield,
  CheckCircle,
  Route,
  Timer,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { Card, Button, Badge, ProgressBar } from "./ui";
import { formatCurrency } from "../utils/currency";
import ConfirmRideButton from "./ConfirmRideButton";
import { useDistance } from "../hooks/useDistanceTime";

function RideDetails({
  pickupLocation,
  destinationLocation,
  selectedVehicle,
  fare,
  showPanel,
  setShowPanel,
  showPreviousPanel,
  createRide,
  cancelRide,
  loading,
  rideCreated,
  confirmedRideData,
}) {
  // Get real distance and time data from Google Maps API
  const {
    distance,
    duration,
    loading: distanceLoading,
    error: distanceError,
    display,
    isReady
  } = useDistance(pickupLocation, destinationLocation);

  // Debug logging
  console.log("RideDetails props:", {
    pickupLocation,
    destinationLocation,
    selectedVehicle,
    fare,
    showPanel,
    rideCreated,
    confirmedRideData,
    distance,
    duration,
    distanceLoading,
    isReady
  });

  // Determine ride progress step
  const getRideProgressStep = () => {
    if (confirmedRideData?._id) {
      return 3; // Driver assigned and confirmed
    } else if (rideCreated) {
      return 1; // Looking for driver
    } else {
      return 0; // Booking confirmation
    }
  };

  const rideSteps = ['Confirm Booking', 'Finding Driver', 'Driver Assigned', 'Pickup'];

  // Calculate estimated pickup time (2-3 minutes from now)
  const getPickupETA = () => {
    const now = new Date();
    const eta = new Date(now.getTime() + (2.5 * 60 * 1000)); // 2.5 minutes
    return eta.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div
      className={`${showPanel ? "bottom-0 translate-y-0 opacity-100" : "bottom-0 translate-y-full opacity-0"
        } transition-all duration-700 ease-out absolute w-full z-20`}
    >
      <Card className="bg-white rounded-t-3xl shadow-2xl border-0 p-0 max-h-[90vh] sm:max-h-[85vh] lg:max-h-[80vh] flex flex-col overflow-hidden">
        {/* Panel Handle */}
        <div
          onClick={() => {
            setShowPanel(false);
            showPreviousPanel(true);
          }}
          className="flex justify-center py-3 cursor-pointer group"
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full group-hover:bg-gray-400 transition-colors duration-200" />
        </div>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col h-full min-h-0">
          {/* Header Section */}
          <div className="mb-2 sm:mb-3 flex-shrink-0">
            {rideCreated && !confirmedRideData && (
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Finding your driver</h2>
                <p className="text-sm text-gray-600 mb-4">We're connecting you with nearby drivers</p>
                <ProgressBar
                  progress={60}
                  color="primary"
                  size="sm"
                  animated={true}
                  className="max-w-xs mx-auto"
                />
              </div>
            )}

            {confirmedRideData?._id && (
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Driver Found!</h2>
                <p className="text-sm text-gray-600">Your driver is on the way</p>
              </div>
            )}

            {!rideCreated && !confirmedRideData && (
              <div className="text-center mb-2">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Confirm your ride</h2>
                <p className="text-xs text-gray-600">Review the details below</p>
              </div>
            )}
          </div>

          {/* Ride Progress Tracker */}
          {(rideCreated || confirmedRideData) && (
            <div className="mb-4 sm:mb-6 flex-shrink-0">
              <ProgressBar
                variant="stepped"
                progress={(getRideProgressStep() / (rideSteps.length - 1)) * 100}
                color="primary"
                animated={true}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                {rideSteps.map((step, index) => (
                  <span
                    key={index}
                    className={`
                      ${index <= getRideProgressStep() ? 'text-orange-600 font-medium' : 'text-gray-400'}
                    `}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Vehicle and Driver Info - More Compact */}
          <div className="mb-2 flex-shrink-0">
            <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-2">
                {/* Vehicle Image - Smaller */}
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <img
                    src={selectedVehicle === "car" ? "/car.png" : `/${selectedVehicle}.webp`}
                    className="w-8 h-6 sm:w-10 sm:h-7 object-contain"
                    alt={selectedVehicle}
                    loading="lazy"
                  />
                </div>

                {/* Driver Info or Vehicle Type */}
                <div className="flex-1 min-w-0">
                  {confirmedRideData?._id ? (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {confirmedRideData?.captain?.fullname?.firstname}{" "}
                            {confirmedRideData?.captain?.fullname?.lastname}
                          </h3>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" color="gray" size="xs">
                              {confirmedRideData?.captain?.vehicle?.number}
                            </Badge>
                            <Badge variant="default" color="primary" size="xs">
                              <Star className="w-3 h-3 mr-1" />
                              4.8
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 capitalize mb-2">
                        {confirmedRideData?.captain?.vehicle?.color}{" "}
                        {confirmedRideData?.captain?.vehicle?.type}
                      </p>
                      <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-center">
                        <span className="text-xs font-semibold">OTP: {confirmedRideData?.otp}</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm capitalize mb-1">
                        Quick{selectedVehicle}
                      </h3>
                      <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                        {selectedVehicle === 'car' ? 'Comfortable rides for 1-4 people' :
                          selectedVehicle === 'bike' ? 'Fast & affordable motorcycle rides' :
                            'Traditional auto-rickshaw experience'}
                      </p>
                      <div className="flex items-center gap-1">
                        <Badge variant="default" color="success" size="xs">
                          <Clock className="w-3 h-3 mr-1" />
                          2 min away
                        </Badge>
                        <Badge variant="default" color="primary" size="xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Insured
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons for Confirmed Ride */}
          {confirmedRideData?._id && (
            <div className="flex flex-col sm:flex-row gap-2 mb-2 flex-shrink-0">
              <Button
                to={`/user/chat/${confirmedRideData?._id}`}
                variant="secondary"
                className="flex-1"
                icon={<SendHorizontal className="w-4 h-4" />}
              >
                Message
              </Button>
              <Button
                variant="secondary"
                className="px-4"
                onClick={() => window.open(`tel:${confirmedRideData?.captain?.phone}`)}
                icon={<PhoneCall className="w-4 h-4" />}
              />
            </div>
          )}

          {/* Trip Details - Scrollable Content */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-2 pb-2">
              {/* Trip Summary Card - Very Compact */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-2">
                <div className="flex items-center gap-2 mb-2">
                  <Route className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-blue-900 text-sm">Trip Summary</h3>
                  {distanceLoading && (
                    <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-blue-700 font-medium">Vehicle:</span>
                    <p className="text-blue-900 font-semibold">Quick{selectedVehicle}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Fare:</span>
                    <p className="text-blue-900 font-semibold">
                      {fare && fare[selectedVehicle] ? formatCurrency(fare[selectedVehicle]) : "Calculating..."}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Payment:</span>
                    <p className="text-blue-900 font-semibold">Cash</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Distance:</span>
                    <p className="text-blue-900 font-semibold">
                      {distanceLoading ? "Calculating..." :
                        isReady ? display.distance :
                          "Select locations"}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Duration:</span>
                    <p className="text-blue-900 font-semibold">
                      {distanceLoading ? "Calculating..." :
                        isReady ? display.duration :
                          "Select locations"}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">ETA:</span>
                    <p className="text-blue-900 font-semibold">
                      {distanceLoading ? "Calculating..." :
                        isReady ? display.eta :
                          "Select locations"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Route Overview - Very Compact */}
              <div className="relative">
                {/* Show message if locations are not set */}
                {(!pickupLocation || !destinationLocation) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-2">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        {!pickupLocation && !destinationLocation
                          ? "Please select pickup and destination locations"
                          : !pickupLocation
                            ? "Please select pickup location"
                            : "Please select destination location"
                        }
                      </span>
                    </div>
                  </div>
                )}

                {/* Show error if distance calculation fails */}
                {distanceError && pickupLocation && destinationLocation && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        Unable to calculate route. Using estimated values.
                      </span>
                    </div>
                  </div>
                )}
                {/* Pickup Location - Very Compact */}
                <div className="flex items-start gap-2 p-2 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 mb-1">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <h4 className="font-bold text-green-800 text-xs uppercase">Pickup</h4>
                      <Badge variant="solid" color="success" size="xs">From</Badge>
                    </div>
                    <p className="font-medium text-gray-900 text-xs break-words">
                      {pickupLocation || "Not selected"}
                    </p>
                    {pickupLocation && (
                      <div className="flex items-center gap-1 mt-1">
                        <Timer className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-700">
                          Pickup at {getPickupETA()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Route Line - Smaller */}
                <div className="flex justify-center mb-1">
                  <div className="w-0.5 h-3 bg-gradient-to-b from-green-300 to-red-300 rounded-full"></div>
                </div>

                {/* Destination Location - Very Compact */}
                <div className="flex items-start gap-2 p-2 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Navigation className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <h4 className="font-bold text-red-800 text-xs uppercase">Destination</h4>
                      <Badge variant="solid" color="error" size="xs">To</Badge>
                    </div>
                    <p className="font-medium text-gray-900 text-xs break-words">
                      {destinationLocation || "Not selected"}
                    </p>
                    {destinationLocation && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-red-600" />
                        <span className="text-xs text-red-700">
                          {distanceLoading ? "Calculating..." :
                            isReady ? `Arrive at ${display.eta}` :
                              "Select pickup first"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fare Details - Very Compact */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200 p-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-orange-600" />
                    <h4 className="font-semibold text-gray-900 text-sm">Total Fare</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-base sm:text-lg font-bold text-gray-900">
                      {fare && fare[selectedVehicle] ? formatCurrency(fare[selectedVehicle]) : "Calculating..."}
                    </p>
                    <Badge variant="default" color="warning" size="xs">
                      Estimated
                    </Badge>
                  </div>
                </div>

                {/* Fare Breakdown - Very Compact */}
                {fare && fare[selectedVehicle] && (
                  <div className="pt-2 border-t border-orange-200 space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Base fare</span>
                      <span>{formatCurrency(Math.round(fare[selectedVehicle] * 0.6))}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Distance charge</span>
                      <span>{formatCurrency(Math.round(fare[selectedVehicle] * 0.3))}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Service fee</span>
                      <span>{formatCurrency(Math.round(fare[selectedVehicle] * 0.1))}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="bg-white pt-2 sm:pt-3 border-t border-gray-100 flex-shrink-0">
            {rideCreated || confirmedRideData ? (
              <div className="space-y-3">
                <Button
                  onClick={cancelRide}
                  disabled={loading}
                  variant="danger"
                  size="lg"
                  className="w-full py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  loading={loading}
                >
                  {loading ? "Cancelling..." : "Cancel Ride"}
                </Button>

                {/* Safety Info */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pb-1 sm:pb-2">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-center">All rides are insured and GPS tracked for your safety</span>
                </div>
              </div>
            ) : (
              <ConfirmRideButton
                onConfirm={createRide}
                loading={loading}
                disabled={!pickupLocation || !destinationLocation || !fare || !fare[selectedVehicle]}
                fare={fare && fare[selectedVehicle] ? fare[selectedVehicle] : 0}
                vehicleType={selectedVehicle}
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default RideDetails;
