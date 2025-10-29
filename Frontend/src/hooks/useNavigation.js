import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export const useNavigation = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const navigateTo = useCallback((path) => {
    console.log(`🔄 Navigating to: ${path}`);
    
    // Use window.location.href for reliable navigation
    // This bypasses React Router issues and ensures page updates
    window.location.href = path;
    
    // Note: setSidebarOpen(false) not needed since page will reload
  }, []);

  const handleLogout = useCallback(async () => {
    console.log('🚪 Logging out user...');
    
    try {
      // Get user data and token
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userType = userData.type || 'user';
      
      // Call backend logout endpoint if token exists
      if (token && userType) {
        console.log(`📡 Calling backend logout for ${userType}...`);
        await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/${userType}/logout`,
          {
            headers: {
              token: token,
            },
          }
        );
        console.log('✅ Backend logout successful');
      }
    } catch (error) {
      console.warn('⚠️ Backend logout failed (continuing with local logout):', error.message);
      // Continue with local logout even if backend call fails
    }
    
    // Clear all user-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userData'); // This is the correct key used by the app
    localStorage.removeItem('user');
    localStorage.removeItem('captain');
    localStorage.removeItem('rideDetails');
    localStorage.removeItem('panelDetails');
    localStorage.removeItem('messages');
    localStorage.removeItem('showPanel');
    localStorage.removeItem('showBtn');
    
    // Clear any other app-specific data
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    
    console.log('✅ User data cleared from localStorage');
    
    // Navigate to home/login page
    navigate('/');
    setSidebarOpen(false);
    
    // Force page reload to ensure all state is cleared
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, [navigate]);

  return {
    sidebarOpen,
    currentPath: location.pathname,
    openSidebar,
    closeSidebar,
    toggleSidebar,
    navigateTo,
    handleLogout
  };
};

export default useNavigation;