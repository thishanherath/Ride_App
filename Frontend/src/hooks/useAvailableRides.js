import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook to manage available rides for captains
 */
export const useAvailableRides = (refreshInterval = 30000) => {
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [newRidesCount, setNewRidesCount] = useState(0);

  // Fetch available rides
  const fetchAvailableRides = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔍 [useAvailableRides] Fetching available rides...');
      console.log('Token exists:', !!token);

      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/ride/available-rides`,
        {
          headers: { token }
        }
      );

      console.log('✅ [useAvailableRides] Response received:', {
        ridesCount: response.data.rides?.length || 0,
        total: response.data.total,
        debug: response.data.debug
      });

      const newRides = response.data.rides || [];
      
      // Check for new rides (compare with previous rides)
      if (rides.length > 0) {
        const previousRideIds = rides.map(ride => ride._id);
        const newRideIds = newRides.map(ride => ride._id);
        const actuallyNewRides = newRideIds.filter(id => !previousRideIds.includes(id));
        
        if (actuallyNewRides.length > 0) {
          console.log(`🆕 [useAvailableRides] Found ${actuallyNewRides.length} new rides`);
          setNewRidesCount(prev => prev + actuallyNewRides.length);
          
          // Show notification for new rides
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Ride Available!', {
              body: `${actuallyNewRides.length} new ride${actuallyNewRides.length > 1 ? 's' : ''} available`,
              icon: '/logo-quickride.png',
              tag: 'new-rides'
            });
          }
        }
      }

      setRides(newRides);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('❌ [useAvailableRides] Error fetching available rides:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to fetch rides');
    } finally {
      setIsLoading(false);
    }
  }, [rides]);

  // Remove ride from list when taken by another driver
  const removeRideFromList = useCallback((rideId) => {
    setRides(prevRides => {
      const updatedRides = prevRides.filter(ride => ride._id !== rideId);
      console.log(`🗑️ [useAvailableRides] Removed ride ${rideId} from list. Remaining: ${updatedRides.length}`);
      return updatedRides;
    });
  }, []);

  // Auto-refresh rides with optimized intervals
  useEffect(() => {
    fetchAvailableRides();
    
    // Faster refresh interval for better responsiveness
    const interval = setInterval(fetchAvailableRides, Math.min(refreshInterval, 15000)); // Max 15 seconds
    
    // Listen for ride-taken events to remove rides in real-time
    const handleRideTaken = (event) => {
      const { rideId } = event.detail;
      removeRideFromList(rideId);
    };
    
    // Listen for new ride events to refresh immediately
    const handleNewRideAvailable = (event) => {
      console.log('🚨 New ride event received, refreshing available rides...');
      // Immediate refresh when new ride is available
      setTimeout(fetchAvailableRides, 100);
    };
    
    window.addEventListener('ride-taken', handleRideTaken);
    window.addEventListener('new-ride-available', handleNewRideAvailable);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('ride-taken', handleRideTaken);
      window.removeEventListener('new-ride-available', handleNewRideAvailable);
    };
  }, [refreshInterval, removeRideFromList, fetchAvailableRides]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Clear new rides count when rides are viewed
  const markRidesAsViewed = useCallback(() => {
    setNewRidesCount(0);
  }, []);

  // Filter rides by criteria
  const getFilteredRides = useCallback((filter = 'all') => {
    switch (filter) {
      case 'nearby':
        return rides.filter(ride => ride.distanceToPickup <= 5);
      case 'high-fare':
        return rides.filter(ride => ride.fare >= 1000);
      case 'recent':
        return rides.filter(ride => {
          const rideTime = new Date(ride.createdAt);
          const now = new Date();
          return (now - rideTime) <= 10 * 60 * 1000; // Last 10 minutes
        });
      default:
        return rides;
    }
  }, [rides]);

  // Get ride statistics
  const getRideStats = useCallback(() => {
    return {
      total: rides.length,
      nearby: rides.filter(ride => ride.distanceToPickup <= 5).length,
      highFare: rides.filter(ride => ride.fare >= 1000).length,
      recent: rides.filter(ride => {
        const rideTime = new Date(ride.createdAt);
        const now = new Date();
        return (now - rideTime) <= 10 * 60 * 1000;
      }).length,
      averageFare: rides.length > 0 
        ? Math.round(rides.reduce((sum, ride) => sum + ride.fare, 0) / rides.length)
        : 0,
      averageDistance: rides.length > 0
        ? Math.round((rides.reduce((sum, ride) => sum + (ride.distanceToPickup || 0), 0) / rides.length) * 100) / 100
        : 0
    };
  }, [rides]);

  return {
    rides,
    isLoading,
    error,
    lastRefresh,
    newRidesCount,
    fetchAvailableRides,
    markRidesAsViewed,
    getFilteredRides,
    getRideStats,
    removeRideFromList
  };
};

export default useAvailableRides;