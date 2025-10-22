import {
  CreditCard,
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
} from "lucide-react";
import { Card, Button, Badge, ProgressBar } from "./ui";

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

  return (
    <div
      className={`${
        showPanel ? "bottom-0 translate-y-0 opacity-100" : "bottom-0 translate-y-full opacity-0"
      } transition-all duration-700 ease-out absolute w-full z-20`}
    >
      <Card className="bg-white rounded-t-3xl shadow-2xl border-0 p-0 max-h-[85vh] overflow-hidden">
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
        
        <div className="px-6 pb-6">
          {/* Header Section */}
          <div className="mb-6">
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
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirm your ride</h2>
                <p className="text-sm text-gray-600">Review the details below</p>
              </div>
            )}
          </div>

          {/* Ride Progress Tracker */}
          {(rideCreated || confirmedRideData) && (
            <div className="mb-6">
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

          {/* Vehicle and Driver Info */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-2xl p-5">
              <div className="flex items-center gap-4">
                {/* Vehicle Image */}
                <div className="flex-shrink-0 w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <img
                    src={selectedVehicle === "car" ? "/car.png" : `/${selectedVehicle}.webp`}
                    className="w-16 h-12 object-contain"
                    alt={selectedVehicle}
                    loading="lazy"
                  />
                </div>

                {/* Driver Info or Vehicle Type */}
                <div className="flex-1">
                  {confirmedRideData?._id ? (
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {confirmedRideData?.captain?.fullname?.firstname}{" "}
                            {confirmedRideData?.captain?.fullname?.lastname}
                          </h3>
                          <div className="flex items-center gap-2">
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
                      <p className="text-sm text-gray-600 capitalize mb-3">
                        {confirmedRideData?.captain?.vehicle?.color}{" "}
                        {confirmedRideData?.captain?.vehicle?.type}
                      </p>
                      <div className="bg-gray-900 text-white px-4 py-2 rounded-xl text-center">
                        <span className="text-sm font-semibold">OTP: {confirmedRideData?.otp}</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg capitalize mb-1">
                        Quick{selectedVehicle}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {selectedVehicle === 'car' ? 'Comfortable rides for 1-4 people' : 
                         selectedVehicle === 'bike' ? 'Fast & affordable motorcycle rides' :
                         'Traditional auto-rickshaw experience'}
                      </p>
                      <div className="flex items-center gap-2">
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
            <div className="flex gap-3 mb-6">
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

          {/* Trip Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Route className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Trip Details</h3>
            </div>
            
            {/* Route Overview */}
            <div className="relative">
              {/* Pickup Location */}
              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-green-50 to-green-25 rounded-2xl border border-green-100 mb-3 transition-all duration-300 hover:shadow-md">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">Pickup Location</h4>
                    <Badge variant="default" color="success" size="xs">From</Badge>
                  </div>
                  <p className="font-medium text-gray-900 mb-1 text-lg">
                    {pickupLocation.split(", ")[0]}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {pickupLocation.split(", ").slice(1).join(", ")}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Timer className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-700 font-medium">Pickup in 2-3 mins</span>
                  </div>
                </div>
              </div>

              {/* Route Line */}
              <div className="flex justify-center mb-3">
                <div className="w-0.5 h-8 bg-gradient-to-b from-green-300 to-red-300 rounded-full"></div>
              </div>

              {/* Destination Location */}
              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-red-50 to-red-25 rounded-2xl border border-red-100 transition-all duration-300 hover:shadow-md">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Navigation className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">Destination</h4>
                    <Badge variant="default" color="error" size="xs">To</Badge>
                  </div>
                  <p className="font-medium text-gray-900 mb-1 text-lg">
                    {destinationLocation.split(", ")[0]}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {destinationLocation.split(", ").slice(1).join(", ")}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-4 h-4 text-red-600" />
                    <span className="text-xs text-red-700 font-medium">Est. 15-20 mins</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fare Details */}
            <div className="bg-gradient-to-r from-orange-50 via-orange-25 to-yellow-50 rounded-2xl border border-orange-200 p-5 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shadow-sm">
                  <Wallet className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg mb-1">Total Fare</h4>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <p className="text-sm text-gray-600">Cash payment</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900 mb-1">₹{fare[selectedVehicle]}</p>
                      <Badge variant="default" color="warning" size="sm">
                        Estimated
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Fare Breakdown */}
              <div className="mt-4 pt-4 border-t border-orange-200">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Base fare</span>
                  <span>₹{Math.round(fare[selectedVehicle] * 0.6)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Distance charge</span>
                  <span>₹{Math.round(fare[selectedVehicle] * 0.3)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Service fee</span>
                  <span>₹{Math.round(fare[selectedVehicle] * 0.1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-3">
            {rideCreated || confirmedRideData ? (
              <Button
                onClick={cancelRide}
                disabled={loading}
                variant="danger"
                size="lg"
                className="w-full"
                loading={loading}
              >
                {loading ? "Cancelling..." : "Cancel Ride"}
              </Button>
            ) : (
              <Button
                onClick={createRide}
                disabled={loading}
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
              >
                {loading ? "Confirming..." : "Confirm Ride"}
              </Button>
            )}
            
            {/* Safety Info */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
              <Shield className="w-4 h-4" />
              <span>All rides are insured and GPS tracked for your safety</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default RideDetails;
