import React from 'react';
import { MenuIcon, BellIcon } from 'lucide-react';
import Avatar from './Avatar';

const Header = ({ 
  title = 'QuickRide',
  showMenu = true,
  showNotifications = true,
  user = null,
  onMenuClick,
  onNotificationClick,
  onProfileClick,
  className = '',
  ...props 
}) => {
  return (
    <header 
      className={`
        bg-white/90 backdrop-blur-sm border-b border-gray-200 
        sticky top-0 z-50 transition-all duration-200
        ${className}
      `}
      {...props}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          {showMenu && (
            <button 
              onClick={onMenuClick}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Open menu"
            >
              <MenuIcon className="w-5 h-5 text-gray-700" />
            </button>
          )}
          
          <button 
            onClick={() => window.location.href = '/home'}
            className="font-semibold text-gray-900 text-lg hover:text-orange-600 transition-colors duration-200 focus:outline-none focus:text-orange-600"
          >
            {title}
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {showNotifications && (
            <button 
              onClick={onNotificationClick}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 relative"
              aria-label="Notifications"
            >
              <BellIcon className="w-5 h-5 text-gray-700" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
          )}
          
          {user && (
            <button
              onClick={onProfileClick}
              className="focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full"
              aria-label="Profile"
            >
              <Avatar 
                src={user.avatar} 
                name={user.name}
                size="sm" 
                className="cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all duration-200"
              />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;