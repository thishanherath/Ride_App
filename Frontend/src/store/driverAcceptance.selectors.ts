/**
 * Selectors for driver acceptance state
 * Provides optimized access to driver acceptance data
 */

import { DriverAcceptanceState } from './driverAcceptance.types';
import { RideStatus } from '../types/driver.types';

// Basic selectors
export const getDriverAcceptance = (state: DriverAcceptanceState) => state.rideAcceptance;

export const getDriver = (state: DriverAcceptanceState) => 
  state.rideAcceptance?.driver || null;

export const getVehicle = (state: DriverAcceptanceState) => 
  state.rideAcceptance?.vehicle || null;

export const getEstimatedArrival = (state: DriverAcceptanceState) => 
  state.estimatedArrival;

export const getCurrentStatus = (state: DriverAcceptanceState) => 
  state.rideAcceptance?.status || null;

export const getIsLoading = (state: DriverAcceptanceState) => 
  state.isLoading;

export const getError = (state: DriverAcceptanceState) => 
  state.error;

export const getIsUpdatingArrival = (state: DriverAcceptanceState) => 
  state.isUpdatingArrival;

export const getLastUpdated = (state: DriverAcceptanceState) => 
  state.lastUpdated;

// Computed selectors
export const getCanCancel = (state: DriverAcceptanceState): boolean => {
  const status = getCurrentStatus(state);
  return status !== null && [
    RideStatus.DRIVER_ASSIGNED,
    RideStatus.DRIVER_EN_ROUTE
  ].includes(status);
};

export const getIsDriverEnRoute = (state: DriverAcceptanceState): boolean => {
  const status = getCurrentStatus(state);
  return status === RideStatus.DRIVER_EN_ROUTE;
};

export const getIsDriverArrived = (state: DriverAcceptanceState): boolean => {
  const status = getCurrentStatus(state);
  return status === RideStatus.DRIVER_ARRIVED;
};

export const getIsRideActive = (state: DriverAcceptanceState): boolean => {
  const status = getCurrentStatus(state);
  return status !== null && [
    RideStatus.DRIVER_ASSIGNED,
    RideStatus.DRIVER_EN_ROUTE,
    RideStatus.DRIVER_ARRIVED,
    RideStatus.RIDE_STARTED
  ].includes(status);
};

export const getDriverContactInfo = (state: DriverAcceptanceState) => {
  const driver = getDriver(state);
  return driver ? {
    name: driver.name,
    phoneNumber: driver.phoneNumber,
    canCall: !!driver.phoneNumber,
    canMessage: !!driver.phoneNumber
  } : null;
};

export const getVehicleDisplayInfo = (state: DriverAcceptanceState) => {
  const vehicle = getVehicle(state);
  return vehicle ? {
    displayName: `${vehicle.color} ${vehicle.make} ${vehicle.model}`,
    licensePlate: vehicle.licensePlate,
    type: vehicle.type,
    capacity: vehicle.capacity,
    year: vehicle.year
  } : null;
};

export const getArrivalDisplayInfo = (state: DriverAcceptanceState) => {
  const estimatedArrival = getEstimatedArrival(state);
  const lastUpdated = getLastUpdated(state);
  const isUpdating = getIsUpdatingArrival(state);

  if (estimatedArrival === null) {
    return {
      displayText: 'Calculating arrival time...',
      isAvailable: false,
      isUpdating
    };
  }

  const displayText = estimatedArrival === 0 
    ? 'Driver has arrived'
    : estimatedArrival === 1 
      ? 'Arriving in 1 minute'
      : `Arriving in ${estimatedArrival} minutes`;

  return {
    displayText,
    isAvailable: true,
    isUpdating,
    lastUpdated,
    minutes: estimatedArrival
  };
};

export const getRideProgressInfo = (state: DriverAcceptanceState) => {
  const status = getCurrentStatus(state);
  const rideAcceptance = getDriverAcceptance(state);

  if (!status || !rideAcceptance) {
    return null;
  }

  const statusSteps = [
    { status: RideStatus.BOOKING_CONFIRMED, label: 'Booking Confirmed', completed: true },
    { status: RideStatus.DRIVER_ASSIGNED, label: 'Driver Assigned', completed: true },
    { status: RideStatus.DRIVER_EN_ROUTE, label: 'Driver En Route', completed: status !== RideStatus.DRIVER_ASSIGNED },
    { status: RideStatus.DRIVER_ARRIVED, label: 'Driver Arrived', completed: [RideStatus.DRIVER_ARRIVED, RideStatus.RIDE_STARTED].includes(status) },
    { status: RideStatus.RIDE_STARTED, label: 'Ride Started', completed: status === RideStatus.RIDE_STARTED }
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.status === status);
  const nextStep = currentStepIndex < statusSteps.length - 1 ? statusSteps[currentStepIndex + 1] : null;

  return {
    currentStatus: status,
    currentStepIndex,
    steps: statusSteps,
    nextStep: nextStep?.label || null,
    progress: ((currentStepIndex + 1) / statusSteps.length) * 100
  };
};

// Memoized selectors object for easy import
export const driverAcceptanceSelectors = {
  getDriverAcceptance,
  getDriver,
  getVehicle,
  getEstimatedArrival,
  getCurrentStatus,
  getIsLoading,
  getError,
  getIsUpdatingArrival,
  getLastUpdated,
  getCanCancel,
  getIsDriverEnRoute,
  getIsDriverArrived,
  getIsRideActive,
  getDriverContactInfo,
  getVehicleDisplayInfo,
  getArrivalDisplayInfo,
  getRideProgressInfo
};