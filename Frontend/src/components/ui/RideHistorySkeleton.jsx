/**
 * Ride History Loading Skeleton
 * Shows loading placeholders for smooth navigation
 */

import React from 'react';

const RideHistorySkeleton = () => {
  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 w-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Ride Cards Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <RideCardSkeleton key={index} />
          ))}
        </div>
      </div>

      {/* Another Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 w-6 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="space-y-3">
          {[1, 2].map((index) => (
            <RideCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

const RideCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Route Information */}
      <div className="flex items-start gap-4">
        {/* Route Line */}
        <div className="flex flex-col items-center mt-1">
          <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="w-0.5 h-8 bg-gray-200 my-1 animate-pulse"></div>
          <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        {/* Locations */}
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-100 mt-4">
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
};

export default RideHistorySkeleton;