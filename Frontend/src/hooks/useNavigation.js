import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
    navigate(path);
    setSidebarOpen(false);
  }, [navigate]);

  const handleLogout = useCallback(() => {
    // Clear user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('captain');
    localStorage.removeItem('rideDetails');
    localStorage.removeItem('panelDetails');
    localStorage.removeItem('messages');
    
    // Navigate to home
    navigate('/');
    setSidebarOpen(false);
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