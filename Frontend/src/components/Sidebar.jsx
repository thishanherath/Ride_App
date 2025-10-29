import { useEffect, useState } from "react";

import { 
  ChevronRight, 
  CircleUserRound, 
  History, 
  KeyRound, 
  Menu, 
  X, 
  Home,
  MessageCircle,
  CreditCard,
  Bell,
  LogOut,
  User
} from "lucide-react";
import Button from "./Button";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Console from "../utils/console";

function Sidebar() {
  const token = localStorage.getItem("token");
  const [showSidebar, setShowSidebar] = useState(false);

  const [newUser, setNewUser] = useState({});

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    console.log("Sidebar userData:", userData); // Debug log
    setNewUser(userData);
  }, []);

  const navigate = useNavigate();

  const logout = async () => {
    try {
      await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/${newUser?.type}/logout`,
        {
          headers: {
            token: token,
          },
        }
      );

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
          } z-10 duration-300 absolute w-full h-dvh bottom-0 bg-white overflow-y-auto`}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                {newUser?.data?.fullname?.firstname?.[0] || 'D'}
                {newUser?.data?.fullname?.lastname?.[0] || 'T'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">
                {newUser?.data?.fullname?.firstname || 'Dinidu'} {newUser?.data?.fullname?.lastname || 'Thishan'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <User className="w-4 h-4" />
                <span className="text-sm opacity-90">
                  {newUser?.type === 'user' ? 'Rider' : 'Captain'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu Content */}
        <div className="p-4">
          {/* MAIN MENU Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              MAIN MENU
            </h3>
            
            {/* Home */}
            <div
              onClick={() => {
                console.log("Home clicked, user type:", newUser?.type);
                if (newUser?.type) {
                  const homePath = newUser.type === 'user' ? '/home' : '/captain/home';
                  console.log("Navigating to:", homePath);
                  navigate(homePath);
                  setShowSidebar(false);
                } else {
                  console.error("Cannot navigate: no user type found");
                }
              }}
              className="flex items-center gap-4 p-4 hover:bg-orange-50 rounded-xl cursor-pointer transition-colors mb-2 bg-orange-50"
            >
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Home</h4>
                <p className="text-sm text-gray-500">Book your next ride</p>
              </div>
            </div>

            {/* Ride History */}
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log("=== RIDE HISTORY CLICKED ===");
                console.log("Event:", e);
                console.log("User data:", newUser);
                console.log("User type:", newUser?.type);
                console.log("Full userData from localStorage:", localStorage.getItem("userData"));
                
                if (newUser?.type) {
                  const targetPath = `/${newUser.type}/rides`;
                  console.log("Target path:", targetPath);
                  console.log("About to navigate...");
                  
                  try {
                    navigate(targetPath);
                    console.log("Navigate function called successfully");
                    setShowSidebar(false);
                    console.log("Sidebar closed");
                  } catch (error) {
                    console.error("Navigation error:", error);
                  }
                } else {
                  console.error("Cannot navigate: no user type found");
                  console.log("Available user data keys:", Object.keys(newUser || {}));
                }
              }}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors mb-2"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <History className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Ride History</h4>
                <p className="text-sm text-gray-500">View past trips</p>
              </div>
            </div>

            {/* Messages */}
            <div
              onClick={() => {
                console.log("Messages clicked");
                // For now, show an alert since messages functionality might not be fully implemented
                alert("Messages feature coming soon!");
                setShowSidebar(false);
              }}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors mb-2"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Messages</h4>
                <p className="text-sm text-gray-500">Chat with drivers</p>
              </div>
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-semibold">2</span>
              </div>
            </div>

            {/* Profile */}
            <div
              onClick={() => {
                console.log("Profile clicked, user type:", newUser?.type);
                if (newUser?.type) {
                  const profilePath = `/${newUser.type}/edit-profile`;
                  console.log("Navigating to:", profilePath);
                  navigate(profilePath);
                  setShowSidebar(false);
                } else {
                  console.error("Cannot navigate: no user type found");
                }
              }}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors mb-2"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <CircleUserRound className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Profile</h4>
                <p className="text-sm text-gray-500">Manage your account</p>
              </div>
            </div>
          </div>

          {/* SETTINGS & SUPPORT Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              SETTINGS & SUPPORT
            </h3>
            
            {/* Payment Methods */}
            <div
              onClick={() => {
                console.log("Payment Methods clicked");
                // For now, show an alert since payment functionality might not be fully implemented
                alert("Payment Methods feature coming soon!");
                setShowSidebar(false);
              }}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors mb-2"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Payment Methods</h4>
                <p className="text-sm text-gray-500">Cards & wallets</p>
              </div>
            </div>

            {/* Notifications */}
            <div
              onClick={() => {
                console.log("Notifications clicked");
                // For now, show an alert since notifications settings might not be fully implemented
                alert("Notification settings coming soon!");
                setShowSidebar(false);
              }}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors mb-2"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Notifications</h4>
                <p className="text-sm text-gray-500">Manage alerts</p>
              </div>
            </div>

            {/* Change Password */}
            <div
              onClick={() => {
                console.log("Change Password clicked, user type:", newUser?.type);
                if (newUser?.type) {
                  const passwordPath = `/${newUser.type}/reset-password?token=${token}`;
                  console.log("Navigating to:", passwordPath);
                  navigate(passwordPath);
                  setShowSidebar(false);
                } else {
                  console.error("Cannot navigate: no user type found");
                }
              }}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors mb-2"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Change Password</h4>
                <p className="text-sm text-gray-500">Update security</p>
              </div>
            </div>
          </div>

          {/* Debug Navigation Test */}
          <div className="pt-4 border-t border-gray-200 mb-4">
            <div className="bg-yellow-50 p-3 rounded-lg mb-3">
              <h4 className="font-semibold text-yellow-800 mb-2">Debug Info</h4>
              <div className="text-xs text-yellow-700">
                <div>User Type: {newUser?.type || 'undefined'}</div>
                <div>Target Path: {newUser?.type ? `/${newUser.type}/rides` : 'Cannot determine'}</div>
              </div>
            </div>
            
            <button
              onClick={() => {
                console.log("DEBUG: Testing direct navigation to /user/rides");
                try {
                  navigate('/user/rides');
                  console.log("DEBUG: Direct navigation successful");
                  setShowSidebar(false);
                } catch (error) {
                  console.error("DEBUG: Direct navigation failed:", error);
                }
              }}
              className="w-full mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              🧪 Test Direct Navigation to /user/rides
            </button>
            
            <button
              onClick={() => {
                console.log("DEBUG: Testing window.location navigation");
                window.location.href = '/user/rides';
              }}
              className="w-full mb-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              🧪 Test Window Location Navigation
            </button>
          </div>

          {/* Logout Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="w-full flex items-center gap-4 p-4 hover:bg-red-50 rounded-xl cursor-pointer transition-colors text-red-600"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-semibold">Logout</h4>
                <p className="text-sm text-red-500">Sign out of your account</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
