import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, Route, X, Search, Car } from "lucide-react";
import { Button, Input } from "./ui";
import axios from "axios";
import Console from "../utils/console";

function MapView({ isOpen, onClose, onLocationSelect, initialLocation = null }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState({ lat: 6.9271, lng: 79.8612 }); // Colombo, Sri Lanka

  // Initialize Google Maps
  useEffect(() => {
    if (isOpen && window.google) {
      initializeMap();
    } else if (isOpen && !window.google) {
      loadGoogleMapsScript();
    }
  }, [isOpen]);

  const loadGoogleMapsScript = () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeMap();
    };
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (mapRef.current && window.google) {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 13,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(mapInstance);

      // Add click listener to map
      mapInstance.addListener('click', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        handleLocationClick(lat, lng);
      });

      // Add initial marker if location provided
      if (initialLocation) {
        addMarker(initialLocation.lat, initialLocation.lng, "Selected Location", true);
      }
    }
  };

  const addMarker = (lat, lng, title, isSelected = false) => {
    if (!map) return;

    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: map,
      title: title,
      icon: {
        url: isSelected 
          ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" stroke-width="4"/>
                <circle cx="20" cy="20" r="8" fill="white"/>
              </svg>
            `)
          : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="12" fill="#EF4444" stroke="white" stroke-width="3"/>
                <circle cx="15" cy="15" r="6" fill="white"/>
              </svg>
            `),
        scaledSize: new window.google.maps.Size(isSelected ? 40 : 30, isSelected ? 40 : 30),
        anchor: new window.google.maps.Point(20, 20)
      }
    });

    setMarkers(prev => [...prev, marker]);
    return marker;
  };

  const handleLocationClick = async (lat, lng) => {
    try {
      setLoading(true);
      
      // Get address from coordinates using reverse geocoding
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].formatted_address;
          const location = { lat, lng, address };
          
          setSelectedLocation(location);
          
          // Clear previous markers and add new one
          clearMarkers();
          addMarker(lat, lng, address, true);
          
          // Center map on selected location
          map.setCenter({ lat, lng });
        }
        setLoading(false);
      });
    } catch (error) {
      Console.error("Error getting location details:", error);
      setLoading(false);
    }
  };

  const clearMarkers = () => {
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
  };

  const handleSearch = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${serverUrl}/map/get-suggestions`, {
        params: { input: query },
        headers: { token }
      });

      setSuggestions(response.data);
    } catch (error) {
      Console.error("Error getting suggestions:", error);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    try {
      setLoading(true);
      setSearchQuery(suggestion);
      setSuggestions([]);

      // Get coordinates for the selected suggestion
      const token = localStorage.getItem("token");
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${serverUrl}/map/get-coordinates`, {
        params: { address: suggestion },
        headers: { token }
      });

      const { ltd: lat, lng } = response.data;
      
      // Update map center and add marker
      map.setCenter({ lat, lng });
      clearMarkers();
      addMarker(lat, lng, suggestion, true);
      setSelectedLocation({ lat, lng, address: suggestion });
      
    } catch (error) {
      Console.error("Error getting coordinates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation && onLocationSelect) {
      onLocationSelect(selectedLocation);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="w-full h-full max-w-7xl max-h-[90vh] bg-white rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="pl-10"
              />
              
              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleConfirmLocation}
              disabled={!selectedLocation}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Select Location
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative flex-1 h-full">
          <div ref={mapRef} className="w-full h-full" />
          
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          )}

          {/* Map Instructions */}
          <div className="absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Click on the map to select a location</span>
            </div>
          </div>

          {/* Selected Location Info */}
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4 bg-white rounded-lg p-4 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Selected Location</h3>
                  <p className="text-sm text-gray-600 mb-2">{selectedLocation.address}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Navigation className="w-3 h-3" />
                      <span>{selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleConfirmLocation}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Confirm
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default MapView;
