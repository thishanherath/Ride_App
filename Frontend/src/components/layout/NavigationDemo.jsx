import React, { useState } from 'react';
import { 
  HomeIcon, 
  UserIcon, 
  ClockIcon, 
  MessageSquareIcon, 
  SettingsIcon,
  CarIcon,
  TrendingUpIcon,
  StarIcon
} from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import ResponsiveNav from './ResponsiveNav';
import { Button, Card } from '../ui';

const NavigationDemo = () => {
  const [currentDemo, setCurrentDemo] = useState('sidebar');
  const [userType, setUserType] = useState('user');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock user data
  const mockUser = {
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    phone: '+1 (555) 123-4567'
  };

  const mockCaptain = {
    fullname: {
      firstname: 'Sarah',
      lastname: 'Wilson'
    },
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    phone: '+1 (555) 987-6543'
  };

  const currentUser = userType === 'captain' ? mockCaptain : mockUser;

  const handleNavigate = (path) => {
    console.log('Navigate to:', path);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Modern Navigation System
          </h1>
          <p className="text-gray-600 mb-6">
            Showcasing the enhanced sidebar, header, and responsive navigation components
            with modern design, smooth animations, and improved user experience.
          </p>

          {/* Demo Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex gap-2">
              <Button
                variant={currentDemo === 'sidebar' ? 'primary' : 'secondary'}
                onClick={() => setCurrentDemo('sidebar')}
                size="sm"
              >
                Sidebar Demo
              </Button>
              <Button
                variant={currentDemo === 'responsive' ? 'primary' : 'secondary'}
                onClick={() => setCurrentDemo('responsive')}
                size="sm"
              >
                Responsive Nav
              </Button>
              <Button
                variant={currentDemo === 'components' ? 'primary' : 'secondary'}
                onClick={() => setCurrentDemo('components')}
                size="sm"
              >
                Individual Components
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={userType === 'user' ? 'primary' : 'outline'}
                onClick={() => setUserType('user')}
                size="sm"
              >
                User View
              </Button>
              <Button
                variant={userType === 'captain' ? 'primary' : 'outline'}
                onClick={() => setUserType('captain')}
                size="sm"
              >
                Captain View
              </Button>
            </div>
          </div>
        </div>

        {/* Demo Content */}
        {currentDemo === 'sidebar' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Enhanced Sidebar Features</h2>
              <ul className="space-y-3 text-sm text-gray-600 mb-6">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Modern gradient header with user status
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Smooth slide animations and micro-interactions
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Enhanced hover effects and active states
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Notification badges and status indicators
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Responsive design for all screen sizes
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Touch gesture support for mobile
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Modern logout and settings section
                </li>
              </ul>
              
              <Button 
                onClick={() => setSidebarOpen(true)}
                className="w-full"
              >
                Open Sidebar Demo
              </Button>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <h2 className="text-xl font-semibold mb-4 text-orange-900">
                Navigation Improvements
              </h2>
              <div className="space-y-4 text-sm">
                <div className="bg-white/60 rounded-lg p-4">
                  <h3 className="font-medium text-orange-900 mb-2">Visual Enhancements</h3>
                  <p className="text-orange-800">
                    Enhanced gradients, shadows, and modern iconography create a premium feel
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-4">
                  <h3 className="font-medium text-orange-900 mb-2">Interaction Design</h3>
                  <p className="text-orange-800">
                    Smooth animations, ripple effects, and tactile feedback improve usability
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-4">
                  <h3 className="font-medium text-orange-900 mb-2">Responsive Layout</h3>
                  <p className="text-orange-800">
                    Adapts seamlessly across desktop, tablet, and mobile devices
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {currentDemo === 'responsive' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Responsive Navigation System</h2>
            <p className="text-gray-600 mb-6">
              The ResponsiveNav component automatically adapts the navigation based on screen size,
              showing the sidebar on larger screens and bottom navigation on mobile devices.
            </p>
            
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <h3 className="font-medium mb-2">Features:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automatic sidebar/bottom nav switching</li>
                <li>• Consistent navigation state management</li>
                <li>• Smooth transitions between layouts</li>
                <li>• Touch-friendly mobile interactions</li>
                <li>• Keyboard navigation support</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Desktop/Tablet</h4>
                <p className="text-sm text-blue-800">
                  Sidebar navigation with full menu items and descriptions
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Mobile</h4>
                <p className="text-sm text-green-800">
                  Bottom navigation with essential menu items
                </p>
              </div>
            </div>
          </Card>
        )}

        {currentDemo === 'components' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Header Component</h3>
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <Header 
                  title="QuickRide"
                  user={currentUser}
                  onMenuClick={() => console.log('Menu clicked')}
                  showNotifications={true}
                />
              </div>
              <p className="text-sm text-gray-600">
                Modern header with backdrop blur, menu button, and user avatar
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Bottom Navigation</h3>
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <BottomNav 
                  userType={userType}
                  currentPath="/home"
                  onNavigate={handleNavigate}
                />
              </div>
              <p className="text-sm text-gray-600">
                Mobile-optimized bottom navigation with active states
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Navigation Hook</h3>
              <div className="bg-gray-100 rounded-lg p-4 mb-4 text-xs font-mono">
                <div>const &#123;</div>
                <div className="ml-2">sidebarOpen,</div>
                <div className="ml-2">openSidebar,</div>
                <div className="ml-2">closeSidebar,</div>
                <div className="ml-2">navigateTo,</div>
                <div className="ml-2">handleLogout</div>
                <div>&#125; = useNavigation();</div>
              </div>
              <p className="text-sm text-gray-600">
                Custom hook for managing navigation state and actions
              </p>
            </Card>
          </div>
        )}

        {/* Sidebar Demo */}
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={currentUser}
          userType={userType}
          onNavigate={handleNavigate}
          currentPath="/home"
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
};

export default NavigationDemo;