import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Clock,
  User,
  Phone,
  Car,
  Bike,
  Truck,
  Star,
  Route,
  Timer,
  RefreshCw,
  Filter,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Badge } from '../ui';
import { formatCurrency } from '../../utils/currency';
import axios from 'axios';

const AvailableRides = ({ 
  onAcceptRide, 
  loading = false, 
  className = '',
  refreshInterval = 30000 // 30 seconds
}) => {
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch available rides
  const fetchAvailableRides = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      console.log('🔍 Fetching available rides...');
      console.log('Token exists:', !!token);
      console.log('Server URL:', import.meta.env.VITE_SERVER_URL);
      
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/ride/available-rides`,
        {
          headers: { token }
        }
      );

      console.log('✅ Available rides response:', response.data);
      console.log('Rides count:', response.data.rides?.length || 0);
      
      if (response.data.debug) {
        console.log('🐛 Debug info:', response.data.debug);
      }

      setRides(response.data.rides || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('❌ Error fetching available rides:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError(err.response?.data?.message || 'Failed to fetch rides');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh rides
  useEffect(() => {
    fetchAvailableRides();
    
    const interval = setInterval(fetchAvailableRides, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Filter rides
  const filteredRides = rides.filter(ride => {
    if (filter === 'all') return true;
    if (filter === 'nearby') return ride.distanceToPickup <= 5; // Within 5km
    if (filter === 'high-fare') return ride.fare >= 1000; // High fare rides
    return true;
  });

  // Get vehicle icon
  const getVehicleIcon = (vehicleType) => {
    switch (vehicleType) {
      case 'car': return <Car className="w-4 h-4" />;
      case 'bike': return <Bike className="w-4 h-4" />;
      case 'auto': return <Truck className="w-4 h-4" />;
      default: return <Car className="w-4 h-4" />;
    }
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className={`bg-white rounded-t-3xl shadow-2xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Available Rides</h2>
            <p className="text-sm text-gray-600">
              {filteredRides.length} rides available • Last updated {formatTimeAgo(lastRefresh)}
            </p>
          </div>
          <Button
            onClick={fetchAvailableRides}
            disabled={isLoading}
            variant="secondary"
            size="sm"
            className="p-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All Rides', count: rides.length },
            { key: 'nearby', label: 'Nearby', count: rides.filter(r => r.distanceToPickup <= 5).length },
            { key: 'high-fare', label: 'High Fare', count: rides.filter(r => r.fare >= 1000).length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Rides List */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredRides.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Route className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No rides available</h3>
              <p className="text-gray-600">
                {isLoading ? 'Loading rides...' : 'Check back in a few minutes for new ride requests.'}
              </p>
            </motion.div>
          ) : (
            filteredRides.map((ride, index) => (
              <motion.div
                key={ride._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-gray-100 last:border-b-0"
              >
                <RideCard
                  ride={ride}
                  onAccept={() => onAcceptRide(ride)}
                  loading={loading}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Individual Ride Card Component
const RideCard = ({ ride, onAccept, loading }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-orange-600" />
        </div>

        {/* Ride Details */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {ride.user?.fullname?.firstname} {ride.user?.fullname?.lastname}
              </h3>
              <Badge variant="outline" color="primary" size="xs">
                {getVehicleIcon(ride.vehicle)}
                <span className="ml-1 capitalize">{ride.vehicle}</span>
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-orange-600">
                {formatCurrency(ride.fare)}
              </p>
              <p className="text-xs text-gray-500">
                {ride.distanceToPickup ? `${ride.distanceToPickup}km away` : 'Distance unknown'}
              </p>
            </div>
          </div>

          {/* Route */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-gray-900 font-medium truncate">
                {ride.pickup.split(',')[0]}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Navigation className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-gray-900 font-medium truncate">
                {ride.destination.split(',')[0]}
              </span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(ride.createdAt)}</span>
            </div>
            {ride.estimatedArrival && (
              <div className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                <span>{ride.estimatedArrival} min to pickup</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{ride.user?.phone}</span>
            </div>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium text-gray-700">Pickup:</span>
                      <p className="text-gray-600">{ride.pickup}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Destination:</span>
                      <p className="text-gray-600">{ride.destination}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onAccept}
              disabled={loading}
              variant="primary"
              size="sm"
              className="flex-1"
              loading={loading}
            >
              {loading ? 'Accepting...' : 'Accept Ride'}
            </Button>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="secondary"
              size="sm"
              className="px-3"
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get vehicle icon
const getVehicleIcon = (vehicleType) => {
  switch (vehicleType) {
    case 'car': return <Car className="w-4 h-4" />;
    case 'bike': return <Bike className="w-4 h-4" />;
    case 'auto': return <Truck className="w-4 h-4" />;
    default: return <Car className="w-4 h-4" />;
  }
};

// Helper function to format time ago
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  return new Date(date).toLocaleDateString();
};

export default AvailableRides;