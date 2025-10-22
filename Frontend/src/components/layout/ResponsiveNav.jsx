import React from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Header from './Header';

const ResponsiveNav = ({ 
  user, 
  userType = 'user',
  showHeader = true,
  showBottomNav = true,
  headerTitle = 'QuickRide',
  className = '',
  children,
  ...props 
}) => {
  const { 
    sidebarOpen, 
    currentPath, 
    openSidebar, 
    closeSidebar, 
    navigateTo, 
    handleLogout 
  } = useNavigation();

  return (
    <div className={`relative w-full h-screen ${className}`} {...props}>
      {/* Modern Sidebar - Hidden on mobile, shown on larger screens when open */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        user={user}
        userType={userType}
        onNavigate={navigateTo}
        currentPath={currentPath}
        onLogout={handleLogout}
      />
      
      {/* Header - Always visible on top */}
      {showHeader && (
        <div className="absolute top-0 left-0 right-0 z-30">
          <Header 
            title={headerTitle}
            user={user}
            onMenuClick={openSidebar}
            showNotifications={true}
          />
        </div>
      )}
      
      {/* Main Content */}
      <div className={`
        relative w-full h-full
        ${showHeader ? 'pt-16' : ''}
        ${showBottomNav ? 'pb-20 sm:pb-0' : ''}
      `}>
        {children}
      </div>
      
      {/* Bottom Navigation - Only visible on mobile */}
      {showBottomNav && (
        <div className="sm:hidden">
          <BottomNav 
            userType={userType}
            currentPath={currentPath}
            onNavigate={navigateTo}
          />
        </div>
      )}
    </div>
  );
};

export default ResponsiveNav;