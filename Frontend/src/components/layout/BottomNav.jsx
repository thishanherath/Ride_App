import React from 'react';
import { 
  HomeIcon, 
  ClockIcon, 
  MessageSquareIcon, 
  UserIcon,
  CarIcon,
  MapPinIcon
} from 'lucide-react';

const BottomNav = ({ 
  userType = 'user', // 'user' or 'captain'
  currentPath = '',
  onNavigate,
  className = '',
  ...props 
}) => {
  const userNavItems = [
    { icon: HomeIcon, label: 'Home', path: '/user/home' },
    { icon: ClockIcon, label: 'History', path: '/user/rides' },
    { icon: MessageSquareIcon, label: 'Chat', path: '/user/chat' },
    { icon: UserIcon, label: 'Profile', path: '/user/profile' },
  ];

  const captainNavItems = [
    { icon: HomeIcon, label: 'Dashboard', path: '/captain/home' },
    { icon: CarIcon, label: 'Rides', path: '/captain/rides' },
    { icon: MapPinIcon, label: 'Earnings', path: '/captain/earnings' },
    { icon: UserIcon, label: 'Profile', path: '/captain/profile' },
  ];

  const navItems = userType === 'captain' ? captainNavItems : userNavItems;

  const handleItemClick = (path) => {
    onNavigate?.(path);
  };

  return (
    <nav 
      className={`
        fixed bottom-0 left-0 right-0 z-30
        bg-white/95 backdrop-blur-sm border-t border-gray-200
        safe-area-inset-bottom
        ${className}
      `}
      {...props}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => handleItemClick(item.path)}
              className={`
                flex flex-col items-center justify-center px-3 py-2 rounded-xl
                min-w-0 flex-1 transition-all duration-200
                ${isActive 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
                focus:outline-none focus:ring-2 focus:ring-orange-500
              `}
              aria-label={item.label}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-orange-600' : 'text-gray-500'}`} />
              <span className={`text-xs font-medium truncate ${isActive ? 'text-orange-600' : 'text-gray-600'}`}>
                {item.label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
};

export default BottomNav;