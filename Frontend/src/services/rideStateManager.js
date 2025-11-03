class RideStateManager {
  constructor() {
    this.listeners = [];
    this.currentState = {
      status: 'idle', // idle, searching, accepted, ongoing, completed, cancelled
      rideData: null,
      driverData: null,
      error: null,
      timestamp: null
    };
  }

  // Subscribe to state changes
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Update state and notify all listeners
  updateState(newState) {
    const previousState = { ...this.currentState };
    this.currentState = {
      ...this.currentState,
      ...newState,
      timestamp: new Date().toISOString()
    };

    console.log(`🔄 Ride State Change: ${previousState.status} → ${this.currentState.status}`, this.currentState);

    // Notify all listeners
    this.listeners.forEach(callback => {
      try {
        callback(this.currentState, previousState);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });

    // Store in localStorage for persistence
    localStorage.setItem('rideState', JSON.stringify(this.currentState));
  }

  // Get current state
  getState() {
    return this.currentState;
  }

  // Load state from localStorage
  loadPersistedState() {
    try {
      const stored = localStorage.getItem('rideState');
      if (stored) {
        const parsedState = JSON.parse(stored);
        // Only restore if it's not idle and not too old (5 minutes)
        const stateAge = Date.now() - new Date(parsedState.timestamp).getTime();
        if (parsedState.status !== 'idle' && stateAge < 300000) {
          this.currentState = parsedState;
          console.log('🔄 Restored ride state from localStorage:', this.currentState);
          return true;
        }
      }
    } catch (error) {
      console.error('Error loading persisted state:', error);
    }
    return false;
  }

  // Clear state
  clearState() {
    this.updateState({
      status: 'idle',
      rideData: null,
      driverData: null,
      error: null
    });
    localStorage.removeItem('rideState');
  }

  // Handle ride booking
  bookRide(rideData) {
    this.updateState({
      status: 'searching',
      rideData,
      error: null
    });
  }

  // Handle driver acceptance
  driverAccepted(driverData, rideData) {
    this.updateState({
      status: 'accepted',
      driverData,
      rideData: rideData || this.currentState.rideData,
      error: null
    });
  }

  // Handle ride start
  rideStarted() {
    this.updateState({
      status: 'ongoing',
      error: null
    });
  }

  // Handle ride completion
  rideCompleted() {
    this.updateState({
      status: 'completed',
      error: null
    });
  }

  // Handle ride cancellation
  rideCancelled(reason = null) {
    this.updateState({
      status: 'cancelled',
      error: reason
    });
  }

  // Handle errors
  setError(error) {
    this.updateState({
      error
    });
  }
}

// Create singleton instance
const rideStateManager = new RideStateManager();

export default rideStateManager;