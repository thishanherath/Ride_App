import { createContext, useContext, useState, useEffect } from "react";

export const captainDataContext = createContext();

function CaptainContext({ children }) {
  const userData = JSON.parse(localStorage.getItem("userData"));
  console.log('CaptainContext: Initializing with userData:', userData);

  const [captain, setCaptain] = useState(
    userData?.type == "captain"
      ? userData.data
      : {
        email: "",
        fullname: {
          firstname: "",
          lastname: "",
        },
        vehicle: {
          color: "",
          number: "",
          capacity: 0,
          type: "",
        },
        rides: [],
        status: "inactive",
      }
  );
  
  console.log('CaptainContext: Initial captain state:', captain);

  // Enhanced setCaptain function that forces updates
  const updateCaptain = (newCaptain) => {
    console.log('CaptainContext: Updating captain', newCaptain);
    
    // Validate the new captain object to prevent blank pages
    if (!newCaptain || typeof newCaptain !== 'object') {
      console.error('CaptainContext: Invalid captain object provided', newCaptain);
      return;
    }
    
    // Ensure essential fields exist to prevent blank pages
    const safeCaptain = {
      email: "",
      fullname: {
        firstname: "",
        lastname: "",
      },
      vehicle: {
        color: "",
        number: "",
        capacity: 0,
        type: "",
      },
      rides: [],
      status: "inactive",
      ...newCaptain,
      _lastUpdated: newCaptain._lastUpdated || Date.now()
    };
    
    console.log('CaptainContext: Setting safe captain object', safeCaptain);
    setCaptain(safeCaptain);
    
    // Update localStorage in a safe way
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || '{}');
      if (userData && userData.type === "captain") {
        userData.data = safeCaptain;
        localStorage.setItem("userData", JSON.stringify(userData));
        console.log('CaptainContext: Updated localStorage with new captain data');
      }
    } catch (error) {
      console.error('CaptainContext: Error updating localStorage', error);
    }
    
    // Dispatch events after a delay to prevent issues
    setTimeout(() => {
      try {
        window.dispatchEvent(new CustomEvent('captainProfileUpdated', { 
          detail: { captain: safeCaptain } 
        }));
        console.log('CaptainContext: Dispatched captain profile update event');
      } catch (error) {
        console.error('CaptainContext: Error dispatching event', error);
      }
    }, 150);
  };

  // Update captain state when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUserData = JSON.parse(localStorage.getItem("userData"));
      if (updatedUserData?.type === "captain" && updatedUserData.data) {
        const newCaptain = { 
          ...updatedUserData.data,
          _lastUpdated: updatedUserData.data._lastUpdated || Date.now()
        };
        setCaptain(newCaptain); // Force new object reference
        console.log('CaptainContext: Updated from localStorage change:', newCaptain);
      }
    };

    // Listen for storage changes (cross-tab)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for updates periodically (for same-tab updates)
    const interval = setInterval(handleStorageChange, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <captainDataContext.Provider value={{ captain, setCaptain: updateCaptain }}>
      {children}
    </captainDataContext.Provider>
  );
}

export const useCaptain = () => {
  const { captain, setCaptain } = useContext(captainDataContext);
  return { captain, setCaptain };
};

export default CaptainContext;
