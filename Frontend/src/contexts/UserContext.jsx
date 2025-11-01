import { createContext, useContext, useState, useEffect } from "react";

export const userDataContext = createContext();

const UserContext = ({ children }) => {
  const userData = JSON.parse(localStorage.getItem("userData"));

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

  // Update user state when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUserData = JSON.parse(localStorage.getItem("userData"));
      if (updatedUserData?.type === "user" && updatedUserData.data) {
        setUser(updatedUserData.data);
      }
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for updates periodically (for same-tab updates)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <userDataContext.Provider value={{ user, setUser }}>
      {children}
    </userDataContext.Provider>
  );
};

export const useUser = () => {
  const { user, setUser } = useContext(userDataContext);
  return { user, setUser };
};

export default UserContext;
