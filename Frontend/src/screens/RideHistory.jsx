import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  CreditCard,
  MapPin,
  Navigation,
  Route
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import { NoRidesEmpty } from "../components/ui/EmptyState";
import { StatusBadge } from "../components/ui/Badge";
import { formatCurrency } from "../utils/currency";

function RideHistory() {
  const navigation = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [user, setUser] = useState(userData.data);
  const [expandedSections, setExpandedSections] = useState({
    today: true,
    yesterday: true,
    earlier: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  function classifyAndSortRides(rides) {
    if (!rides || rides.length === 0) return { today: [], yesterday: [], earlier: [] };
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Helper function to check if a date is today
    const isToday = (date) =>
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    // Helper function to check if a date is yesterday
    const isYesterday = (date) =>
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate();

    // Helper function to sort rides by date (recent to oldest)
    const sortByDate = (rides) =>
      rides.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Arrays to hold classified rides
    const todayRides = [];
    const yesterdayRides = [];
    const earlierRides = [];

    // Classify rides
    rides.forEach((ride) => {
      const createdDate = new Date(ride.createdAt);
      if (isToday(createdDate)) {
        todayRides.push(ride);
      } else if (isYesterday(createdDate)) {
        yesterdayRides.push(ride);
      } else {
        earlierRides.push(ride);
      }
    });

    // Return sorted arrays
    return {
      today: sortByDate(todayRides),
      yesterday: sortByDate(yesterdayRides),
      earlier: sortByDate(earlierRides),
    };
  }

  const classifiedRides = classifyAndSortRides(user.rides);
  const hasAnyRides = classifiedRides.today.length > 0 || 
                     classifiedRides.yesterday.length > 0 || 
                     classifiedRides.earlier.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-4 px-6 py-4">
          <button
            onClick={() => navigation(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Ride History</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        {!hasAnyRides ? (
          <NoRidesEmpty 
            onBookRide={() => navigation('/user-home')}
            className="mt-20"
          />
        ) : (
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
              {formatCurrency(ride.fare)}
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
              {ride.vehicleType && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <span className="font-medium capitalize">{ride.vehicleType}</span>
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
