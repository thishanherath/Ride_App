import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  CreditCard,
  MapPin,
  Navigation,
  Route,
  RefreshCw,
  Loader
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import { NoRidesEmpty } from "../components/ui/EmptyState";
import { StatusBadge } from "../components/ui/Badge";
import { formatCurrency } from "../utils/currency";
import useRideHistory from "../hooks/useRideHistory";
import { useUser } from "../contexts/UserContext";
import { useCaptain } from "../contexts/CaptainContext";
import RideHistorySkeleton from "../components/ui/RideHistorySkeleton";

function RideHistory() {
  const navigation = useNavigate();
  const { user } = useUser();
  const { captain } = useCaptain();
  
  // Determine user type based on current context
  const userType = captain ? 'captain' : 'user';
  const currentUser = captain || user;
  
  const [expandedSections, setExpandedSections] = useState({
    today: true,
    yesterday: true,
    earlier: true
  });

  const {
    rides,
    loading,
    error,
    pagination,
    refresh,
    classifyRidesByDate,
    getRideStats,
    hasRides
  } = useRideHistory(userType);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const classifiedRides = classifyRidesByDate();
  const rideStats = getRideStats();

  // Handle refresh
  const handleRefresh = () => {
    refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigation(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Ride History</h1>
              {hasRides && (
                <p className="text-sm text-gray-500">
                  {rideStats.total} rides • {rideStats.completed} completed
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-700 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Loading State with Skeleton */}
        {loading && rides.length === 0 && (
          <RideHistorySkeleton />
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <div className="text-red-500 mb-4">
              <Calendar className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Rides</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !hasRides && (
          <NoRidesEmpty 
            onBookRide={() => navigation(userType === 'captain' ? '/captain-home' : '/user-home')}
            className="mt-20"
          />
        )}

        {/* Rides Content */}
        {!loading && !error && hasRides && (
          <div className="space-y-6">
            {/* Today Section */}
            <RideSection
              title="Today"
              rides={classifiedRides.today}
              isExpanded={expandedSections.today}
              onToggle={() => toggleSection('today')}
            />

            {/* Yesterday Section */}
            <RideSection
              title="Yesterday"
              rides={classifiedRides.yesterday}
              isExpanded={expandedSections.yesterday}
              onToggle={() => toggleSection('yesterday')}
            />

            {/* Earlier Section */}
            <RideSection
              title="Earlier"
              rides={classifiedRides.earlier}
              isExpanded={expandedSections.earlier}
              onToggle={() => toggleSection('earlier')}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Modern collapsible section component
const RideSection = ({ title, rides, isExpanded, onToggle }) => {
  return (
    <div className="space-y-3">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {rides.length > 0 && (
            <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {rides.length}
            </span>
          )}
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`} 
        />
      </button>

      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="space-y-3">
          {rides.length > 0 ? (
            rides.map((ride) => (
              <ModernRideCard ride={ride} key={ride._id} />
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Calendar className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-gray-500 text-sm">No rides found for {title.toLowerCase()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Modern ride card component
export const ModernRideCard = ({ ride }) => {
  function formatDate(inputDate) {
    const date = new Date(inputDate);
    const options = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  }

  function formatTime(inputDate) {
    const date = new Date(inputDate);
    const options = { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    };
    return date.toLocaleTimeString('en-US', options);
  }

  function formatDateTime(inputDate) {
    const date = new Date(inputDate);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatTime(inputDate);
    } else if (diffInHours < 48) {
      return `Yesterday, ${formatTime(inputDate)}`;
    } else {
      return `${formatDate(inputDate)}, ${formatTime(inputDate)}`;
    }
  }

  const getRideStatus = (ride) => {
    // Determine ride status based on available data
    if (ride.status) return ride.status;
    if (ride.fare && ride.fare > 0) return 'completed';
    return 'completed'; // Default for historical rides
  };

  const getRideFare = (ride) => {
    // Handle different fare structures
    if (typeof ride.fare === 'number') return ride.fare;
    if (ride.fare && typeof ride.fare === 'object') {
      // If fare is an object with vehicle types
      return ride.fare[ride.vehicle] || ride.fare.car || ride.fare.auto || ride.fare.bike || 0;
    }
    return 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'in-progress': return 'primary';
      default: return 'gray';
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 cursor-pointer" padding="none">
      <div className="p-6">
        {/* Header with date/time and status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{formatDateTime(ride.createdAt)}</span>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={getRideStatus(ride)} />
            <div className="flex items-center gap-1 text-lg font-semibold text-gray-900">
              <CreditCard className="w-4 h-4 text-gray-500" />
              {formatCurrency(getRideFare(ride))}
            </div>
          </div>
        </div>

        {/* Route Information */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            {/* Route Line */}
            <div className="flex flex-col items-center mt-1">
              <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
              <div className="w-0.5 h-8 bg-gray-200 my-1"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md"></div>
            </div>

            {/* Locations */}
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Pickup</span>
                </div>
                <p className="text-gray-900 font-medium leading-tight" title={ride.pickup}>
                  {ride.pickup}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Navigation className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-red-700 uppercase tracking-wide">Destination</span>
                </div>
                <p className="text-gray-900 font-medium leading-tight" title={ride.destination}>
                  {ride.destination}
                </p>
              </div>
            </div>
          </div>

          {/* Additional ride details */}
          {(ride.distance || ride.duration || ride.vehicleType) && (
            <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
              {ride.distance && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Route className="w-4 h-4" />
                  <span>{Math.round(ride.distance / 1000)} km</span>
                </div>
              )}
              {ride.duration && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{Math.round(ride.duration / 60)} min</span>
                </div>
              )}
              {(ride.vehicleType || ride.vehicle) && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <span className="font-medium capitalize">{ride.vehicleType || ride.vehicle}</span>
                </div>
              )}
              {ride.captain && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <span>Captain: {ride.captain.fullname?.firstname} {ride.captain.fullname?.lastname}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Legacy component for backward compatibility
export const Ride = ({ ride }) => {
  return <ModernRideCard ride={ride} />;
};
export default RideHistory;
