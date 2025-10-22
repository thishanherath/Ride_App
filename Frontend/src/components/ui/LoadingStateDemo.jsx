import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { 
  Skeleton, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonList, 
  SkeletonRideCard, 
  SkeletonProfile 
} from './Skeleton';
import { 
  ProgressBar, 
  RideProgressBar, 
  LoadingProgress 
} from './ProgressBar';
import { 
  EmptyState, 
  NoRidesEmpty, 
  NoSearchResultsEmpty, 
  ErrorEmpty 
} from './EmptyState';
import { 
  Badge, 
  StatusBadge, 
  RideBadge, 
  VehicleTypeBadge, 
  RatingBadge, 
  NotificationBadge 
} from './Badge';

const LoadingStateDemo = () => {
  const [progress, setProgress] = useState(0);
  const [rideStep, setRideStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 10));
      setRideStep(prev => (prev >= 3 ? 0 : prev + 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-12 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Loading & State Components Demo</h1>

        {/* Loading Spinners */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Loading Spinners</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <LoadingSpinner size="lg" color="primary" />
              <p className="mt-2 text-sm text-gray-600">Default</p>
            </div>
            <div className="text-center">
              <LoadingSpinner variant="dots" size="lg" color="primary" />
              <p className="mt-2 text-sm text-gray-600">Dots</p>
            </div>
            <div className="text-center">
              <LoadingSpinner variant="pulse" size="lg" color="primary" />
              <p className="mt-2 text-sm text-gray-600">Pulse</p>
            </div>
            <div className="text-center">
              <LoadingSpinner variant="bars" size="lg" color="primary" />
              <p className="mt-2 text-sm text-gray-600">Bars</p>
            </div>
          </div>
        </section>

        {/* Skeleton Components */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Skeleton Loading</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Skeleton Card</h3>
              <SkeletonCard />
            </div>
            <div>
              <h3 className="font-medium mb-3">Skeleton Ride Card</h3>
              <SkeletonRideCard />
            </div>
            <div>
              <h3 className="font-medium mb-3">Skeleton List</h3>
              <SkeletonList items={3} />
            </div>
            <div>
              <h3 className="font-medium mb-3">Skeleton Profile</h3>
              <SkeletonProfile />
            </div>
          </div>
        </section>

        {/* Progress Bars */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Progress Indicators</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">Linear Progress</h3>
              <ProgressBar progress={progress} showLabel={true} label="Loading..." />
            </div>
            <div>
              <h3 className="font-medium mb-3">Circular Progress</h3>
              <ProgressBar progress={progress} variant="circular" showLabel={true} />
            </div>
            <div>
              <h3 className="font-medium mb-3">Ride Progress</h3>
              <RideProgressBar currentStep={rideStep} />
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Badges</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">Status Badges</h3>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="active" />
                <StatusBadge status="pending" />
                <StatusBadge status="completed" />
                <StatusBadge status="cancelled" />
                <StatusBadge status="in-progress" />
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-3">Ride Badges</h3>
              <div className="flex flex-wrap gap-2">
                <RideBadge rideStatus="ride-requested" />
                <RideBadge rideStatus="driver-assigned" />
                <RideBadge rideStatus="driver-arrived" />
                <RideBadge rideStatus="ride-started" />
                <RideBadge rideStatus="ride-completed" />
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-3">Vehicle & Rating Badges</h3>
              <div className="flex flex-wrap gap-2">
                <VehicleTypeBadge vehicleType="auto" />
                <VehicleTypeBadge vehicleType="bike" />
                <VehicleTypeBadge vehicleType="car" />
                <RatingBadge rating={4.8} />
                <div className="relative">
                  <Badge variant="outline" color="gray">Notifications</Badge>
                  <NotificationBadge count={5} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Empty States */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Empty States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-xl">
              <NoRidesEmpty />
            </div>
            <div className="border border-gray-200 rounded-xl">
              <NoSearchResultsEmpty searchTerm="test query" />
            </div>
            <div className="border border-gray-200 rounded-xl">
              <ErrorEmpty />
            </div>
            <div className="border border-gray-200 rounded-xl">
              <EmptyState
                variant="messages"
                title="Custom Empty State"
                description="This is a custom empty state with custom content."
                action={
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-lg">
                    Custom Action
                  </button>
                }
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoadingStateDemo;