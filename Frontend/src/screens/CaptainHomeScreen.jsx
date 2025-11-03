import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useCaptain } from "../contexts/CaptainContext";
import { 
  Phone, 
  Car, 
  Star, 
  Settings,
  Navigation
} from "lucide-react";
import { SocketDataContext } from "../contexts/SocketContext";
import { 
  StatsCard, 
  EarningsCard, 
  VehicleInfoCard, 
  ModernNewRide,
  AvailableRides 
} from "../components/captain";
import { Header, Avatar, Sidebar } from "../components/layout";
import ProfileAvatar from "../components/ProfileAvatar";
import { useNavigation } from "../hooks/useNavigation";
import Console from "../utils/console";
import { useAlert } from "../hooks/useAlert";
import { useAvailableRides } from "../hooks/useAvailableRides";
import { Alert } from "../components";
import { formatCurrency } from "../utils/currency";

const defaultRideData = null;

function CaptainHomeScreen() {
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  console.log('🔍 CaptainHomeScreen Debug:', {
    hasToken: !!token,
    userData,
    userType: userData?.type,
    currentUrl: window.location.href
  });

  const { captain } = useCaptain();
  
  console.log('👨‍✈️ Captain data:', captain);
  const { socket } = useContext(SocketDataContext);
  const { 
    sidebarOpen, 
    currentPath, 
    openSidebar, 
    closeSidebar, 
    navigateTo, 
    handleLogout 
  } = useNavigation();
  const [loading, setLoading] = useState(false);
  const { alert, showAlert, hideAlert } = useAlert();
  const { 
    rides: availableRides, 
    newRidesCount, 
    markRidesAsViewed,
    getRideStats 
  } = useAvailableRides();

  const [riderLocation, setRiderLocation] = useState({
    ltd: null,
    lng: null,
  });
  const [mapLocation, setMapLocation] = useState("");
  const [earnings, setEarnings] = useState({
    total: 0,
    today: 0,
  });

  const [rides, setRides] = useState({
    accepted: 0,
    cancelled: 0,
    distanceTravelled: 0,
  });
  const [newRide, setNewRide] = useState(
    JSON.parse(localStorage.getItem("rideDetails")) || null
  );


  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("messages")) || []
  );
  const [error, setError] = useState("");

  // Panels
  const [showCaptainDetailsPanel, setShowCaptainDetailsPanel] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showNewRidePanel, setShowNewRidePanel] = useState(
    JSON.parse(localStorage.getItem("showPanel")) || false
  );
  const [showAvailableRidesPanel, setShowAvailableRidesPanel] = useState(false);
  const [showBtn, setShowBtn] = useState(
    JSON.parse(localStorage.getItem("showBtn")) || "accept"
  );

  // Early return if no token
  if (!token) {
    console.log('❌ No token found, redirecting to login');
    window.location.href = '/captain/login';
    return <div>Redirecting to login...</div>;
  }

  // Early return if no captain data
  if (!captain || !captain._id) {
    console.log('❌ No captain data found:', captain);
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Loading Captain Data...</h2>
          <p className="text-gray-600 mb-4">Please wait while we load your profile.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <div className="mt-4 text-sm text-gray-500">
            <p>Token: {token ? '✅ Present' : '❌ Missing'}</p>
            <p>Captain ID: {captain?._id || 'Not loaded'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Function to start ride directly without OTP
  const startRideDirectly = async (rideData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/ride/start-ride-direct`,
        { rideId: rideData._id },
        {
          headers: {
            token: token,
          },
        }
      );
      Console.log('Ride started directly:', response);
      return response.data;
    } catch (error) {
      Console.log('Error starting ride directly:', error);
      // If direct start fails, we'll continue with accepted status
      return rideData;
    }
  };

  // Function to start ride manually (called by Start Ride button)
  const startRide = async () => {
    try {
      if (newRide && newRide._id) {
        setLoading(true);
        await startRideDirectly(newRide);
        setShowBtn("end-ride");
        setLoading(false);
        console.log('🚗 Ride started manually by captain');
        showAlert('Ride Started!', 'The ride has been started. Navigate to destination.', 'success');
      }
    } catch (error) {
      setLoading(false);
      showAlert('Error', 'Failed to start ride', 'failure');
    }
  };

  const acceptRide = async (rideData = null) => {
    try {
      const rideToAccept = rideData || newRide;
      if (rideToAccept && rideToAccept._id) {
        setLoading(true);
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/ride/confirm`,
          { rideId: rideToAccept._id },
          {
            headers: {
              token: token,
            },
          }
        );
        
        // If accepting from available rides, update the current ride
        if (rideData) {
          setNewRide(response.data);
          setShowAvailableRidesPanel(false);
          setShowNewRidePanel(true);
          setShowCaptainDetailsPanel(false);
        } else {
          setNewRide(response.data);
        }
        
        setLoading(false);
        
        // Show "Start Ride" button instead of automatically starting
        setShowBtn("start-ride");
        
        // Optional: Auto-start after a delay to show "Driver Assigned" status
        setTimeout(async () => {
          if (newRide && newRide.status === 'accepted') {
            await startRideDirectly(response.data);
            setShowBtn("end-ride");
            console.log('🚗 Ride started automatically after delay');
          }
        }, 3000); // 3 second delay to show "Driver Assigned" status
        setMapLocation(
          `https://www.google.com/maps?q=${riderLocation.ltd},${riderLocation.lng} to ${rideToAccept.destination}&output=embed`
        );
        Console.log(response);
        showAlert('Ride Started!', 'You have successfully accepted and started the ride. Navigate to destination.', 'success');
        
        // Store ride details without OTP
        localStorage.setItem("rideDetails", JSON.stringify(response.data));
        localStorage.setItem("showPanel", JSON.stringify(true));
        localStorage.setItem("showBtn", JSON.stringify("end-ride"));
      }
    } catch (error) {
      setLoading(false);
      showAlert('Error', error.response?.data?.message || 'Failed to accept ride', 'failure');
      Console.log(error.response);
      setTimeout(() => {
        clearRideData();
      }, 1000);
    }
  };



  const cancelRide = async (reason = "Captain cancelled") => {
    try {
      if (newRide && newRide._id) {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/ride/cancel?rideId=${newRide._id}`,
          {
            headers: {
              token: token,
            },
          }
        );
        
        setMapLocation(
          `https://www.google.com/maps?q=${riderLocation.ltd},${riderLocation.lng}&output=embed`
        );
        setShowBtn("accept");
        setLoading(false);
        setShowCaptainDetailsPanel(true);
        setShowNewRidePanel(false);
        setNewRide(null);
        setError("");
        
        // Clear stored data
        localStorage.removeItem("rideDetails");
        localStorage.removeItem("showPanel");
        localStorage.removeItem("showBtn");
        
        Console.log(response);
        showAlert('Ride Cancelled', 'The ride has been cancelled successfully.', 'info');
      }
    } catch (err) {
      setLoading(false);
      showAlert('Error', err.response?.data?.message || 'Failed to cancel ride', 'failure');
      Console.log(err);
    }
  };

  const endRide = async () => {
    console.log('🏁 End ride button clicked');
    console.log('Current ride data:', newRide);
    
    try {
      if (newRide && newRide._id) {
        console.log('📡 Sending end ride request for:', newRide._id);
        setLoading(true);
        
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/ride/end-ride`,
          {
            rideId: newRide._id,
          },
          {
            headers: {
              token: token,
            },
          }
        );
        
        console.log('✅ End ride API response:', response.data);
        
        // Immediately update UI state - don't wait for clearRideData
        setLoading(false);
        setNewRide(null);
        setShowNewRidePanel(false);
        setShowCaptainDetailsPanel(true);
        setShowBtn("accept");
        setError("");
        
        // Update map location to current location
        setMapLocation(
          `https://www.google.com/maps?q=${riderLocation.ltd},${riderLocation.lng}&output=embed`
        );
        
        // Clear localStorage
        localStorage.removeItem("rideDetails");
        localStorage.removeItem("showPanel");
        localStorage.removeItem("showBtn");
        
        console.log('🎉 Ride ended successfully, UI state updated');
        Console.log(response);
        
        // Show success message
        showAlert('Ride Completed!', 'The ride has been completed successfully. Great job!', 'success');
        
        // Force UI refresh after a short delay
        setTimeout(() => {
          console.log('🔄 Final state check after ride end:', {
            showBtn: "accept",
            showCaptainDetailsPanel: true,
            showNewRidePanel: false,
            newRide: null
          });
          
          // Force re-render by updating a state
          setIsMinimized(false);
        }, 200);
      } else {
        console.log('❌ No ride data found to end');
        showAlert('Error', 'No active ride found to end', 'failure');
      }
    } catch (err) {
      console.error('❌ End ride error:', err);
      console.error('Error response:', err.response?.data);
      setLoading(false);
      showAlert('Error', err.response?.data?.message || 'Failed to end ride', 'failure');
      Console.log(err);
    }
  };

  const updateLocation = () => {
    console.log('🔍 Requesting current location...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ Location obtained:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          
          setRiderLocation({
            ltd: position.coords.latitude,
            lng: position.coords.longitude,
          });

          setMapLocation(
            `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}&output=embed`
          );
          
          // Update captain location on server
          if (captain._id) {
            socket.emit("update-location-captain", {
              userId: captain._id,
              location: {
                ltd: position.coords.latitude,
                lng: position.coords.longitude,
              },
            });
          }
        },
        (error) => {
          console.error("❌ Geolocation error:", error);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error("User denied the request for Geolocation.");
              alert("Please enable location permissions to use this feature. You can enable it in your browser settings.");
              break;
            case error.POSITION_UNAVAILABLE:
              console.error("Location information is unavailable.");
              alert("Location information is unavailable. Please check your GPS and internet connection.");
              break;
            case error.TIMEOUT:
              console.error("The request to get user location timed out.");
              alert("Location request timed out. Please try again.");
              break;
            default:
              console.error("An unknown error occurred.");
              alert("An unknown error occurred while getting your location.");
          }
          
          // Use fallback location (Colombo, Sri Lanka)
          console.log('🔄 Using fallback location: Colombo, Sri Lanka');
          setRiderLocation({
            ltd: 6.9271,
            lng: 79.8612,
          });
          setMapLocation(
            `https://www.google.com/maps?q=6.9271,79.8612&output=embed`
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      console.error("❌ Geolocation is not supported by this browser.");
      alert("Geolocation is not supported by this browser.");
      
      // Use fallback location
      setRiderLocation({
        ltd: 6.9271,
        lng: 79.8612,
      });
      setMapLocation(
        `https://www.google.com/maps?q=6.9271,79.8612&output=embed`
      );
    }
  };

  const clearRideData = () => {
    setShowBtn("accept");
    setLoading(false);
    setShowCaptainDetailsPanel(true);
    setShowNewRidePanel(false);
    setNewRide(null);
    localStorage.removeItem("rideDetails");
    localStorage.removeItem("showPanel");
  }

  useEffect(() => {
    if (captain._id) {
      socket.emit("join", {
        userId: captain._id,
        userType: "captain",
      });

      // Get current location when captain logs in
      updateLocation();
      
      // Update location every 30 seconds for real-time tracking
      const locationInterval = setInterval(updateLocation, 30000);
      
      // Cleanup interval on unmount
      return () => clearInterval(locationInterval);
    }

    socket.on("new-ride", (data) => {
      const timestamp = new Date().toLocaleTimeString();
      Console.log(`🚨 REAL-TIME: New Ride received at ${timestamp}:`, data);
      
      // Visual confirmation this is real-time
      alert(`🚨 REAL-TIME: New ride available at ${timestamp}!\nFrom: ${data.pickup}\nTo: ${data.destination}`);
      
      setShowBtn("accept");
      setNewRide(data);
      setShowNewRidePanel(true);
    });

    socket.on("ride-cancelled", (data) => {
      Console.log("Ride cancelled", data);
      updateLocation(); // Reset to current location
      clearRideData();
    });

    socket.on("ride-taken", (data) => {
      Console.log("Ride taken by another driver", data);
      // Hide the current ride if it matches the taken ride
      if (newRide && newRide._id === data.rideId) {
        clearRideData();
        showAlert('Ride Taken', 'This ride has been accepted by another driver', 'info');
      }
    });
  }, [captain]);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (newRide && newRide._id) {
      socket.emit("join-room", newRide._id);

      socket.on("receiveMessage", async (msg) => {
        // Console.log("Received message: ", msg);
        setMessages((prev) => [...prev, { msg, by: "other" }]);
      });

      return () => {
        socket.off("receiveMessage");
      };
    }
  }, [newRide]);

  useEffect(() => {
    if (newRide) {
      localStorage.setItem("rideDetails", JSON.stringify(newRide));
    } else {
      localStorage.removeItem("rideDetails");
    }
  }, [newRide]);

  useEffect(() => {
    localStorage.setItem("showPanel", JSON.stringify(showNewRidePanel));
    localStorage.setItem("showBtn", JSON.stringify(showBtn));
  }, [showNewRidePanel, showBtn]);

  const calculateEarnings = () => {
    let Totalearnings = 0;
    let Todaysearning = 0;

    let acceptedRides = 0;
    let cancelledRides = 0;

    let distanceTravelled = 0;

    const today = new Date();
    const todayWithoutTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    captain.rides.forEach((ride) => {
      if (ride.status == "completed") {
        acceptedRides++;
        distanceTravelled += ride.distance;
      }
      if (ride.status == "cancelled") cancelledRides++;

      Totalearnings += ride.fare;
      const rideDate = new Date(ride.updatedAt);

      const rideDateWithoutTime = new Date(
        rideDate.getFullYear(),
        rideDate.getMonth(),
        rideDate.getDate()
      );

      if (
        rideDateWithoutTime.getTime() === todayWithoutTime.getTime() &&
        ride.status === "completed"
      ) {
        Todaysearning += ride.fare;
      }
    });

    setEarnings({ total: Totalearnings, today: Todaysearning });
    setRides({
      accepted: acceptedRides,
      cancelled: cancelledRides,
      distanceTravelled: Math.round(distanceTravelled / 1000),
    });
  };

  useEffect(() => {
    calculateEarnings();
  }, [captain]);

  useEffect(() => {
    if (mapLocation.ltd && mapLocation.lng) {
      Console.log(mapLocation);
    }
  }, [mapLocation]);

  useEffect(() => {
    if (socket.id) Console.log("socket id:", socket.id);
  }, [socket.id]);

  return (
    <div className="relative w-full min-h-screen bg-gray-50 overflow-hidden">
      <Alert
        heading={alert.heading}
        text={alert.text}
        isVisible={alert.isVisible}
        onClose={hideAlert}
        type={alert.type}
      />
      {/* Modern Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        user={captain}
        userType="captain"
        onNavigate={navigateTo}
        currentPath={currentPath}
        onLogout={handleLogout}
      />
      
      {/* Modern Header */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <Header 
          title="Driver Dashboard"
          user={captain}
          onMenuClick={openSidebar}
          showNotifications={true}
          onNotificationClick={() => navigateTo('/captain/notifications')}
          onProfileClick={() => navigateTo('/captain/edit-profile')}
        />
      </div>
      
      {/* Driver Header with Earnings */}
      <div className="absolute top-16 left-0 right-0 z-10">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 sm:px-6 py-3 sm:py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="border-2 border-white/20 rounded-full flex-shrink-0">
                <ProfileAvatar 
                  user={captain}
                  size="md"
                  className="w-10 h-10"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold truncate">
                  {captain?.fullname?.firstname} {captain?.fullname?.lastname}
                </h1>
                <p className="text-orange-100 text-xs sm:text-sm flex items-center space-x-1">
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{captain?.phone}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button 
                onClick={() => {
                  setShowAvailableRidesPanel(!showAvailableRidesPanel);
                  setShowCaptainDetailsPanel(!showAvailableRidesPanel);
                  if (!showAvailableRidesPanel) {
                    markRidesAsViewed(); // Clear notification badge when viewing rides
                  }
                }}
                className="relative px-2 sm:px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-xs sm:text-sm font-medium"
              >
                <span className="hidden sm:inline">
                  {showAvailableRidesPanel ? 'Dashboard' : 'Available Rides'}
                </span>
                <span className="sm:hidden">
                  {showAvailableRidesPanel ? 'Dash' : 'Rides'}
                </span>
                {newRidesCount > 0 && !showAvailableRidesPanel && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {newRidesCount > 9 ? '9+' : newRidesCount}
                  </span>
                )}
              </button>
              <button className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="absolute inset-0 pt-28 sm:pt-32">
        <iframe
          src={mapLocation}
          className="w-full h-full"
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        
        {/* Floating Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* Location Update Button */}
          <button
            onClick={updateLocation}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Navigation className="w-6 h-6 text-gray-700" />
          </button>
          
          {/* Available Rides Indicator */}
          {availableRides.length > 0 && (
            <button
              onClick={() => {
                setShowAvailableRidesPanel(true);
                setShowCaptainDetailsPanel(false);
                markRidesAsViewed();
              }}
              className="relative w-12 h-12 bg-blue-600 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Car className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {availableRides.length > 9 ? '9+' : availableRides.length}
              </span>
            </button>
          )}
        </div>
      </div>



      {/* Compact Driver Dashboard Panel */}
      {showCaptainDetailsPanel && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="bg-white rounded-t-3xl shadow-2xl">
            {/* Compact Header with Key Info */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-1 bg-gray-300 rounded-full" />
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {isMinimized ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
                <div className="w-12 h-1 bg-gray-300 rounded-full" />
              </div>
              
              {/* Always Visible Compact Stats */}
              <div className="flex items-center justify-between text-center">
                <div className="flex-1">
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(earnings.today)}</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-blue-600">{rides?.accepted}</p>
                  <p className="text-xs text-gray-500">Rides</p>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-green-600">{rides?.distanceTravelled}km</p>
                  <p className="text-xs text-gray-500">Distance</p>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-yellow-600">4.8</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              </div>
            </div>
            
            {/* Expandable Content */}
            {!isMinimized && (
              <div className="max-h-[35vh] overflow-y-auto">
                <div className="p-4">{/* Available Rides Quick Info */}

                {availableRides.length > 0 ? (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-3 mb-4 border border-blue-200">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-blue-900 mb-1 text-sm">
                          {availableRides.length} Rides Available
                        </h3>
                        <p className="text-xs text-blue-700 truncate">
                          {getRideStats().nearby} nearby • Avg fare: {formatCurrency(getRideStats().averageFare)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowAvailableRidesPanel(true);
                          setShowCaptainDetailsPanel(false);
                          markRidesAsViewed();
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-colors flex-shrink-0"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 mb-4 border border-gray-200 text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Car className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-700 mb-2 text-sm">No Rides Available</h3>
                    <p className="text-xs text-gray-500 mb-3">
                      You're online and ready to receive ride requests.
                    </p>
                    <button
                      onClick={updateLocation}
                      className="px-3 py-2 bg-orange-500 text-white rounded-xl text-xs font-medium hover:bg-orange-600 transition-colors"
                    >
                      Update Location
                    </button>
                  </div>
                )}

                  {/* Vehicle Info */}
                  <VehicleInfoCard vehicle={captain?.vehicle} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Available Rides Panel */}
      {showAvailableRidesPanel && (
        <div className="absolute bottom-0 left-0 right-0 z-20 max-h-[80vh] overflow-y-auto">
          <AvailableRides
            onAcceptRide={acceptRide}
            loading={loading}
          />
        </div>
      )}

      {/* Modern New Ride Component - Only show when there's an actual ride */}
      {newRide && (
        <ModernNewRide
          rideData={newRide}
          showBtn={showBtn}
          showPanel={showNewRidePanel}
          setShowPanel={setShowNewRidePanel}
          showPreviousPanel={setShowCaptainDetailsPanel}
          loading={loading}
          acceptRide={() => acceptRide()}
          startRide={startRide}
          endRide={endRide}
          error={error}
        />
      )}
    </div>
  );
}

export default CaptainHomeScreen;
