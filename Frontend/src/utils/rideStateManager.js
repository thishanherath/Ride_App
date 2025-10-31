/**
 * Ride State Manager
 * Handles persistent ride state across page refreshes
 */

const RIDE_STATE_KEY = 'currentRideState';
const RIDE_DETAILS_KEY = 'rideDetails';

export const RideStateManager = {
  // Save current ride state
  saveRideState: (state) => {
    try {
      const rideState = {
        ...state,
        timestamp: Date.now()
      };
      localStorage.setItem(RIDE_STATE_KEY, JSON.stringify(rideState));
      console.log('💾 Ride state saved:', rideState);
    } catch (error) {
      console.error('❌ Failed to save ride state:', error);
    }
  },

  // Get current ride state
  getRideState: () => {
    try {
      const stateStr = localStorage.getItem(RIDE_STATE_KEY);
      if (!stateStr) return null;

      const state = JSON.parse(stateStr);
      
      // Check if state is too old (more than 2 hours)
      const twoHours = 2 * 60 * 60 * 1000;
      if (Date.now() - state.timestamp > twoHours) {
        console.log('🕐 Ride state expired, clearing...');
        RideStateManager.clearRideState();
        return null;
      }

      console.log('📖 Ride state loaded:', state);
      return state;
    } catch (error) {
      console.error('❌ Failed to load ride state:', error);
      return null;
    }
  },

  // Clear ride state
  clearRideState: () => {
    try {
      localStorage.removeItem(RIDE_STATE_KEY);
      localStorage.removeItem(RIDE_DETAILS_KEY);
      console.log('🧹 Ride state cleared');
    } catch (error) {
      console.error('❌ Failed to clear ride state:', error);
    }
  },

  // Update specific ride state properties
  updateRideState: (updates) => {
    const currentState = RideStateManager.getRideState();
    if (currentState) {
      const newState = { ...currentState, ...updates };
      RideStateManager.saveRideState(newState);
    }
  },

  // Check if there's an active ride
  hasActiveRide: () => {
    const state = RideStateManager.getRideState();
    return state && (state.rideCreated || state.confirmedRideData);
  },

  // Get ride phase
  getRidePhase: () => {
    const state = RideStateManager.getRideState();
    if (!state) return 'none';
    
    if (state.confirmedRideData) return 'confirmed';
    if (state.rideCreated) return 'searching';
    return 'none';
  }
};

export default RideStateManager;