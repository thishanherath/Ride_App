import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useUser } from "../contexts/UserContext";
import map from "/map.png";
import {
  LocationSuggestions,
  SelectVehicle,
  RideDetails,
} from "../components";
import { Header, Avatar, Sidebar } from "../components/layout";
import { Card, Input, Button } from "../components/ui";
import { MenuIcon, MapPinIcon, Navigation2Icon, Map } from "lucide-react";
import axios from "axios";
import debounce from "lodash.debounce";
import { SocketDataContext } from "../contexts/SocketContext";
import { useNavigation } from "../hooks/useNavigation";
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
  const rideTimeout = useRef(null);

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

  const createRide = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/ride/create`,
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
      Console.log(response);
      const rideData = {
        pickup: pickupLocation,
        destination: destinationLocation,
        vehicleType: selectedVehicle,
        fare: fare,
        confirmedRideData: confirmedRideData,
        _id: response.data._id,
      };
      localStorage.setItem("rideDetails", JSON.stringify(rideData));
      setLoading(false);
      setRideCreated(true);

      // Automatically cancel the ride after 1.5 minutes
      rideTimeout.current = setTimeout(() => {
        cancelRide();
      }, import.meta.env.VITE_RIDE_TIMEOUT);
      
    } catch (error) {
      Console.log(error);
      setLoading(false);
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
  };

  // Update Location
  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapLocation(
            `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}&output=embed`
          );
        },
        (error) => {
          console.error("Error fetching position:", error);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error("User denied the request for Geolocation.");
              break;
            case error.POSITION_UNAVAILABLE:
              console.error("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              console.error("The request to get user location timed out.");
              break;
            default:
              console.error("An unknown error occurred.");
          }
        }
      );
    }
  };

  // Update Location
  useEffect(() => {
    updateLocation();
  }, []);

  // Socket Events
  useEffect(() => {
    if (user._id) {
      socket.emit("join", {
        userId: user._id,
        userType: "user",
      });
    }

    socket.on("ride-confirmed", (data) => {
      Console.log("Clearing Timeout", rideTimeout);
      clearTimeout(rideTimeout.current);
      Console.log("Cleared Timeout");
      Console.log("Ride Confirmed");
      Console.log(data.captain.location);
      setMapLocation(
        `https://www.google.com/maps?q=${data.captain.location.coordinates[1]},${data.captain.location.coordinates[0]} to ${pickupLocation}&output=embed`
      );
      setConfirmedRideData(data);
    });

    socket.on("ride-started", (data) => {
      Console.log("Ride started");
      setMapLocation(
        `https://www.google.com/maps?q=${data.pickup} to ${data.destination}&output=embed`
      );
    });

    socket.on("ride-ended", (data) => {
      Console.log("Ride Ended");
      setShowRideDetailsPanel(false);
      setShowSelectVehiclePanel(false);
      setShowFindTripPanel(true);
      setDefaults();
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("panelDetails");

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setMapLocation(
              `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}&output=embed`
            );
          },
          (error) => {
            console.error("Error fetching position:", error);
          }
        );
      }
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
      
      {/* Full-screen Map */}
      <div className="absolute inset-0 z-0">
        <iframe
          src={mapLocation}
          className="w-full h-full border-0"
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
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

      {/* Modern Ride Booking Panel with Enhanced Animations */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 transform transition-all duration-700 ease-out ${
        showFindTripPanel ? 'animate-slide-up-panel' : 'animate-slide-down-panel'
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

      {/* Ride Details Panel */}
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
    </div>
  );
}

export default UserHomeScreen;
