import { useEffect, useRef, useState } from 'react';
import { getApiKey } from '../config/googleMaps';

const MapWithDirections = ({ 
  pickup, 
  destination, 
  center = { lat: 6.9271, lng: 79.8612 }, 
  zoom = 13,
  className = "w-full h-full"
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [error, setError] = useState(null);

  // Initialize Google Maps
  useEffect(() => {
    if (window.google && mapRef.current) {
      initializeMap();
    } else {
      loadGoogleMapsScript();
    }
  }, []);

  // Update directions when pickup/destination changes
  useEffect(() => {
    if (map && directionsService && directionsRenderer && pickup && destination) {
      calculateAndDisplayRoute();
    }
  }, [map, directionsService, directionsRenderer, pickup, destination]);

  const loadGoogleMapsScript = () => {
    // Check if script already exists
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      initializeMap();
      return;
    }

    try {
      const apiKey = getApiKey();
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,directions`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        setError('Failed to load Google Maps script');
      };
      document.head.appendChild(script);
    } catch (err) {
      setError(err.message);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    try {
      // Create map
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: zoom,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Create directions service and renderer
      const directionsServiceInstance = new window.google.maps.DirectionsService();
      const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
        draggable: false,
        panel: null,
        polylineOptions: {
          strokeColor: '#FF6B35',
          strokeWeight: 5,
          strokeOpacity: 0.8
        },
        markerOptions: {
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="12" fill="#FF6B35" stroke="white" stroke-width="3"/>
                <circle cx="15" cy="15" r="6" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(30, 30),
            anchor: new window.google.maps.Point(15, 15)
          }
        }
      });

      directionsRendererInstance.setMap(mapInstance);

      setMap(mapInstance);
      setDirectionsService(directionsServiceInstance);
      setDirectionsRenderer(directionsRendererInstance);
      setError(null);
    } catch (err) {
      setError('Failed to initialize map: ' + err.message);
    }
  };

  const calculateAndDisplayRoute = () => {
    if (!directionsService || !directionsRenderer || !pickup || !destination) {
      return;
    }

    const request = {
      origin: pickup,
      destination: destination,
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    };

    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
        setError(null);
        
        // Log route information for debugging
        const route = result.routes[0];
        const leg = route.legs[0];
        console.log('Route calculated:', {
          distance: leg.distance.text,
          duration: leg.duration.text,
          start: leg.start_address,
          end: leg.end_address
        });
      } else {
        console.error('Directions request failed:', status);
        setError(`Failed to calculate route: ${status}`);
        
        // Fallback: show markers for pickup and destination
        showFallbackMarkers();
      }
    });
  };

  const showFallbackMarkers = () => {
    if (!map) return;

    // Clear existing markers
    if (window.google) {
      // Create geocoder for fallback
      const geocoder = new window.google.maps.Geocoder();
      
      // Add pickup marker
      geocoder.geocode({ address: pickup }, (results, status) => {
        if (status === 'OK') {
          new window.google.maps.Marker({
            position: results[0].geometry.location,
            map: map,
            title: 'Pickup Location',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15" cy="15" r="12" fill="#10B981" stroke="white" stroke-width="3"/>
                  <circle cx="15" cy="15" r="6" fill="white"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(30, 30)
            }
          });
        }
      });

      // Add destination marker
      geocoder.geocode({ address: destination }, (results, status) => {
        if (status === 'OK') {
          new window.google.maps.Marker({
            position: results[0].geometry.location,
            map: map,
            title: 'Destination',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15" cy="15" r="12" fill="#EF4444" stroke="white" stroke-width="3"/>
                  <circle cx="15" cy="15" r="6" fill="white"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(30, 30)
            }
          });
        }
      });
    }
  };

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-600">{error}</p>
          <p className="text-xs text-gray-500 mt-2">
            Please check your Google Maps API configuration
          </p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className={className} />;
};

export default MapWithDirections;