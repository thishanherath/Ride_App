import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useUser } from "../contexts/UserContext";
import map from "/map.png";
import {
  LocationSuggestions,
  SelectVehicle,
  RideDetails,
  LocationPermission,
} from "../components";
import ModernRideConfirmation from "../components/ModernRideConfirmation";
import RideStatusNotification from "../components/RideStatusNotification";
import RideProcessFlow from "../components/RideProcessFlow";

import SimpleMap from "../components/SimpleMap";
import LocationDisplay from "../components/LocationDisplay";

import { Header, Avatar, Sidebar } from "../components/layout";
import { Card, Input, Button } from "../components/ui";
import { MenuIcon, MapPinIcon, Navigation2Icon, Map, RefreshCw } from "lucide-react";
import axios from "axios";
import debounce from "lodash.debounce";
import { SocketDataContext } from "../contexts/SocketContext";
import { useNavigation } from "../hooks/useNavigation";
import { useGeolocation } from "../hooks/useGeolocation";
import Console from "../utils/console";

function UserHomeScreen() {
  const token = localStorage.getItem("token"); // this token is in use
  const { socket } = useContext(SocketDataContext);
  const { user } = useUser();
  const {
    sidebarOpen,
    currentPath,
    openSidebar,
    closeSidebar,
    navigateTo,
    handleLogout
  } = useNavigation();
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("messages")) || []
  );
  const [loading, setLoading] = useState(false);
  const [selectedInput, setSelectedInput] = useState("pickup");
  const [locationSuggestion, setLocationSuggestion] = useState([]);
  const [mapLocation, setMapLocation] = useState("");
  const [rideCreated, setRideCreated] = useState(false);

  // Enhanced geolocation with real-time tracking
  const {
    location,
    error: locationError,
    loading: locationLoading,
    permissionStatus,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    getMapUrl,
    hasLocation,
    isLocationStale,
    isWatching
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000, // 15 seconds
    maximumAge: 60000, // 1 minute for real-time updates
    autoRequest: true
  });

  const [watchId, setWatchId] = useState(null);
  const [showLocationPermission, setShowLocationPermission] = useState(false);

  // Ride details
  const [pickupLocation, setPickupLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("car");
  const [fare, setFare] = useState({
    auto: 0,
    car: 0,
    bike: 0,
  });
  const [confirmedRideData, setConfirmedRideData] = useState(null);
  const [rideStatus, setRideStatus] = useState('idle'); // 'idle', 'searching', 'accepted', 'ongoing', 'completed', 'cancelled'
  const [driverInfo, setDriverInfo] = useState(null);
  const [showRideProcess, setShowRideProcess] = useState(false);


  const rideTimeout = useRef(null);

  // Auto-fill pickup location when user location is available
  useEffect(() => {
    const fillPickupLocation = async () => {
      if (location && location.latitude && location.longitude && !pickupLocation) {
        try {
          // Try to get readable address first
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'RideApp/1.0'
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            let address = '';

            if (data && data.address) {
              // Build a readable address
              const components = [];

              if (data.address.house_number && data.address.road) {
                components.push(`${data.address.house_number} ${data.address.road}`);
              } else if (data.address.road) {
                components.push(data.address.road);
              }

              if (data.address.neighbourhood) {
                components.push(data.address.neighbourhood);
              } else if (data.address.suburb) {
                components.push(data.address.suburb);
              }

              if (data.address.city) {
                components.push(data.address.city);
              } else if (data.address.town) {
                components.push(data.address.town);
              }

              address = components.length > 0 ? components.join(', ') : data.display_name?.split(',').slice(0, 3).join(', ');
            }

            if (address) {
              setPickupLocation(address);
              console.log('📍 Auto-filled pickup location:', address);
            } else {
              // Fallback to coordinates
              const locationString = `${location.latitude}, ${location.longitude}`;
              setPickupLocation(locationString);
              console.log('📍 Auto-filled pickup location (coordinates):', locationString);
            }
          } else {
            // Fallback to coordinates if geocoding fails
            const locationString = `${location.latitude}, ${location.longitude}`;
            setPickupLocation(locationString);
            console.log('📍 Auto-filled pickup location (fallback):', locationString);
          }
        } catch (error) {
          console.warn('Failed to get address, using coordinates:', error);
          const locationString = `${location.latitude}, ${location.longitude}`;
          setPickupLocation(locationString);
          console.log('📍 Auto-filled pickup location (error fallback):', locationString);
        }
      }
    };

    fillPickupLocation();
  }, [location, pickupLocation]);

  // Captain location for tracking
  const [captainLocation, setCaptainLocation] = useState(null);

  // Panels
  const [showFindTripPanel, setShowFindTripPanel] = useState(true);
  const [showSelectVehiclePanel, setShowSelectVehiclePanel] = useState(false);
  const [showRideDetailsPanel, setShowRideDetailsPanel] = useState(false);

  const handleLocationChange = useCallback(
    debounce(async (inputValue, token) => {
      if (inputValue.length >= 3) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL
            }/map/get-suggestions?input=${inputValue}`,
            {
              headers: {
                token: token,
              },
            }
          );
          Console.log(response.data);
          setLocationSuggestion(response.data);
        } catch (error) {
          Console.error(error);
        }
      }
    }, 700),
    []
  );

  const onChangeHandler = (e) => {
    setSelectedInput(e.target.id);
    const value = e.target.value;
    if (e.target.id == "pickup") {
      setPickupLocation(value);
    } else if (e.target.id == "destination") {
      setDestinationLocation(value);
    }

    // Enable location suggestions in both development and production
    handleLocationChange(value, token);

    if (e.target.value.length < 3) {
      setLocationSuggestion([]);
    }
  };

  const getDistanceAndFare = async (pickupLocation, destinationLocation) => {
    Console.log(pickupLocation, destinationLocation);
    try {
      setLoading(true);
      setMapLocation(
        `https://www.google.com/maps?q=${pickupLocation} to ${destinationLocation}&output=embed`
      );
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL
        }/ride/get-fare?pickup=${pickupLocation}&destination=${destinationLocation}`,
        {
          headers: {
            token: token,
          },
        }
      );
      Console.log(response);
      setFare(response.data.fare);

      setShowFindTripPanel(false);
      setShowSelectVehiclePanel(true);
      setLocationSuggestion([]);
      setLoading(false);
    } catch (error) {
      Console.log(error);
      setLoading(false);
    }
  };

  const createRide = async (paymentMethod = null) => {
    try {
      setLoading(true);

      // Enhanced validation
      if (!pickupLocation || !destinationLocation) {
        alert('Please select both pickup and destination locations');
        setLoading(false);
        return;
      }

      if (!selectedVehicle) {
        alert('Please select a vehicle type');
        setLoading(false);
        return;
      }

      if (!fare || !fare[selectedVehicle] || fare[selectedVehicle] <= 0) {
        alert('Fare information is not available. Please try again.');
        setLoading(false);
        return;
      }

      if (!token) {
        alert('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      console.log('🚀 Creating ride with data:', {
        pickup: pickupLocation,
        destination: destinationLocation,
        vehicleType: selectedVehicle,
        paymentMethod: paymentMethod || { type: 'cash', name: 'Cash Payment' },
        fare: fare[selectedVehicle]
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

      // Set ride status to searching (maps to backend 'pending')
      setRideStatus('searching');

      // Show the full ride process flow
      setShowRideProcess(true);

      // Show success message with timestamp for verification
      const timestamp = new Date().toLocaleTimeString();
      console.log(`🎉 REAL-TIME TEST: Ride created at ${timestamp} - Looking for drivers...`);
      console.log(`📊 Current state: rideStatus=${rideStatus}, showRideProcess=${showRideProcess}`);

      // Store ride creation timestamp for debugging
      localStorage.setItem("rideCreatedAt", timestamp);

      // Add visual indicator that this is real-time
      alert(`✅ REAL-TIME: Ride booked at ${timestamp}\nCheck backend console for driver notifications!`);

      // Automatically cancel the ride after 5 minutes (300000ms) if no driver accepts
      const timeoutDuration = import.meta.env.VITE_RIDE_TIMEOUT || 300000; // 5 minutes fallback
      rideTimeout.current = setTimeout(() => {
        console.log('🕐 Ride timeout reached, cancelling ride automatically');
        cancelRide();
      }, timeoutDuration);

    } catch (error) {
      console.error('❌ Ride creation failed:', error);
      setLoading(false);

      // Enhanced error handling
      let errorMessage = 'Failed to create ride. Please try again.';

      if (error.response) {
        // Server responded with error status
        console.error('Server error response:', error.response.data);
        errorMessage = error.response.data.message || error.response.data.error || errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        console.error('Network error:', error.request);
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        // Something else happened
        console.error('Error details:', error.message);
        errorMessage = error.message || errorMessage;
      }

      alert(errorMessage);
    }
  };

  const cancelRide = async () => {
    const rideDetails = JSON.parse(localStorage.getItem("rideDetails"));
    try {
      setLoading(true);
      await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/ride/cancel?rideId=${rideDetails._id || rideDetails.confirmedRideData._id
        }`,
        {
          pickup: pickupLocation,
          destination: destinationLocation,
          vehicleType: selectedVehicle,
        },
        {
          headers: {
            token: token,
          },
        }
      );
      setLoading(false);
      updateLocation();
      setShowRideDetailsPanel(false);
      setShowSelectVehiclePanel(false);
      setShowFindTripPanel(true);
      setShowRideProcess(false);
      setDefaults();
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("panelDetails");
      localStorage.removeItem("messages");
      localStorage.removeItem("showPanel");
      localStorage.removeItem("showBtn");
    } catch (error) {
      Console.log(error);
      setLoading(false);
    }
  };
  // Set ride details to default values
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
    setRideStatus('idle');
    setDriverInfo(null);
  };

  // Enhanced location management
  const updateLocation = useCallback(() => {
    console.log('🔍 Requesting current location update...');
    getCurrentPosition();
  }, [getCurrentPosition]);

  // Start real-time location tracking
  const startLocationTracking = useCallback(() => {
    console.log('🎯 Starting real-time location tracking...');
    const id = watchPosition();
    setWatchId(id);
    return id;
  }, [watchPosition]);

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (watchId) {
      console.log('⏹️ Stopping location tracking...');
      clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId, clearWatch]);

  // Handle location permission issues
  const handleLocationRetry = useCallback(() => {
    setShowLocationPermission(false);
    updateLocation();
  }, [updateLocation]);

  const handleUseDefaultLocation = useCallback(() => {
    console.log('🔄 Using default location (Colombo, Sri Lanka)');
    setMapLocation('https://www.google.com/maps?q=6.9271,79.8612&output=embed');
    setShowLocationPermission(false);
  }, []);

  // Handle location updates
  useEffect(() => {
    if (hasLocation) {
      console.log('✅ Location updated:', {
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy,
        isFallback: location.isFallback
      });

      const mapUrl = getMapUrl();
      setMapLocation(mapUrl);
      setShowLocationPermission(false);
    }
  }, [location, hasLocation, getMapUrl]);

  // Handle location errors and permissions
  useEffect(() => {
    if (locationError) {
      console.error('❌ Location error:', locationError);

      // Show permission dialog for certain errors
      if (locationError.code === 'PERMISSION_DENIED' ||
        locationError.code === 'NOT_SUPPORTED' ||
        permissionStatus === 'denied') {
        setShowLocationPermission(true);
      }
    }
  }, [locationError, permissionStatus]);

  // Start real-time tracking when component mounts
  useEffect(() => {
    console.log('🚀 Initializing location services...');

    // Start watching location for real-time updates
    const trackingId = startLocationTracking();

    // Cleanup on unmount
    return () => {
      if (trackingId) {
        clearWatch(trackingId);
      }
    };
  }, [startLocationTracking, clearWatch]);

  // Handle permission status changes
  useEffect(() => {
    console.log('🔐 Permission status:', permissionStatus);

    if (permissionStatus === 'denied') {
      setShowLocationPermission(true);
    } else if (permissionStatus === 'granted' && !hasLocation) {
      // Permission granted but no location yet, try to get it
      updateLocation();
    }
  }, [permissionStatus, hasLocation, updateLocation]);

  // Socket Events
  useEffect(() => {
    if (user._id) {
      socket.emit("join", {
        userId: user._id,
        userType: "user",
      });

      // Add heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        if (socket.connected) {
          socket.emit("ping");
        } else {
          console.warn('⚠️ Socket disconnected, attempting to reconnect...');
          socket.connect();
        }
      }, 30000); // Every 30 seconds

      // Cleanup function
      return () => {
        clearInterval(heartbeat);
      };
    }

    // Cleanup function to remove event listeners
    return () => {
      socket.off("ride-confirmed");
      socket.off("ride-cancelled-by-captain");
      socket.off("captain-location-update");
      socket.off("ride-started");
      socket.off("ride-ended");
      socket.off("ride-status-changed");
      socket.off("join-success");
      socket.off("join-error");
    };

    socket.on("ride-confirmed", (data) => {
      Console.log("Clearing Timeout", rideTimeout);
      clearTimeout(rideTimeout.current);
      Console.log("Cleared Timeout");
      Console.log("Ride Confirmed");
      Console.log(data.captain.location);

      // Validate we're in the correct state
      if (rideStatus !== 'searching') {
        console.warn('⚠️ Received ride-confirmed but not in searching state:', rideStatus);
        return;
      }

      // Validate required data
      if (!data.captain || !data.captain._id) {
        console.error('❌ Invalid ride-confirmed data:', data);
        return;
      }

      // Update ride status to accepted
      setRideStatus('accepted');

      // Keep showing the ride process flow
      setShowRideProcess(true);

      // Set driver information with enhanced details
      setDriverInfo({
        _id: data.captain._id,
        fullname: data.captain.fullname,
        phone: data.captain.phone,
        vehicle: {
          type: data.captain.vehicle?.type || data.vehicle || 'car',
          plate: data.captain.vehicle?.plate || 'N/A',
          color: data.captain.vehicle?.color || 'Unknown',
          model: data.captain.vehicle?.model || 'Unknown'
        },
        rating: data.captain.rating?.average || 4.5,
        location: data.captain.location,
        distanceToPickup: data.distanceToPickup || 5,
      });

      // Update captain location for real-time tracking
      if (data.captain.location && data.captain.location.coordinates) {
        setCaptainLocation({
          latitude: data.captain.location.coordinates[1],
          longitude: data.captain.location.coordinates[0]
        });
      }

      setMapLocation(
        `https://www.google.com/maps?q=${data.captain.location.coordinates[1]},${data.captain.location.coordinates[0]} to ${pickupLocation}&output=embed`
      );
      setConfirmedRideData(data);

      // Update ride status to accepted
      setRideStatus('accepted');

      // Show success notification
      console.log("🎉 Ride confirmed! Captain is on the way.");
    });

    socket.on("ride-cancelled-by-captain", (data) => {
      Console.log("Ride cancelled by captain", data);

      // Update ride status to cancelled
      setRideStatus('cancelled');

      // Show cancellation for 3 seconds then hide process flow
      setTimeout(() => {
        setShowRideProcess(false);
      }, 3000);

      // Reset after showing cancellation status
      setTimeout(() => {
        setRideStatus('idle');
        setDriverInfo(null);
        setConfirmedRideData(null);
        setShowRideDetailsPanel(false);
        setShowSelectVehiclePanel(false);
        setShowFindTripPanel(true);
        setDefaults();

        // Clear stored data
        localStorage.removeItem("rideDetails");
        localStorage.removeItem("panelDetails");

        // Refresh location
        updateLocation();
      }, 3000);

      // Show notification
      console.log("❌ Ride cancelled by captain:", data.reason);
    });

    socket.on("captain-location-update", (data) => {
      Console.log("Captain location update", data);

      // Update captain location for real-time tracking
      if (data.captainLocation) {
        setCaptainLocation({
          latitude: data.captainLocation.latitude,
          longitude: data.captainLocation.longitude
        });

        // Update map to show captain's current location and route to pickup
        if (rideStatus === 'accepted') {
          setMapLocation(
            `https://www.google.com/maps?q=${data.captainLocation.latitude},${data.captainLocation.longitude} to ${pickupLocation}&output=embed`
          );
        }
      }
    });

    socket.on("ride-started", (data) => {
      Console.log("Ride started");

      // Update ride status to ongoing
      setRideStatus('ongoing');

      // Keep showing the ride process flow
      setShowRideProcess(true);

      setMapLocation(
        `https://www.google.com/maps?q=${data.pickup} to ${data.destination}&output=embed`
      );

      // Show notification
      console.log("🚀 Ride started! You're on your way.");
    });

    socket.on("ride-ended", (data) => {
      Console.log("Ride Ended");

      // Update ride status to completed
      setRideStatus('completed');

      // Show completion for 3 seconds then hide process flow
      setTimeout(() => {
        setShowRideProcess(false);
      }, 3000);

      // Reset UI after a delay to show completion status
      setTimeout(() => {
        setRideStatus('idle');
        setDriverInfo(null);
        setConfirmedRideData(null);
        setShowRideDetailsPanel(false);
        setShowSelectVehiclePanel(false);
        setShowFindTripPanel(true);
        setDefaults();

        // Clear stored data
        localStorage.removeItem("rideDetails");
        localStorage.removeItem("panelDetails");

        // Refresh location after ride ends
        updateLocation();
      }, 3000);

      console.log("✅ Ride completed successfully!");
    });
  }, [user]);

  // Get ride details
  useEffect(() => {
    const storedRideDetails = localStorage.getItem("rideDetails");
    const storedPanelDetails = localStorage.getItem("panelDetails");

    if (storedRideDetails) {
      const ride = JSON.parse(storedRideDetails);
      setPickupLocation(ride.pickup);
      setDestinationLocation(ride.destination);
      setSelectedVehicle(ride.vehicleType);
      setFare(ride.fare);
      setConfirmedRideData(ride.confirmedRideData);
    }

    if (storedPanelDetails) {
      const panels = JSON.parse(storedPanelDetails);
      setShowFindTripPanel(panels.showFindTripPanel);
      setShowSelectVehiclePanel(panels.showSelectVehiclePanel);
      setShowRideDetailsPanel(panels.showRideDetailsPanel);
    }
  }, []);

  // Store Ride Details
  useEffect(() => {
    const rideData = {
      pickup: pickupLocation,
      destination: destinationLocation,
      vehicleType: selectedVehicle,
      fare: fare,
      confirmedRideData: confirmedRideData,
    };
    localStorage.setItem("rideDetails", JSON.stringify(rideData));
  }, [
    pickupLocation,
    destinationLocation,
    selectedVehicle,
    fare,
    confirmedRideData,
  ]);

  // Store panel information
  useEffect(() => {
    const panelDetails = {
      showFindTripPanel,
      showSelectVehiclePanel,
      showRideDetailsPanel,
    };
    localStorage.setItem("panelDetails", JSON.stringify(panelDetails));
  }, [showFindTripPanel, showSelectVehiclePanel, showRideDetailsPanel]);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    socket.emit("join-room", confirmedRideData?._id);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, { msg, by: "other" }]);
    });

    // Socket connection verification
    socket.on("join-success", (data) => {
      console.log("✅ Socket connected successfully:", data);

      // Check if we have an active ride that needs state recovery
      const storedRideDetails = localStorage.getItem("rideDetails");
      if (storedRideDetails && rideStatus !== 'idle') {
        console.log('🔄 Recovering ride state after reconnection');
        // Request current ride status from server
        socket.emit("get-ride-status", { userId: user._id });
      }
    });

    socket.on("join-error", (data) => {
      console.error("❌ Socket connection failed:", data);
    });

    // Enhanced socket event listeners for ride status updates
    socket.on("ride-status-changed", (data) => {
      console.log("Ride status changed:", data);

      // Map backend status to frontend status
      const statusMapping = {
        'pending': 'searching',
        'accepted': 'accepted',
        'ongoing': 'ongoing',
        'completed': 'completed',
        'cancelled': 'cancelled'
      };

      const frontendStatus = statusMapping[data.status] || data.status;
      setRideStatus(frontendStatus);

      // Update driver info if provided
      if (data.driverInfo) {
        setDriverInfo(data.driverInfo);
      }
    });

    // Connection health check response
    socket.on("health-check", (data) => {
      console.log("Health check received:", data);
      socket.emit("health-check-response", {
        status: "ok",
        timestamp: new Date(),
        rideStatus: rideStatus
      });
    });

    // Connection status events
    socket.on("join-success", (data) => {
      console.log("Socket connection successful:", data);
    });

    socket.on("join-error", (data) => {
      console.error("Socket connection error:", data);
      // Handle reconnection if needed
      if (data.reconnection && data.reconnection.shouldRetry) {
        setTimeout(() => {
          socket.emit("join", { userId: user._id, userType: "user" });
        }, data.reconnection.retryDelay);
      }
    });

    socket.on("connection-timeout-warning", (data) => {
      console.warn("Connection timeout warning:", data);
      // Show user-friendly message about connection issues
    });

    socket.on("connection-error", (data) => {
      console.error("Connection error:", data);
      // Handle connection errors gracefully
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [confirmedRideData]);

  return (
    <div className="relative w-full h-screen bg-gray-50 overflow-hidden">
      {/* Modern Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        user={user}
        userType="user"
        onNavigate={navigateTo}
        currentPath={currentPath}
        onLogout={handleLogout}
      />

      {/* Header with Navigation */}
      <Header
        title="QuickRide"
        showMenu={true}
        showNotifications={true}
        user={user}
        onMenuClick={openSidebar}
        onNotificationClick={() => navigateTo('/user/notifications')}
        onProfileClick={() => navigateTo('/user/edit-profile')}
      />

      {/* Free OpenStreetMap with Route Visualization */}
      <div className="absolute inset-0 z-0">
        <SimpleMap
          pickup={pickupLocation}
          destination={destinationLocation}
          userLocation={location}
          captainLocation={captainLocation}
          showRoute={pickupLocation && destinationLocation && (showSelectVehiclePanel || showRideDetailsPanel)}
          trackingMode={confirmedRideData ? 'captain' : 'user'}
          onLocationUpdate={(newLocation) => {
            console.log('📍 Real-time location update:', newLocation);
          }}
          className="w-full h-full"
        />
      </div>

      {/* Modern Floating Header */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <Header
          title="QuickRide"
          user={user}
          onMenuClick={openSidebar}
          showNotifications={true}
        />
      </div>

      {/* Real-Time Location Status - Show when location is available */}
      {location && location.latitude && (
        <div className="absolute top-20 left-4 right-4 z-30">
          <LocationDisplay
            location={location}
            showCoordinates={false}
            showAccuracy={true}
            className="shadow-lg"
          />

          {/* Compact Live Status Indicator */}
          <div className="mt-2 flex justify-center">
            <div className={`relative overflow-hidden bg-gradient-to-r ${isWatching
              ? 'from-green-50 to-emerald-50 border-green-200'
              : 'from-gray-50 to-slate-50 border-gray-200'
              } backdrop-blur-sm rounded-full px-3 py-1 shadow-md border`}>
              {/* Animated background glow */}
              {isWatching && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 animate-pulse" />
              )}

              <div className="relative flex items-center gap-2 text-xs">
                <div className="relative">
                  <div className={`w-2 h-2 rounded-full ${isWatching ? 'bg-green-500' : 'bg-gray-400'
                    } shadow-sm`} />
                  {isWatching && (
                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping opacity-30" />
                  )}
                </div>

                <span className={`font-medium text-xs ${isWatching ? 'text-green-700' : 'text-gray-600'
                  }`}>
                  {isWatching ? 'Live' : 'Offline'}
                </span>

                {isWatching && (
                  <div className="flex items-center gap-0.5 text-green-600">
                    <div className="w-0.5 h-0.5 bg-green-500 rounded-full animate-bounce" />
                    <div className="w-0.5 h-0.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-0.5 h-0.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Ride Booking Panel with Enhanced Animations */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 transform transition-all duration-700 ease-out ${showFindTripPanel ? 'animate-slide-up-panel' : 'animate-slide-down-panel'
        }`}>
        {showFindTripPanel && (
          <Card className="bg-white rounded-t-3xl shadow-2xl border-0 p-6">
            {/* Panel Handle with Micro-interaction */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6 hover:bg-gray-400 transition-colors duration-200 cursor-pointer" />

            <h2 className="text-xl font-semibold text-gray-900 mb-6 animate-fade-in">Where to?</h2>

            {/* Modern Location Inputs with Enhanced Animations */}
            <div className="space-y-3 mb-6">
              <div className="relative animate-slide-in-up">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm animate-pulse" />
                </div>
                <Input
                  id="pickup"
                  placeholder="Pickup location"
                  value={pickupLocation}
                  onChange={onChangeHandler}
                  className="pl-10 py-4 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-300 hover:scale-[1.02] focus:scale-[1.02]"
                  autoComplete="off"
                  animate={true}
                />
              </div>

              <div className="relative animate-slide-in-up animate-delay-100">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm animate-pulse" />
                </div>
                <Input
                  id="destination"
                  placeholder="Where to?"
                  value={destinationLocation}
                  onChange={onChangeHandler}
                  className="pl-10 py-4 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-300 hover:scale-[1.02] focus:scale-[1.02]"
                  autoComplete="off"
                  animate={true}
                />
              </div>
            </div>

            {/* Map Button */}
            <div className="mb-4">
              <Button
                variant="outline"
                size="lg"
                className="w-full micro-lift"
                onClick={() => navigateTo('/map')}
                icon={<Map className="w-5 h-5" />}
                animate={true}
              >
                Open Full Map
              </Button>
            </div>

            {/* Search Button with Enhanced Animation */}
            {pickupLocation.length > 2 && destinationLocation.length > 2 && (
              <div className="animate-bounce-in">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full micro-lift"
                  onClick={() => getDistanceAndFare(pickupLocation, destinationLocation)}
                  loading={loading}
                  icon={<Navigation2Icon className="w-5 h-5" />}
                  animate={true}
                >
                  {loading ? "Finding rides..." : "Find Ride"}
                </Button>
              </div>
            )}

            {/* Location Suggestions with Staggered Animation */}
            {locationSuggestion.length > 0 && (
              <div className="mt-4 max-h-64 overflow-y-auto animate-slide-in-up animate-delay-200">
                <LocationSuggestions
                  suggestions={locationSuggestion}
                  setSuggestions={setLocationSuggestion}
                  setPickupLocation={setPickupLocation}
                  setDestinationLocation={setDestinationLocation}
                  input={selectedInput}
                />
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Select Vehicle Panel */}
      <SelectVehicle
        selectedVehicle={setSelectedVehicle}
        showPanel={showSelectVehiclePanel}
        setShowPanel={setShowSelectVehiclePanel}
        showPreviousPanel={setShowFindTripPanel}
        showNextPanel={setShowRideDetailsPanel}
        fare={fare}
      />

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
      ) : rideStatus !== 'searching' && (rideCreated || confirmedRideData) ? (
        /* Original Ride Details Panel for active rides - but NOT during searching */
        <RideDetails
          pickupLocation={pickupLocation}
          destinationLocation={destinationLocation}
          selectedVehicle={selectedVehicle}
          fare={fare}
          showPanel={showRideDetailsPanel}
          setShowPanel={setShowRideDetailsPanel}
          showPreviousPanel={setShowSelectVehiclePanel}
          createRide={createRide}
          cancelRide={cancelRide}
          loading={loading}
          rideCreated={rideCreated}
          confirmedRideData={confirmedRideData}
        />
      ) : null}

      {/* Ride Status Notification - Shows when ride is in progress but NOT when full process flow is shown */}
      {!showRideProcess && (rideStatus === 'searching' || rideStatus === 'accepted' || rideStatus === 'ongoing' || rideStatus === 'completed' || rideStatus === 'cancelled') && (
        <div className="absolute top-20 left-4 right-4 z-40">
          <RideStatusNotification
            rideStatus={rideStatus}
            captainInfo={driverInfo}
            rideDetails={{
              pickup: pickupLocation,
              destination: destinationLocation,
              fare: fare[selectedVehicle],
              vehicle: selectedVehicle
            }}
            onCall={(phone) => {
              window.location.href = `tel:${phone}`;
            }}
            onMessage={(driverId) => {
              if (confirmedRideData?._id) {
                navigateTo(`/user/chat/${confirmedRideData._id}`);
              }
            }}
            onCancel={() => {
              if (rideStatus === 'searching') {
                cancelRide();
              }
            }}
          />
        </div>
      )}

      {/* Full Screen Ride Process Flow */}
      {showRideProcess && (
        <RideProcessFlow
          rideStatus={rideStatus}
          rideDetails={{
            pickup: pickupLocation,
            destination: destinationLocation,
            fare: fare[selectedVehicle],
            vehicle: selectedVehicle
          }}
          driverInfo={driverInfo}
          onCall={(phone) => {
            window.location.href = `tel:${phone}`;
          }}
          onMessage={(driverId) => {
            if (confirmedRideData?._id) {
              navigateTo(`/user/chat/${confirmedRideData._id}`);
            }
          }}
          onCancel={() => {
            if (rideStatus === 'searching') {
              cancelRide();
            }
          }}
        />
      )}

      {/* Location Permission Modal */}
      {showLocationPermission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <LocationPermission
              permissionStatus={permissionStatus}
              error={locationError}
              onRetry={handleLocationRetry}
              onUseDefault={handleUseDefaultLocation}
              loading={locationLoading}
            />
          </div>
        </div>
      )}


    </div>
  );
}

export default UserHomeScreen;
