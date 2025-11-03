import { createContext, useContext, useState, useEffect } from "react";

export const userDataContext = createContext();

const UserContext = ({ children }) => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  console.log('UserContext: Initializing with userData:', userData);

  const [user, setUser] = useState(
    userData?.type == "user"
      ? userData.data
      : {
        email: "",
        fullname: {
          firstname: "",
          lastname: "",
        }
      }
  );
  
  console.log('UserContext: Initial user state:', user);

  // Enhanced setUser function that forces updates
  const updateUser = (newUser) => {
    console.log('UserContext: Updating user', newUser);
    
    // Validate the new user object to prevent blank pages
    if (!newUser || typeof newUser !== 'object') {
      console.error('UserContext: Invalid user object provided', newUser);
      return;
    }
    
    // Ensure essential fields exist to prevent blank pages
    const safeUser = {
      email: "",
      fullname: {
        firstname: "",
        lastname: "",
      },
      ...newUser,
      _lastUpdated: newUser._lastUpdated || Date.now()
    };
    
    console.log('UserContext: Setting safe user object', safeUser);
    setUser(safeUser);
    
    // Update localStorage in a safe way
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || '{}');
      if (userData && userData.type === "user") {
        userData.data = safeUser;
        localStorage.setItem("userData", JSON.stringify(userData));
        console.log('UserContext: Updated localStorage with new user data');
      }
    } catch (error) {
      console.error('UserContext: Error updating localStorage', error);
    }
    
    // Dispatch events after a delay to prevent issues
    setTimeout(() => {
      try {
        window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
          detail: { user: safeUser } 
        }));
        console.log('UserContext: Dispatched profile update event');
      } catch (error) {
        console.error('UserContext: Error dispatching event', error);
      }
    }, 150);
  };

  // Update user state when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUserData = JSON.parse(localStorage.getItem("userData"));
      if (updatedUserData?.type === "user" && updatedUserData.data) {
        const newUser = { 
          ...updatedUserData.data,
          _lastUpdated: updatedUserData.data._lastUpdated || Date.now()
        };
        setUser(newUser); // Force new object reference
        console.log('UserContext: Updated from localStorage change:', newUser);
      }
    };

    // Listen for storage changes (cross-tab)
    window.addEventListener('storage', handleStorageChange);
    
    // Remove the circular update listener that was causing infinite loops
    
    // Also check for updates periodically (for same-tab updates)
    const interval = setInterval(handleStorageChange, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <userDataContext.Provider value={{ user, setUser: updateUser }}>
      {children}
    </userDataContext.Provider>
  );
};

export const useUser = () => {
  const { user, setUser } = useContext(userDataContext);
  return { user, setUser };
};

export default UserContext;
