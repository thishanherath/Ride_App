/**
 * Ride History Hook
 * Fetches and manages user's ride history data
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useRideHistory = (userType = 'user') => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasMore: false
  });

  const token = localStorage.getItem('token');

  // Fetch ride history
  const fetchRideHistory = useCallback(async (page = 1, status = null, append = false) => {
    if (!token) {
      setError('No authentication token found');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
      const endpoint = userType === 'captain' 
        ? `${serverUrl}/ride/captain/history`
        : `${serverUrl}/ride/user/history`;

      const params = {
        page,
        limit: pagination.limit
      };

      if (status) {
        params.status = status;
      }

      console.log(`🔍 Fetching ${userType} ride history:`, { endpoint, params });

      const response = await axios.get(endpoint, {
        params,
        headers: {
          token: token,
        },
      });

      if (response.data.success) {
        const newRides = response.data.rides || [];
        
        setRides(prevRides => {
          if (append && page > 1) {
            // Append new rides for pagination
            return [...prevRides, ...newRides];
          } else {
            // Replace rides for new search or first load
            return newRides;
          }
        });

        setPagination({
          page: response.data.page || 1,
          limit: pagination.limit,
          total: response.data.total || 0,
          pages: response.data.pages || 0,
          hasMore: response.data.hasMore || false
        });

        console.log(`✅ Loaded ${newRides.length} rides (total: ${response.data.total})`);
      } else {
        throw new Error(response.data.message || 'Failed to fetch ride history');
      }

    } catch (err) {
      console.error('❌ Error fetching ride history:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch ride history');
      
      // Set empty state on error
      if (!append) {
        setRides([]);
        setPagination(prev => ({ ...prev, total: 0, pages: 0, hasMore: false }));
      }
    } finally {
      setLoading(false);
    }
  }, [token, userType]); // Removed pagination.limit to prevent infinite re-renders

  // Load more rides (pagination)
  const loadMore = useCallback(() => {
    if (!loading && pagination.hasMore) {
      fetchRideHistory(pagination.page + 1, null, true);
    }
  }, [fetchRideHistory, loading, pagination.hasMore, pagination.page]);

  // Filter rides by status
  const filterByStatus = useCallback((status) => {
    fetchRideHistory(1, status, false);
  }, [fetchRideHistory]);

  // Refresh ride history
  const refresh = useCallback(() => {
    fetchRideHistory(1, null, false);
  }, [fetchRideHistory]);

  // Initial load - only run once when component mounts
  useEffect(() => {
    if (token) {
      fetchRideHistory();
    }
  }, [token, userType]); // Removed fetchRideHistory from dependencies to prevent infinite loops

  // Classify rides by date
  const classifyRidesByDate = useCallback((ridesArray) => {
    if (!ridesArray || ridesArray.length === 0) {
      return { today: [], yesterday: [], earlier: [] };
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = (date) =>
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    const isYesterday = (date) =>
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate();

    const sortByDate = (rides) =>
      rides.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const todayRides = [];
    const yesterdayRides = [];
    const earlierRides = [];

    ridesArray.forEach((ride) => {
      const createdDate = new Date(ride.createdAt);
      if (isToday(createdDate)) {
        todayRides.push(ride);
      } else if (isYesterday(createdDate)) {
        yesterdayRides.push(ride);
      } else {
        earlierRides.push(ride);
      }
    });

    return {
      today: sortByDate(todayRides),
      yesterday: sortByDate(yesterdayRides),
      earlier: sortByDate(earlierRides),
    };
  }, []);

  // Get ride statistics
  const getRideStats = useCallback(() => {
    const stats = {
      total: rides.length,
      completed: rides.filter(ride => ride.status === 'completed').length,
      cancelled: rides.filter(ride => ride.status === 'cancelled').length,
      totalFare: rides
        .filter(ride => ride.status === 'completed')
        .reduce((sum, ride) => sum + (ride.fare || 0), 0)
    };

    return stats;
  }, [rides]);

  return {
    rides,
    loading,
    error,
    pagination,
    fetchRideHistory,
    loadMore,
    filterByStatus,
    refresh,
    classifyRidesByDate: () => classifyRidesByDate(rides),
    getRideStats,
    hasRides: rides.length > 0
  };
};

export default useRideHistory;