import { useEffect, useState } from 'react';
import { 
  HomeIcon, 
  UserIcon, 
  ClockIcon, 
  MessageSquareIcon, 
  SettingsIcon, 
  LogOutIcon,
  XIcon,
  CarIcon,
  MapPinIcon,
  TrendingUpIcon,
  CreditCardIcon,
  BellIcon,
  HelpCircleIcon,
  ShieldIcon,
  StarIcon,
  WalletIcon,
  PhoneIcon,
  InfoIcon
} from 'lucide-react';
import Avatar from './Avatar';

const Sidebar = ({ 
  isOpen = false, 
  onClose,
  user = null,
  userType = 'user', // 'user' or 'captain'
  onNavigate,
  currentPath = '',
  className = '',
  onLogout,
  ...props 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Touch gesture support for mobile
  useEffect(() => {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const handleTouchStart = (e) => {
      if (!isOpen) return;
      startX = e.touches[0].clientX;
      isDragging = true;
    };

    const handleTouchMove = (e) => {
      if (!isDragging || !isOpen) return;
      currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;
      
      // Only allow swipe left to close
      if (deltaX < -50) {
        onClose?.();
        isDragging = false;
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    if (isOpen) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, onClose]);

  const userMenuItems = [
    { 
      icon: HomeIcon, 
      label: 'Home', 
      path: '/home',
      description: 'Book your next ride',
      badge: null
    },
    { 
      icon: ClockIcon, 
      label: 'Ride History', 
      path: '/user/rides',
      description: 'View past trips',
      badge: null
    },
    { 
      icon: MessageSquareIcon, 
      label: 'Messages', 
      path: '/user/chat',
      description: 'Chat with drivers',
      badge: '2'
    },
    { 
      icon: UserIcon, 
      label: 'Profile', 
      path: '/user/edit-profile',
      description: 'Manage your account',
      badge: null
    },
  ];

  const captainMenuItems = [
    { 
      icon: HomeIcon, 
      label: 'Dashboard', 
      path: '/captain/home',
      description: 'Overview & new rides',
      badge: null
    },
    { 
      icon: CarIcon, 
      label: 'My Rides', 
      path: '/captain/rides',
      description: 'Active & completed trips',
      badge: null
    },
    { 
      icon: TrendingUpIcon, 
      label: 'Earnings', 
      path: '/captain/earnings',
      description: 'Income & analytics',
      badge: null
    },
    { 
      icon: MessageSquareIcon, 
      label: 'Messages', 
      path: '/captain/chat',
      description: 'Chat with passengers',
      badge: '1'
    },
    { 
      icon: UserIcon, 
      label: 'Profile', 
      path: '/captain/edit-profile',
      description: 'Manage your account',
      badge: null
    },
  ];

  const settingsMenuItems = [
    { 
      icon: WalletIcon, 
      label: 'Payment Methods', 
      path: userType === 'captain' ? '/captain/payment' : '/user/payment',
      description: 'Cards & wallets',
      badge: null
    },
    { 
      icon: BellIcon, 
      label: 'Notifications', 
      path: userType === 'captain' ? '/captain/notifications' : '/user/notifications',
      description: 'Manage alerts',
      badge: null
    },
    { 
      icon: StarIcon, 
      label: 'Rate & Review', 
      path: '/rate-app',
      description: 'Share feedback',
      badge: null
    },
    { 
      icon: PhoneIcon, 
      label: 'Contact Support', 
      path: '/support',
      description: 'Get help',
      badge: null
    },
    { 
      icon: InfoIcon, 
      label: 'About', 
      path: '/about',
      description: 'App info & terms',
      badge: null
    },
    { 
      icon: SettingsIcon, 
      label: 'Settings', 
      path: userType === 'captain' ? '/captain/settings' : '/user/settings',
      description: 'App preferences',
      badge: null
    },
  ];

  const mainMenuItems = userType === 'captain' ? captainMenuItems : userMenuItems;

  const handleItemClick = (path) => {
    setIsAnimating(true);
    setTimeout(() => {
      onNavigate?.(path);
      onClose?.();
      setIsAnimating(false);
    }, 150);
  };

  const handleLogout = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onLogout?.();
      onClose?.();
      setIsAnimating(false);
    }, 150);
  };

  // Handle sidebar open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-sm z-40 
          transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div 
        className={`
          fixed top-0 left-0 h-full bg-white shadow-2xl z-50
          transform transition-all duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
          w-80 sm:w-80 md:w-80 lg:w-80
          max-w-[85vw] sm:max-w-none
          ${className}
        `}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
        {...props}
      >
        {/* Modern Header with Enhanced Gradient */}
        <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-6 text-white overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4">
              {user && (
                <div className="relative group">
                  <Avatar 
                    src={user.avatar} 
                    name={user.name}
                    size="lg"
                    className="ring-3 ring-white/30 shadow-lg transition-all duration-200 group-hover:ring-white/50"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse" />
                </div>
              )}
              <div>
                <h2 className="font-semibold text-lg text-white mb-1">
                  {user?.name || 'Guest User'}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-orange-100 capitalize">
                    {userType === 'captain' ? '🚗 Captain' : '👤 Rider'}
                  </span>
                  {userType === 'captain' && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-100 rounded-full text-xs font-medium border border-green-400/30">
                      Online
                    </span>
                  )}
                </div>
                {user?.rating && (
                  <div className="flex items-center mt-1">
                    <StarIcon className="w-3 h-3 text-yellow-300 mr-1" />
                    <span className="text-xs text-orange-100">{user.rating}</span>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2.5 rounded-full hover:bg-white/20 active:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 group"
              aria-label="Close sidebar"
            >
              <XIcon className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
          
          {/* Enhanced Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-20 translate-x-20 blur-sm" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-16 -translate-x-16 blur-sm" />
          <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-1000" />
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="px-4 py-6">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                Main Menu
              </h3>
              <ul className="space-y-1">
                {mainMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;
                  
                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => handleItemClick(item.path)}
                        disabled={isAnimating}
                        className={`
                          group w-full flex items-center px-3 py-3 rounded-2xl
                          transition-all duration-200 text-left relative overflow-hidden
                          ${isActive 
                            ? 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 shadow-md scale-[0.98]' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:scale-[0.99]'
                          }
                          ${isAnimating ? 'pointer-events-none' : ''}
                          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                          active:scale-95
                        `}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-r-full shadow-sm" />
                        )}
                        
                        <div className={`
                          flex items-center justify-center w-10 h-10 rounded-xl mr-3
                          transition-all duration-200 relative
                          ${isActive 
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg' 
                            : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
                          }
                        `}>
                          <Icon className="w-5 h-5 relative z-10" />
                          {isActive && (
                            <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`font-medium text-sm ${isActive ? 'text-orange-700' : 'text-gray-900'}`}>
                              {item.label}
                            </p>
                            {item.badge && (
                              <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium min-w-[18px] text-center">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs mt-0.5 ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
                            {item.description}
                          </p>
                        </div>
                        
                        {/* Enhanced hover effect */}
                        <div className={`
                          absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5 rounded-2xl
                          opacity-0 group-hover:opacity-100 transition-all duration-200
                          ${isActive ? 'hidden' : ''}
                        `} />
                        
                        {/* Ripple effect */}
                        <div className="absolute inset-0 rounded-2xl overflow-hidden">
                          <div className={`
                            absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                            transform -translate-x-full group-hover:translate-x-full
                            transition-transform duration-700 ease-out
                            ${isActive ? 'hidden' : ''}
                          `} />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Settings Section */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                Settings & Support
              </h3>
              <ul className="space-y-1">
                {settingsMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;
                  
                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => handleItemClick(item.path)}
                        disabled={isAnimating}
                        className={`
                          group w-full flex items-center px-3 py-2.5 rounded-xl
                          transition-all duration-200 text-left relative overflow-hidden
                          ${isActive 
                            ? 'bg-gray-100 text-gray-900 scale-[0.98]' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:scale-[0.99]'
                          }
                          ${isAnimating ? 'pointer-events-none' : ''}
                          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                          active:scale-95
                        `}
                      >
                        <div className={`
                          flex items-center justify-center w-8 h-8 rounded-lg mr-3
                          transition-all duration-200
                          ${isActive 
                            ? 'bg-gray-200 text-gray-700' 
                            : 'text-gray-500 group-hover:text-gray-700'
                          }
                        `}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{item.label}</p>
                            {item.badge && (
                              <span className="ml-2 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full font-medium min-w-[18px] text-center">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                        </div>
                        
                        {/* Subtle hover effect */}
                        <div className={`
                          absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-600/5 rounded-xl
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200
                          ${isActive ? 'hidden' : ''}
                        `} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        </div>

        {/* Enhanced Modern Footer */}
        <div className="border-t border-gray-100 p-4 bg-gray-50/50">
          <button
            onClick={handleLogout}
            disabled={isAnimating}
            className={`
              group w-full flex items-center px-3 py-3 rounded-2xl text-red-600 
              hover:bg-red-50 active:bg-red-100 transition-all duration-200 
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
              hover:scale-[0.99] active:scale-95 relative overflow-hidden
              ${isAnimating ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 text-red-600 mr-3 group-hover:bg-red-200 group-active:bg-red-300 transition-all duration-200 relative">
              <LogOutIcon className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-sm">Sign Out</p>
              <p className="text-xs text-red-500 mt-0.5">Logout from your account</p>
            </div>
            
            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
          
          {/* Enhanced App version with stats */}
          <div className="mt-4 space-y-2">
            <div className="px-3 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">QuickRide</p>
                <span className="text-xs text-gray-400">v2.1.0</span>
              </div>
              {userType === 'captain' && (
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Status</p>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
                    <span className="text-xs text-green-600 font-medium">Online</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;