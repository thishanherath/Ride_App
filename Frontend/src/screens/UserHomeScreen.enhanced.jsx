/**
 * Enhanced UserHomeScreen with Proper State Persistence and Progress Updates
 * Fixes issues with progress bar not updating and page refresh resetting state
 */

import React, { useState, useEffect, useContext } from 'react';
import { SocketDataContext } from '../contexts/SocketContext';
import RideSearchProgress from '../components/RideSearchProgress';
import ModernRideConfirmation from '../components/ModernRideConfirmation';
import RideDetails from '../components/RideDetails';
import RideStateManager from '../utils/rideStateManager';
import axios from 'axios';

const EnhancedUserHomeScreen = () => {
  // Core ride state
  const [rideId, setRideId] = useState(null);
  const [rideCreated, setRideCreated] = useState(false);
  const [confirmedRideData, setConfirmedRideData] = useState(null);
  const [loading, setLoading] = useState(false);

  // UI state
  const [showRideDetailsPanel, setShowRideDetailsPanel] = useState(false);
  const [showSelectVehiclePanel, setShowSelectVehiclePanel] = useState(false);
  const [showFindTripPanel, setShowFindTripPanel] = useState(true);

  // Ride configuration
  const [pickupLocation, setPickupLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("car");
  const [fare, setFare] = useState({ auto: 0, car: 0, bike: 0 });

  // Socket context
  const { socket } = useContext(SocketDataContext);

  // Initialize state from localStorage on component mount
  useEffect(() => {
    const savedState = RideStateManager.getRideState();
    if (savedState) {
      console.log('🔄 Restoring ride state from localStorage:', savedState);
      
      // Restore ride state
      setRideId(savedState.rideId || null);
      setRideCreated(savedState.rideCreated || false);
      setConfirmedRideData(savedState.confirmedRideData || null);
      
      // Restore ride configuration
      setPickupLocation(savedState.pickupLocation || "");
      setDestinationLocation(savedState.destinationLocation || "");
      setSelectedVehicle(savedState.selectedVehicle || "car");
      setFare(savedState.fare || { auto: 0, car: 0, bike: 0 });
      
      // Restore UI state
      setShowRideDetailsPanel(savedState.showRideDetailsPanel || false);
      setShowSelectVehiclePanel(savedState.showSelectVehiclePanel || false);
      setShowFindTripPanel(savedState.showFindTripPanel !== false); // Default to true
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const currentState = {
      rideId,
      rideCreated,
      confirmedRideData,
      pickupLocation,
      destinationLocation,
      selectedVehicle,
      fare,
      showRideDetailsPanel,
      showSelectVehiclePanel,
      showFindTripPanel
    };

    // Only save if there's an active ride
    if (rideId || rideCreated || confirmedRideData) {
      RideStateManager.saveRideState(currentState);
    }
  }, [
    rideId, rideCreated, confirmedRideData,
    pickupLocation, destinationLocation, selectedVehicle, fare,
    showRideDetailsPanel, showSelectVehiclePanel, showFindTripPanel
  ]);

  // Enhanced socket listener for ride confirmation
  useEffect(() => {
    if (!socket) return;

    console.log('🔌 Enhanced UserHomeScreen: Setting up socket listeners');

    const handleRideConfirmed = (data) => {
      console.log('🎉 Enhanced UserHomeScreen: Ride confirmed event received:', data);
      
      // Update confirmed ride data
      setConfirmedRideData(data);
      setRideCreated(false); // No longer in searching state
      
      // Update state manager
      RideStateManager.updateRideState({
        confirmedRideData: data,
        rideCreated: false
      });

      console.log('✅ Ride state updated with confirmed data');
    };

    // Listen for ride confirmation
    socket.on('ride-confirmed', handleRideConfirmed);

    // Cleanup
    return () => {
      console.log('🧹 Enhanced UserHomeScreen: Cleaning up socket listeners');
      socket.off('ride-confirmed', handleRideConfirmed);
    };
  }, [socket]);

  // Create ride function
  const createRide = async (paymentMethod = null) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🚀 Creating ride with data:', {
        pickup: pickupLocation,
        destination: destinationLocation,
        vehicleType: selectedVehicle,
        paymentMethod: paymentMethod || { type: 'cash', name: 'Cash Payment' }
      });

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/ride/create`,
        {
          pickup: pickupLocation,
          destination: destinationLocation,
          vehicleType: selectedVehicle,
          paymentMethod: paymentMethod || { type: 'cash', name: 'Cash Payment' },
        },
        {
          headers: {
            token: token,
          },
        }
      );

      console.log('✅ Ride creation response:', response.data);

      // Store the ride ID and update state
      const newRideId = response.data._id;
      setRideId(newRideId);
      setRideCreated(true);
      setShowRideDetailsPanel(false);

      // Save ride details to localStorage (legacy support)
      const rideData = {
        pickup: pickupLocation,
        destination: destinationLocation,
        vehicleType: selectedVehicle,
        paymentMethod: paymentMethod || { type: 'cash', name: 'Cash Payment' },
        fare: fare,
        confirmedRideData: null,
        _id: newRideId,
      };
      localStorage.setItem("rideDetails", JSON.stringify(rideData));

      // Update state manager
      RideStateManager.updateRideState({
        rideId: newRideId,
        rideCreated: true,
        showRideDetailsPanel: false
      });

      setLoading(false);
      console.log('🎯 Ride created successfully, showing progress screen');

    } catch (error) {
      console.error('❌ Ride creation failed:', error);
      setLoading(false);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.');
        // Redirect to login or refresh token
      } else {
        alert(error.response?.data?.message || 'Failed to create ride. Please try again.');
      }
    }
  };

  // Handle driver acceptance
  const handleDriverAccepted = (driverData) => {
    console.log('🎉 Driver accepted in UserHomeScreen:', driverData);
    
    // The socket listener will handle updating confirmedRideData
    // This is just for additional UI updates if needed
  };

  // Handle refresh ride status
  const handleRefreshRideStatus = async (rideId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !rideId) return;

      console.log('🔄 Refreshing ride status for ID:', rideId);

      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/ride/status/${rideId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'token': token
        }
      });

      if (response.ok) {
        const rideData = await response.json();
        console.log('📊 Ride status refresh result:', rideData);

        // Check if driver has been assigned
        if (rideData.captain && rideData.status === 'confirmed') {
          console.log('🎉 Driver found via refresh!');
          
          // Update confirmed ride data
          setConfirmedRideData(rideData);
          setRideCreated(false);
          
          // Update state manager
          RideStateManager.updateRideState({
            confirmedRideData: rideData,
            rideCreated: false
          });
        }
      }
    } catch (error) {
      console.error('❌ Refresh ride status failed:', error);
    }
  };

  // Cancel ride
  const cancelRide = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const currentRideId = rideId || confirmedRideData?._id;
      
      if (!currentRideId) {
        console.log('⚠️ No ride ID found for cancellation');
        return;
      }

      console.log('🚫 Cancelling ride:', currentRideId);

      await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/ride/cancel?rideId=${currentRideId}`,
        {
          headers: {
            token: token,
          },
        }
      );

      console.log('✅ Ride cancelled successfully');

      // Reset all state
      setRideId(null);
      setRideCreated(false);
      setConfirmedRideData(null);
      setShowRideDetailsPanel(false);
      setShowSelectVehiclePanel(false);
      setShowFindTripPanel(true);

      // Clear state manager
      RideStateManager.clearRideState();

      setLoading(false);

    } catch (error) {
      console.error('❌ Ride cancellation failed:', error);
      setLoading(false);
      alert('Failed to cancel ride. Please try again.');
    }
  };

  // Handle cancel from progress screen
  const handleCancelFromProgress = () => {
    cancelRide();
  };

  // Reset to defaults
  const setDefaults = () => {
    setPickupLocation("");
    setDestinationLocation("");
    setSelectedVehicle("car");
    setFare({ auto: 0, car: 0, bike: 0 });
    setConfirmedRideData(null);
    setRideCreated(false);
    setRideId(null);
    RideStateManager.clearRideState();
  };

  return (
    <div className="relative w-full h-screen bg-gray-50 overflow-hidden">
      {/* Your existing map and UI components */}
      
      {/* Modern Ride Confirmation Panel */}
      {!rideCreated && !confirmedRideData && showRideDetailsPanel && (
        <ModernRideConfirmation
          pickupLocation={pickupLocation}
          destinationLocation={destinationLocation}
          selectedVehicle={selectedVehicle}
          fare={fare}
          showPanel={showRideDetailsPanel}
          setShowPanel={setShowRideDetailsPanel}
          showPreviousPanel={setShowSelectVehiclePanel}
          createRide={createRide}
          loading={loading}
          onBack={() => {
            setShowRideDetailsPanel(false);
            setShowSelectVehiclePanel(true);
          }}
        />
      )}

      {/* Ride Search Progress (shows after ride created, before driver accepts) */}
      {rideCreated && !confirmedRideData && (
        <RideSearchProgress
          pickupLocation={pickupLocation}
          destinationLocation={destinationLocation}
          selectedVehicle={selectedVehicle}
          fare={fare}
          rideId={rideId}
          onCancel={handleCancelFromProgress}
          onDriverAccepted={handleDriverAccepted}
          onRefresh={handleRefreshRideStatus}
        />
      )}

      {/* Ride Details (shows after driver accepts) */}
      {confirmedRideData && (
        <RideDetails
          showPanel={true}
          setShowPanel={setConfirmedRideData}
          confirmedRideData={confirmedRideData}
          messages={[]} // Add your messages state here
          setMessages={() => {}} // Add your setMessages function here
        />
      )}

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
          <div>Ride ID: {rideId || 'None'}</div>
          <div>Created: {rideCreated ? 'Yes' : 'No'}</div>
          <div>Confirmed: {confirmedRideData ? 'Yes' : 'No'}</div>
          <div>Phase: {RideStateManager.getRidePhase()}</div>
        </div>
      )}
    </div>
  );
};

export default EnhancedUserHomeScreen;