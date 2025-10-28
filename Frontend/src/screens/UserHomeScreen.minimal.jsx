import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useUser } from "../contexts/UserContext";
import {
  LocationSuggestions,
  SelectVehicle,
  RideDetails,
  LocationPermission,
} from "../components";

import { Header } from "../components/layout";
import { Card, Input, Button } from "../components/ui";
import { MenuIcon, MapPinIcon, Navigation2Icon } from "lucide-react";
import axios from "axios";
import debounce from "lodash.debounce";
import { SocketDataContext } from "../contexts/SocketContext";
import { useNavigation } from "../hooks/useNavigation";
import { useGeolocation } from "../hooks/useGeolocation";
import Console from "../utils/console";

function UserHomeScreen() {
  const token = localStorage.getItem("token");
  const { socket } = useContext(SocketDataContext);
  const { user } = useUser();
  const { openSidebar, handleLogout } = useNavigation();
  
  const [loading, setLoading] = useState(false);
  const [selectedInput, setSelectedInput] = useState("pickup");
  const [locationSuggestion, setLocationSuggestion] = useState([]);
  const [mapLocation, setMapLocation] = useState("https://www.google.com/maps?q=6.9271,79.8612&output=embed");

  // Simple geolocation
  const {
    location,
    error: locationError,
    getCurrentPosition,
    getMapUrl,
    hasLocation
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 60000,
    autoRequest: true
  });

  // Ride details
  const [pickupLocation, setPickupLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("car");
  const [fare, setFare] = useState({ auto: 0, car: 0, bike: 0 });

  // Panels
  const [showFindTripPanel, setShowFindTripPanel] = useState(true);
  const [showSelectVehiclePanel, setShowSelectVehiclePanel] = useState(false);
  const [showRideDetailsPanel, setShowRideDetailsPanel] = useState(false);

  // Auto-fill pickup location
  useEffect(() => {
    if (location && location.latitude && location.longitude && !pickupLocation) {
      const locationString = `${location.latitude}, ${location.longitude}`;
      setPickupLocation(locationString);
      console.log('📍 Auto-filled pickup location:', locationString);
    }
  }, [location, pickupLocation]);

  // Update map when location changes
  useEffect(() => {
    if (location && location.latitude && location.longitude) {
      setMapLocation(`https://www.google.com/maps?q=${location.latitude},${location.longitude}&output=embed`);
    }
  }, [location]);

  const handleLocationChange = useCallback(
    debounce(async (inputValue, token) => {
      if (inputValue.length >= 3) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/map/get-suggestions?input=${inputValue}`,
            { headers: { token } }
          );
          setLocationSuggestion(response.data);
        } catch (error) {
          Console.error(error);
        }
      }
    }, 700),
    []
  );

  const getDistanceAndFare = async (pickupLocation, destinationLocation) => {
    try {
      setLoading(true);
      setMapLocation(`https://www.google.com/maps?q=${pickupLocation} to ${destinationLocation}&output=embed`);
      
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/ride/get-fare?pickup=${pickupLocation}&destination=${destinationLocation}`,
        { headers: { token } }
      );
      
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

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50">
      {/* Map */}
      <div className="absolute inset-0 z-0">
        <iframe
          src={mapLocation}
          className="w-full h-full border-0"
          allowFullScreen={true}
          loading="lazy"
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <Header 
          title="QuickRide"
          user={user}
          onMenuClick={openSidebar}
          showNotifications={true}
        />
      </div>

      {/* Location Status */}
      {location && location.latitude && (
        <div className="absolute top-20 left-4 right-4 z-30">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Location</span>
              <span className="text-gray-500">±{Math.round(location.accuracy || 0)}m</span>
              <span className="text-gray-400 font-mono text-xs">
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Find Trip Panel */}
      {showFindTripPanel && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <Card className="bg-white rounded-t-3xl shadow-2xl border-0 p-6">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Where to?</h2>
            
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Pickup location"
                value={pickupLocation}
                onChange={(e) => {
                  setPickupLocation(e.target.value);
                  setSelectedInput("pickup");
                  handleLocationChange(e.target.value, token);
                }}
                className="w-full"
              />
              
              <Input
                type="text"
                placeholder="Where to?"
                value={destinationLocation}
                onChange={(e) => {
                  setDestinationLocation(e.target.value);
                  setSelectedInput("destination");
                  handleLocationChange(e.target.value, token);
                }}
                className="w-full"
              />

              {locationSuggestion.length > 0 && (
                <LocationSuggestions
                  suggestions={locationSuggestion}
                  setSuggestions={setLocationSuggestion}
                  setPickupLocation={setPickupLocation}
                  setDestinationLocation={setDestinationLocation}
                  input={selectedInput}
                />
              )}

              <Button
                variant="solid"
                color="primary"
                size="lg"
                className="w-full"
                onClick={() => getDistanceAndFare(pickupLocation, destinationLocation)}
                loading={loading}
                disabled={!pickupLocation || !destinationLocation}
              >
                Find Ride
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Select Vehicle Panel */}
      <SelectVehicle
        selectedVehicle={setSelectedVehicle}
        showPanel={showSelectVehiclePanel}
        setShowPanel={setShowSelectVehiclePanel}
        showPreviousPanel={setShowFindTripPanel}
        showNextPanel={setShowRideDetailsPanel}
        fare={fare}
      />
    </div>
  );
}

export default UserHomeScreen;