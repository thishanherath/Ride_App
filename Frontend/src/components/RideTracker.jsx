import { 
  MapPin, 
  Navigation, 
  Clock, 
  User, 
  Phone, 
  MessageCircle,
  Car,
  CheckCircle,
  Route,
  Timer,
  Shield,
  Star,
  Zap
} from 'lucide-react';
import { Card, Badge, ProgressBar, Button } from './ui';

const RideTracker = ({ 
  rideData, 
  currentStatus = 'driver-assigned',
  estimatedTime = '5 min',
  driverLocation,
  onCallDriver,
  onMessageDriver,
  onCancelRide
}) => {
  const rideSteps = [
    { 
      id: 'driver-assigned', 
      label: 'Driver Assigned', 
      icon: CheckCircle,
      description: 'Your driver has been assigned',
      color: 'info'
    },
    { 
      id: 'driver-arriving', 
      label: 'Driver Arriving', 
      icon: Car,
      description: 'Driver is on the way to pickup',
      color: 'warning'
    },
    { 
      id: 'driver-arrived', 
      label: 'Driver Arrived', 
      icon: MapPin,
      description: 'Driver has arrived at pickup location',
      color: 'success'
    },
    { 
      id: 'ride-started', 
      label: 'Ride Started', 
      icon: Navigation,
      description: 'Your ride is in progress',
      color: 'primary'
    }
  ];

  const getCurrentStepIndex = () => {
    return rideSteps.findIndex(step => step.id === currentStatus);
  };

  const currentStepIndex = getCurrentStepIndex();
  const progress = ((currentStepIndex + 1) / rideSteps.length) * 100;

  const getStatusColor = (status) => {
    switch (status) {
      case 'driver-assigned': return 'info';
      case 'driver-arriving': return 'warning';
      case 'driver-arrived': return 'success';
      case 'ride-started': return 'primary';
      default: return 'gray';
    }
  };

  const getStatusMessage = () => {
    switch (currentStatus) {
      case 'driver-assigned':
        return `Your driver will arrive in ${estimatedTime}`;
      case 'driver-arriving':
        return `Driver is ${estimatedTime} away from pickup`;
      case 'driver-arrived':
        return 'Your driver has arrived at the pickup location';
      case 'ride-started':
        return `Estimated arrival in ${estimatedTime}`;
      default:
        return 'Tracking your ride...';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card className="p-6 bg-gradient-to-br from-white to-gray-50">
        <div className="text-center mb-6">
          <div className="relative w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            {currentStatus === 'ride-started' ? (
              <Navigation className="w-10 h-10 text-orange-600" />
            ) : currentStatus === 'driver-arrived' ? (
              <CheckCircle className="w-10 h-10 text-green-600" />
            ) : (
              <Car className="w-10 h-10 text-blue-600" />
            )}
            {/* Animated pulse ring */}
            <div className="absolute inset-0 rounded-full border-4 border-orange-300 animate-ping opacity-30"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {rideSteps[currentStepIndex]?.label || 'Tracking Ride'}
          </h2>
          <p className="text-gray-600 mb-4 text-lg">
            {getStatusMessage()}
          </p>
          <Badge 
            variant="solid" 
            color={getStatusColor(currentStatus)}
            size="lg"
            className="shadow-sm"
          >
            <Zap className="w-4 h-4 mr-1" />
            {rideSteps[currentStepIndex]?.description || 'In Progress'}
          </Badge>
        </div>

        {/* Enhanced Progress Tracker */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Route className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Ride Progress</h3>
            </div>
            <ProgressBar 
              variant="stepped"
              progress={progress}
              color="primary"
              animated={true}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-3">
              {rideSteps.map((step, index) => (
                <span 
                  key={step.id}
                  className={`
                    text-center flex-1 transition-all duration-300
                    ${index <= currentStepIndex ? 'text-orange-600 font-semibold' : 'text-gray-400'}
                  `}
                >
                  {step.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Live Status Updates */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-blue-800 font-medium">Live tracking active</p>
          </div>
        </div>
      </Card>

      {/* Driver Information */}
      {rideData?.captain && (
        <Card className="p-6 bg-gradient-to-br from-white to-gray-50">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Your Driver</h3>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-md">
                <User className="w-8 h-8 text-gray-600" />
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-xl mb-1">
                  {rideData.captain.fullname?.firstname} {rideData.captain.fullname?.lastname}
                </h4>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" color="gray" size="sm" className="font-mono">
                    {rideData.captain.vehicle?.number}
                  </Badge>
                  <Badge variant="default" color="success" size="sm">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    4.8
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 capitalize font-medium">
                  {rideData.captain.vehicle?.color} {rideData.captain.vehicle?.type}
                </p>
              </div>
            </div>

            {/* Driver Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 font-medium">Trips</p>
                <p className="text-lg font-bold text-blue-800">1,247</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-xs text-green-600 font-medium">Rating</p>
                <p className="text-lg font-bold text-green-800">4.8</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-xl">
                <p className="text-xs text-purple-600 font-medium">Years</p>
                <p className="text-lg font-bold text-purple-800">3.2</p>
              </div>
            </div>
          </div>

          {/* OTP Display */}
          {rideData.otp && (
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-5 rounded-2xl text-center mb-4 shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-gray-300" />
                <p className="text-sm text-gray-300 font-medium">Share this OTP with your driver</p>
              </div>
              <p className="text-3xl font-bold tracking-wider mb-1">{rideData.otp}</p>
              <p className="text-xs text-gray-400">Keep this code secure</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              onClick={onMessageDriver}
              icon={<MessageCircle className="w-4 h-4" />}
            >
              Message
            </Button>
            <Button
              variant="secondary"
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 px-4"
              onClick={onCallDriver}
              icon={<Phone className="w-4 h-4" />}
            >
              Call
            </Button>
          </div>
        </Card>
      )}

      {/* Trip Details */}
      <Card className="p-6 bg-gradient-to-br from-white to-gray-50">
        <div className="flex items-center gap-2 mb-4">
          <Route className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Trip Details</h3>
        </div>
        
        <div className="space-y-4">
          {/* Route Overview */}
          <div className="relative">
            {/* Pickup */}
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
                  {rideData?.pickup?.split(", ")[0]}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {rideData?.pickup?.split(", ").slice(1).join(", ")}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Timer className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">Driver arriving</span>
                </div>
              </div>
            </div>

            {/* Route Line */}
            <div className="flex justify-center mb-3">
              <div className="w-0.5 h-8 bg-gradient-to-b from-green-300 to-red-300 rounded-full"></div>
            </div>

            {/* Destination */}
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
                  {rideData?.destination?.split(", ")[0]}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {rideData?.destination?.split(", ").slice(1).join(", ")}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-red-700 font-medium">Est. arrival time</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Duration</h4>
                  <p className="text-blue-700 font-bold">{estimatedTime}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Route className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Distance</h4>
                  <p className="text-purple-700 font-bold">8.2 km</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Cancel Ride Button */}
      <Card className="p-6">
        <Button
          variant="danger"
          size="lg"
          className="w-full"
          onClick={onCancelRide}
        >
          Cancel Ride
        </Button>
        <p className="text-xs text-gray-500 text-center mt-3">
          Cancellation charges may apply after driver assignment
        </p>
      </Card>
    </div>
  );
};

export default RideTracker;