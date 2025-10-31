/**
 * UserHomeScreen with Progress Slider Integration
 * This shows exactly where to add the RideSearchProgress component
 */

// Add this import at the top with your other imports
import RideSearchProgress from '../components/RideSearchProgress';

// In your UserHomeScreen component, add this state if not already present
const [rideId, setRideId] = useState(null);

// In your createRide function, after successful ride creation, add:
const createRide = async (paymentMethod = null) => {
  try {
    setLoading(true);
    
    // ... your existing validation code ...
    
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
    
    // ADD THIS LINE - Store the ride ID for progress tracking
    setRideId(response.data._id);
    
    const rideData = {
      pickup: pickupLocation,
      destination: destinationLocation,
      vehicleType: selectedVehicle,
      paymentMethod: paymentMethod || { type: 'cash', name: 'Cash Payment' },
      fare: fare,
      confirmedRideData: confirmedRideData,
      _id: response.data._id,
    };
    localStorage.setItem("rideDetails", JSON.stringify(rideData));
    setLoading(false);
    setRideCreated(true);

    // ... rest of your existing code ...
    
  } catch (error) {
    // ... your existing error handling ...
  }
};

// Add this handler for when driver accepts
const handleDriverAccepted = (driverData) => {
  console.log('🎉 Driver accepted:', driverData);
  // The existing socket handler will update confirmedRideData
  // You can add additional logic here if needed
};

// Add this handler for canceling from progress screen
const handleCancelFromProgress = () => {
  cancelRide();
  setRideCreated(false);
  setRideId(null);
};

// In your JSX, add the RideSearchProgress component right after your ModernRideConfirmation:

return (
  <div className="relative w-full h-screen bg-gray-50 overflow-hidden">
    {/* ... all your existing JSX ... */}

    {/* Modern Ride Confirmation Panel */}
    {!rideCreated && !confirmedRideData ? (
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
    ) : null}

    {/* ADD THIS - Ride Search Progress (shows after ride created, before driver accepts) */}
    {rideCreated && !confirmedRideData && (
      <RideSearchProgress
        pickupLocation={pickupLocation}
        destinationLocation={destinationLocation}
        selectedVehicle={selectedVehicle}
        fare={fare}
        rideId={rideId}
        onCancel={handleCancelFromProgress}
        onDriverAccepted={handleDriverAccepted}
      />
    )}

    {/* Your existing RideDetails component for after driver accepts */}
    <RideDetails
      showPanel={confirmedRideData}
      setShowPanel={setConfirmedRideData}
      confirmedRideData={confirmedRideData}
      messages={messages}
      setMessages={setMessages}
    />

    {/* ... rest of your existing JSX ... */}
  </div>
);

// Also update your cancelRide function to reset the rideId:
const cancelRide = async () => {
  const rideDetails = JSON.parse(localStorage.getItem("rideDetails"));
  try {
    setLoading(true);
    await axios.get(
      `${import.meta.env.VITE_SERVER_URL}/ride/cancel?rideId=${rideDetails._id || rideDetails.confirmedRideData._id}`,
      // ... your existing cancel logic ...
    );
    
    // ADD THIS LINE
    setRideId(null);
    
    setLoading(false);
    updateLocation();
    setShowRideDetailsPanel(false);
    setShowSelectVehiclePanel(false);
    setShowFindTripPanel(true);
    setDefaults();
    // ... rest of your existing cleanup ...
  } catch (error) {
    // ... your existing error handling ...
  }
};

// Update your setDefaults function to include rideId:
const setDefaults = () => {
  setPickupLocation("");
  setDestinationLocation("");
  setSelectedVehicle("car");
  setFare({
    auto: 0,
    car: 0,
    bike: 0,
  });
  setConfirmedRideData(null);
  setRideCreated(false);
  setRideId(null); // ADD THIS LINE
};