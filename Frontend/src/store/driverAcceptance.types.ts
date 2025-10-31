/**
 * State management types for driver acceptance flow
 * Defines actions, state shape, and reducers for driver acceptance feature
 */

import { RideAcceptance, RideStatus, DriverAcceptanceState } from '../types/driver.types';

// Action types
export enum DriverAcceptanceActionTypes {
  SET_DRIVER_ACCEPTANCE = 'SET_DRIVER_ACCEPTANCE',
  UPDATE_ESTIMATED_ARRIVAL = 'UPDATE_ESTIMATED_ARRIVAL',
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  CLEAR_DRIVER_ACCEPTANCE = 'CLEAR_DRIVER_ACCEPTANCE',
  SET_UPDATING_ARRIVAL = 'SET_UPDATING_ARRIVAL',
  UPDATE_RIDE_STATUS = 'UPDATE_RIDE_STATUS',
  SET_LAST_UPDATED = 'SET_LAST_UPDATED'
}

// Action interfaces
export interface SetDriverAcceptanceAction {
  type: DriverAcceptanceActionTypes.SET_DRIVER_ACCEPTANCE;
  payload: RideAcceptance;
}

export interface UpdateEstimatedArrivalAction {
  type: DriverAcceptanceActionTypes.UPDATE_ESTIMATED_ARRIVAL;
  payload: number;
}

export interface SetLoadingAction {
  type: DriverAcceptanceActionTypes.SET_LOADING;
  payload: boolean;
}

export interface SetErrorAction {
  type: DriverAcceptanceActionTypes.SET_ERROR;
  payload: string | null;
}

export interface ClearDriverAcceptanceAction {
  type: DriverAcceptanceActionTypes.CLEAR_DRIVER_ACCEPTANCE;
}

export interface SetUpdatingArrivalAction {
  type: DriverAcceptanceActionTypes.SET_UPDATING_ARRIVAL;
  payload: boolean;
}

export interface UpdateRideStatusAction {
  type: DriverAcceptanceActionTypes.UPDATE_RIDE_STATUS;
  payload: RideStatus;
}

export interface SetLastUpdatedAction {
  type: DriverAcceptanceActionTypes.SET_LAST_UPDATED;
  payload: Date;
}

// Union type for all actions
export type DriverAcceptanceAction =
  | SetDriverAcceptanceAction
  | UpdateEstimatedArrivalAction
  | SetLoadingAction
  | SetErrorAction
  | ClearDriverAcceptanceAction
  | SetUpdatingArrivalAction
  | UpdateRideStatusAction
  | SetLastUpdatedAction;

// Initial state
export const initialDriverAcceptanceState: DriverAcceptanceState = {
  isLoading: false,
  error: null,
  rideAcceptance: null,
  estimatedArrival: null,
  lastUpdated: null,
  isUpdatingArrival: false
};

// Selector types
export interface DriverAcceptanceSelectors {
  getDriverAcceptance: (state: DriverAcceptanceState) => RideAcceptance | null;
  getDriver: (state: DriverAcceptanceState) => RideAcceptance['driver'] | null;
  getVehicle: (state: DriverAcceptanceState) => RideAcceptance['vehicle'] | null;
  getEstimatedArrival: (state: DriverAcceptanceState) => number | null;
  getCurrentStatus: (state: DriverAcceptanceState) => RideStatus | null;
  getIsLoading: (state: DriverAcceptanceState) => boolean;
  getError: (state: DriverAcceptanceState) => string | null;
  getIsUpdatingArrival: (state: DriverAcceptanceState) => boolean;
  getLastUpdated: (state: DriverAcceptanceState) => Date | null;
  getCanCancel: (state: DriverAcceptanceState) => boolean;
}

// Thunk action types for async operations
export interface DriverAcceptanceThunkActions {
  fetchDriverAcceptance: (rideId: string) => Promise<void>;
  refreshArrivalTime: (rideId: string) => Promise<void>;
  cancelRide: (rideId: string, reason?: string) => Promise<void>;
  contactDriver: (driverId: string, method: 'call' | 'message') => Promise<void>;
  updateDriverLocation: (driverId: string) => Promise<void>;
}

// WebSocket event types for real-time updates
export enum DriverAcceptanceWebSocketEvents {
  DRIVER_ACCEPTED = 'driver_accepted',
  ARRIVAL_TIME_UPDATED = 'arrival_time_updated',
  DRIVER_LOCATION_UPDATED = 'driver_location_updated',
  RIDE_STATUS_CHANGED = 'ride_status_changed',
  RIDE_CANCELLED = 'ride_cancelled'
}

export interface DriverAcceptanceWebSocketPayload {
  rideId: string;
  driverId?: string;
  estimatedArrival?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  status?: RideStatus;
  timestamp: Date;
}

// Error types
export enum DriverAcceptanceErrorTypes {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DRIVER_NOT_FOUND = 'DRIVER_NOT_FOUND',
  RIDE_NOT_FOUND = 'RIDE_NOT_FOUND',
  CANCELLATION_FAILED = 'CANCELLATION_FAILED',
  CONTACT_FAILED = 'CONTACT_FAILED',
  LOCATION_UPDATE_FAILED = 'LOCATION_UPDATE_FAILED'
}

export interface DriverAcceptanceError {
  type: DriverAcceptanceErrorTypes;
  message: string;
  details?: any;
  timestamp: Date;
}