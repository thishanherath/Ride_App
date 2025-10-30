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
import { useNavigation } from "../hooks/useNavigation";
import Console from "../utils/console";
import { useAlert } from "../hooks/useAlert";
import { useAvailableRides } from "../hooks/useAvailableRides";
import { Alert } from "../components";

const defaultRideData = {
  user: {
    fullname: {
      firstname: "No",
      lastname: "User",
    },
    _id: "",
    email: "example@gmail.com",
    rides: [],
  },
  pickup: "Place, City, State, Country",
  destination: "Place, City, State, Country",
  fare: 0,
  vehicle: "car",
  status: "pending",
  duration: 0,
  distance: 0,
  _id: "123456789012345678901234",
};

function CaptainHomeScreen() {
  const token = localStorage.getItem("token");

  const { captain } = useCaptain();
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
    JSON.parse(localStorage.getItem("rideDetails")) || defaultRideData
  );

  const [otp, setOtp] = useState("");
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("messages")) || []
  );
  const [error, setError] = useState("");

  // Panels
  const [showCaptainDetailsPanel, setShowCaptainDetailsPanel] = useState(true);
  const [showNewRidePanel, setShowNewRidePanel] = useState(
    JSON.parse(localStorage.getItem("showPanel")) || false
  );
  const [showAvailableRidesPanel, setShowAvailableRidesPanel] = useState(false);
  const [showBtn, setShowBtn] = useState(
    JSON.parse(localStorage.getItem("showBtn")) || "accept"
  );

  const acceptRide = async (rideData = null) => {
    try {
      const rideToAccept = rideData || newRide;
      if (rideToAccept._id != "") {
        setLoading(true);
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/ride/captain/accept`,
          { rideId: rideToAccept._id },
          {
            headers: {
              token: token,
            },
          }
        );
        
        // If accepting from available rides, update the current ride
        if (rideData) {
          setNewRide(rideData);
          setShowAvailableRidesPanel(false);
          setShowNewRidePanel(true);
          setShowCaptainDetailsPanel(false);
        }
        
        setLoading(false);
        setShowBtn("otp");
        setMapLocation(
          `https://www.google.com/maps?q=${riderLocation.ltd},${riderLocation.lng} to ${rideToAccept.pickup}&output=embed`
        );
        Console.log(response);
        showAlert('Ride Accepted!', 'You have successfully accepted the ride. Please proceed to pickup location.', 'success');
        
        // Store ride details and OTP
        if (response.data.success && response.data.otp) {
          localStorage.setItem("rideOTP", response.data.otp);
          localStorage.setItem("rideDetails", JSON.stringify(response.data.ride));
          localStorage.setItem("showPanel", JSON.stringify(true));
          localStorage.setItem("showBtn", JSON.stringify("otp"));
        }
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

  const verifyOTP = async () => {
    try {
      if (newRide._id != "" && otp.length >= 4) {
        setLoading(true);
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/ride/captain/start`,
          { 
            rideId: newRide._id, 
            otp: otp 
          },
          {
            headers: {
              token: token,
            },
          }
        );
        setMapLocation(
          `https://www.google.com/maps?q=${riderLocation.ltd},${riderLocation.lng} to ${newRide.destination}&output=embed`
        );
        setShowBtn("end-ride");
        setLoading(false);
        setError("");
        Console.log(response);
        showAlert('Ride Started!', 'The ride has been started successfully. Navigate to destination.', 'success');
        
        // Update stored data
        localStorage.setItem("showBtn", JSON.stringify("end-ride"));
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Invalid OTP");
      Console.log(err);
    }
  };

  const cancelRide = async (reason = "Captain cancelled") => {
    try {
      if (newRide._id != "") {
        setLoading(true);
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/ride/captain/cancel`,
          {
            rideId: newRide._id,
            reason: reason
          },
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
        setNewRide(defaultRideData);
        setOtp("");
        setError("");
        
        // Clear stored data
        localStorage.removeItem("rideDetails");
        localStorage.removeItem("showPanel");
        localStorage.removeItem("showBtn");
        localStorage.removeItem("rideOTP");
        
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
    try {
      if (newRide._id != "") {
        setLoading(true);
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/ride/captain/end`,
          {
            rideId: newRide._id,
          },
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
        setNewRide(defaultRideData);
        setOtp("");
        setError("");
        
        // Clear stored data
        localStorage.removeItem("rideDetails");
        localStorage.removeItem("showPanel");
        localStorage.removeItem("showBtn");
        localStorage.removeItem("rideOTP");
        
        Console.log(response);
        showAlert('Ride Completed!', 'The ride has been completed successfully. Great job!', 'success');
      }
    } catch (err) {
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
    setNewRide(defaultRideData);
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
      Console.log("New Ride available:", data);
      setShowBtn("accept");
      setNewRide(data);
      setShowNewRidePanel(true);
    });

    socket.on("ride-cancelled", (data) => {
      Console.log("Ride cancelled", data);
      updateLocation(); // Reset to current location
      clearRideData();
    });
  }, [captain]);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    socket.emit("join-room", newRide._id);

    socket.on("receiveMessage", async (msg) => {
      // Console.log("Received message: ", msg);
      setMessages((prev) => [...prev, { msg, by: "other" }]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [newRide]);

  useEffect(() => {
    localStorage.setItem("rideDetails", JSON.stringify(newRide));
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
    <div className="relative w-full h-screen bg-gray-50">
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
        user={{
          name: captain?.fullname ? `${captain.fullname.firstname} ${captain.fullname.lastname}` : 'Captain',
          avatar: captain?.avatar,
          rating: captain?.rating
        }}
        userType="captain"
        onNavigate={navigateTo}
        currentPath={currentPath}
        onLogout={handleLogout}
      />
      
      {/* Modern Header */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <Header 
          title="Captain Dashboard"
          user={{
            name: captain?.fullname ? `${captain.fullname.firstname} ${captain.fullname.lastname}` : 'Captain',
            avatar: captain?.avatar
          }}
          onMenuClick={openSidebar}
          showNotifications={true}
          onNotificationClick={() => navigateTo('/captain/notifications')}
          onProfileClick={() => navigateTo('/captain/edit-profile')}
        />
      </div>
      
      {/* Captain Header with Earnings */}
      <div className="absolute top-16 left-0 right-0 z-10">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar 
                src={captain?.avatar} 
                name={`${captain?.fullname?.firstname} ${captain?.fullname?.lastname}`}
                size="lg"
                className="border-2 border-white/20"
              />
              <div>
                <h1 className="text-xl font-semibold">
                  {captain?.fullname?.firstname} {captain?.fullname?.lastname}
                </h1>
                <p className="text-orange-100 text-sm flex items-center space-x-1">
                  <Phone className="w-3 h-3" />
                  <span>{captain?.phone}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setShowAvailableRidesPanel(!showAvailableRidesPanel);
                  setShowCaptainDetailsPanel(!showAvailableRidesPanel);
                  if (!showAvailableRidesPanel) {
                    markRidesAsViewed(); // Clear notification badge when viewing rides
                  }
                }}
                className="relative px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium"
              >
                {showAvailableRidesPanel ? 'Dashboard' : 'Available Rides'}
                {newRidesCount > 0 && !showAvailableRidesPanel && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {newRidesCount > 9 ? '9+' : newRidesCount}
                  </span>
                )}
              </button>
              <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="absolute inset-0 pt-20">
        <iframe
          src={mapLocation}
          className="w-full h-full"
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Modern Dashboard Panel */}
      {showCaptainDetailsPanel && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="bg-white rounded-t-3xl shadow-2xl p-6">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
            
            {/* Earnings Card */}
            <EarningsCard 
              todayEarnings={earnings.today}
              totalEarnings={earnings.total}
              className="mb-6"
            />
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatsCard
                title="Rides"
                value={rides?.accepted}
                icon={<Car className="w-5 h-5" />}
                color="blue"
                subtitle="Completed"
              />
              <StatsCard
                title="Distance"
                value={`${rides?.distanceTravelled}km`}
                icon={<Navigation className="w-5 h-5" />}
                color="green"
                subtitle="Travelled"
              />
              <StatsCard
                title="Rating"
                value="4.8"
                icon={<Star className="w-5 h-5" />}
                color="yellow"
                subtitle="Average"
              />
            </div>

            {/* Available Rides Quick Info */}
            {availableRides.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 mb-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">
                      {availableRides.length} Rides Available
                    </h3>
                    <p className="text-sm text-blue-700">
                      {getRideStats().nearby} nearby • Avg fare: Rs. {getRideStats().averageFare}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAvailableRidesPanel(true);
                      setShowCaptainDetailsPanel(false);
                      markRidesAsViewed();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    View All
                  </button>
                </div>
              </div>
            )}

            {/* Vehicle Info */}
            <VehicleInfoCard vehicle={captain?.vehicle} />
          </div>
        </div>
      )}

      {/* Available Rides Panel */}
      {showAvailableRidesPanel && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <AvailableRides
            onAcceptRide={acceptRide}
            loading={loading}
          />
        </div>
      )}

      {/* Modern New Ride Component */}
      <ModernNewRide
        rideData={newRide}
        otp={otp}
        setOtp={setOtp}
        showBtn={showBtn}
        showPanel={showNewRidePanel}
        setShowPanel={setShowNewRidePanel}
        showPreviousPanel={setShowCaptainDetailsPanel}
        loading={loading}
        acceptRide={() => acceptRide()}
        verifyOTP={verifyOTP}
        endRide={endRide}
        error={error}
      />
    </div>
  );
}

export default CaptainHomeScreen;
