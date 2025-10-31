/**
 * Reducer for driver acceptance state management
 * Handles all state updates for the driver acceptance flow
 */

import {
  DriverAcceptanceState,
  DriverAcceptanceAction,
  DriverAcceptanceActionTypes,
  initialDriverAcceptanceState
} from './driverAcceptance.types';

export const driverAcceptanceReducer = (
  state: DriverAcceptanceState = initialDriverAcceptanceState,
  action: DriverAcceptanceAction
): DriverAcceptanceState => {
  switch (action.type) {
    case DriverAcceptanceActionTypes.SET_DRIVER_ACCEPTANCE:
      return {
        ...state,
        rideAcceptance: action.payload,
        estimatedArrival: action.payload.estimatedArrival,
        lastUpdated: new Date(),
        isLoading: false,
        error: null
      };

    case DriverAcceptanceActionTypes.UPDATE_ESTIMATED_ARRIVAL:
      return {
        ...state,
        estimatedArrival: action.payload,
        lastUpdated: new Date(),
        isUpdatingArrival: false,
        rideAcceptance: state.rideAcceptance ? {
          ...state.rideAcceptance,
          estimatedArrival: action.payload
        } : null
      };

    case DriverAcceptanceActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error // Clear error when starting to load
      };

    case DriverAcceptanceActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isUpdatingArrival: false
      };

    case DriverAcceptanceActionTypes.CLEAR_DRIVER_ACCEPTANCE:
      return {
        ...initialDriverAcceptanceState
      };

    case DriverAcceptanceActionTypes.SET_UPDATING_ARRIVAL:
      return {
        ...state,
        isUpdatingArrival: action.payload
      };

    case DriverAcceptanceActionTypes.UPDATE_RIDE_STATUS:
      return {
        ...state,
        rideAcceptance: state.rideAcceptance ? {
          ...state.rideAcceptance,
          status: action.payload
        } : null,
        lastUpdated: new Date()
      };

    case DriverAcceptanceActionTypes.SET_LAST_UPDATED:
      return {
        ...state,
        lastUpdated: action.payload
      };

    default:
      return state;
  }
};

// Action creators
export const driverAcceptanceActions = {
  setDriverAcceptance: (acceptance: DriverAcceptanceState['rideAcceptance']) => ({
    type: DriverAcceptanceActionTypes.SET_DRIVER_ACCEPTANCE,
    payload: acceptance
  }),

  updateEstimatedArrival: (minutes: number) => ({
    type: DriverAcceptanceActionTypes.UPDATE_ESTIMATED_ARRIVAL,
    payload: minutes
  }),

  setLoading: (loading: boolean) => ({
    type: DriverAcceptanceActionTypes.SET_LOADING,
    payload: loading
  }),

  setError: (error: string | null) => ({
    type: DriverAcceptanceActionTypes.SET_ERROR,
    payload: error
  }),

  clearDriverAcceptance: () => ({
    type: DriverAcceptanceActionTypes.CLEAR_DRIVER_ACCEPTANCE
  }),

  setUpdatingArrival: (updating: boolean) => ({
    type: DriverAcceptanceActionTypes.SET_UPDATING_ARRIVAL,
    payload: updating
  }),

  updateRideStatus: (status: DriverAcceptanceState['rideAcceptance']['status']) => ({
    type: DriverAcceptanceActionTypes.UPDATE_RIDE_STATUS,
    payload: status
  }),

  setLastUpdated: (date: Date) => ({
    type: DriverAcceptanceActionTypes.SET_LAST_UPDATED,
    payload: date
  })
};