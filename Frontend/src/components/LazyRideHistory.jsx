/**
 * Lazy Loading Wrapper for RideHistory
 * Improves navigation performance by showing immediate feedback
 */

import React, { Suspense } from 'react';
import RideHistorySkeleton from './ui/RideHistorySkeleton';

// Lazy load the RideHistory component
const RideHistory = React.lazy(() => import('../screens/RideHistory'));

const LazyRideHistory = () => {
  return (
    <Suspense fallback={<RideHistoryFallback />}>
      <RideHistory />
    </Suspense>
  );
};

// Fallback component with immediate header and skeleton
const RideHistoryFallback = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Immediate Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
              <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Ride History</h1>
              <p className="text-sm text-gray-500">Loading your rides...</p>
            </div>
          </div>
          
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
          </button>
        </div>
      </div>

      {/* Skeleton Content */}
      <RideHistorySkeleton />
    </div>
  );
};

export default LazyRideHistory;