/**
 * Fixed Sidebar Component
 * Addresses the Ride History navigation issue
 */

import { useEffect, useState } from "react";
import { ChevronRight, CircleUserRound, History, KeyRound, Menu, X } from "lucide-react";
import Button from "../components/Button";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Console from "../utils/console";

function SidebarFixed() {
  const token = localStorage.getItem("token");
  const [showSidebar, setShowSidebar] = useState(false);
  const [newUser, setNewUser] = useState({});
  const [debugInfo, setDebugInfo] = useState([]);

  const navigate = useNavigate();

  const addDebugInfo = (message) => {
    console.log(`[SIDEBAR DEBUG] ${message}`);
    setDebugInfo(prev => [...prev.slice(-4), message]); // Keep last 5 messages
  };

  useEffect(() => {
    addDebugInfo("Loading user data from localStorage...");
    
    const userData = localStorage.getItem("userData");
    
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        addDebugInfo(`Raw userData: ${userData}`);
        addDebugInfo(`Parsed userData type: ${parsed?.type}`);
        addDebugInfo(`User data structure: ${Object.keys(parsed).join(', ')}`);
        
        setNewUser(parsed);
        
        // Validate the structure
        if (!parsed.type) {
          addDebugInfo("WARNING: No type found in userData");
        } else {
          addDebugInfo(`User type confirmed: ${parsed.type}`);
        }
        
      } catch (error) {
        addDebugInfo(`ERROR parsing userData: ${error.message}`);
      }
    } else {
      addDebugInfo("No userData found in localStorage");
    }
  }, []);

  const logout = async () => {
    try {
      if (newUser?.type) {
        await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/${newUser.type}/logout`,
          {
            headers: {
              token: token,
            },
          }
        );
      }

      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("messages");
      localStorage.removeItem("rideDetails");
      localStorage.removeItem("panelDetails");
      localStorage.removeItem("showPanel");
      localStorage.removeItem("showBtn");
      navigate("/");
    } catch (error) {
      Console.log("Error getting logged out", error);
    }
  };

  // Enhanced navigation function with debugging
  const handleRideHistoryClick = (e) => {
    e.preventDefault();
    
    addDebugInfo("Ride History clicked");
    addDebugInfo(`Current user type: ${newUser?.type}`);
    
    if (!newUser?.type) {
      addDebugInfo("ERROR: Cannot navigate - no user type");
      return;
    }
    
    const targetPath = `/${newUser.type}/rides`;
    addDebugInfo(`Navigating to: ${targetPath}`);
    
    try {
      navigate(targetPath);
      addDebugInfo(`Navigation successful to: ${targetPath}`);
      setShowSidebar(false); // Close sidebar after navigation
    } catch (error) {
      addDebugInfo(`Navigation failed: ${error.message}`);
    }
  };

  return (
    <>
      <div
        className="m-3 mt-4 absolute right-0 top-0 z-20 cursor-pointer bg-white p-1 rounded"
        onClick={() => {
          setShowSidebar(!showSidebar);
        }}
      >
        {showSidebar ? <X /> : <Menu />}
      </div>

      {/* Sidebar Component */}
      <div
        className={`${showSidebar ? " left-0 " : " -left-[100%] "
          } z-10 duration-300 absolute w-full h-dvh bottom-0 bg-white p-4 pt-5 flex flex-col justify-between`}
      >
        <div className="select-none">
          <h1 className="relative text-2xl font-semibold ">Profile</h1>

          {/* Debug Info Display */}
          {debugInfo.length > 0 && (
            <div className="mt-2 mb-4 p-2 bg-gray-100 rounded text-xs">
              <div className="font-semibold">Debug Info:</div>
              {debugInfo.map((info, index) => (
                <div key={index} className="text-gray-600">{info}</div>
              ))}
            </div>
          )}

          <div className="leading-3 mt-8 mb-4">
            <div className="my-2 rounded-full w-24 h-24 bg-blue-400 mx-auto flex items-center justify-center">
              <h1 className="text-5xl text-white">
                {newUser?.data?.fullname?.firstname?.[0] || 'U'}
                {newUser?.data?.fullname?.lastname?.[0] || 'U'}
              </h1>
            </div>
            <h1 className=" text-center font-semibold text-2xl">
              {newUser?.data?.fullname?.firstname || 'User'}{" "}
              {newUser?.data?.fullname?.lastname || ''}
            </h1>
            <h1 className="mt-1 text-center text-zinc-400 ">
              {newUser?.data?.email || 'No email'}
            </h1>
          </div>

          {/* Navigation Links */}
          <Link
            to={`/${newUser?.type}/edit-profile`}
            className="flex items-center justify-between py-4 cursor-pointer hover:bg-zinc-100 rounded-xl px-3"
          >
            <div className="flex gap-3">
              <CircleUserRound /> <h1>Edit Profile</h1>
            </div>
            <div>
              <ChevronRight />
            </div>
          </Link>

          {/* Enhanced Ride History Link with debugging */}
          <div
            onClick={handleRideHistoryClick}
            className="flex items-center justify-between py-4 cursor-pointer hover:bg-zinc-100 rounded-xl px-3"
          >
            <div className="flex gap-3">
              <History /> <h1>Ride History</h1>
            </div>
            <div>
              <ChevronRight />
            </div>
          </div>

          {/* Alternative Link version for comparison */}
          {newUser?.type && (
            <Link
              to={`/${newUser.type}/rides`}
              className="flex items-center justify-between py-4 cursor-pointer hover:bg-zinc-100 rounded-xl px-3 border-l-4 border-blue-500"
              onClick={() => addDebugInfo(`Link version clicked: /${newUser.type}/rides`)}
            >
              <div className="flex gap-3">
                <History /> <h1>Ride History (Link)</h1>
              </div>
              <div>
                <ChevronRight />
              </div>
            </Link>
          )}

          <Link
            to={`/${newUser?.type}/reset-password?token=${token}`}
            className="flex items-center justify-between py-4 cursor-pointer hover:bg-zinc-100 rounded-xl px-3"
          >
            <div className="flex gap-3">
              <KeyRound /> <h1>Change Password</h1>
            </div>
            <div>
              <ChevronRight />
            </div>
          </Link>

          {/* Debug Navigation Buttons */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-semibold mb-2">Debug Navigation</div>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/user/rides')}
                className="w-full px-3 py-1 bg-blue-500 text-white rounded text-sm"
              >
                Force /user/rides
              </button>
              <button
                onClick={() => navigate('/captain/rides')}
                className="w-full px-3 py-1 bg-green-500 text-white rounded text-sm"
              >
                Force /captain/rides
              </button>
              <div className="text-xs text-gray-600">
                Current type: {newUser?.type || 'undefined'}
              </div>
            </div>
          </div>
        </div>

        <Button title={"Logout"} classes={"bg-red-600"} fun={logout} />
      </div>
    </>
  );
}

export default SidebarFixed;