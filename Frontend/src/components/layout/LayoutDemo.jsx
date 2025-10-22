import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import ResponsiveNav from './ResponsiveNav';
import NavigationDemo from './NavigationDemo';
import Container, { PageContainer, SectionContainer, FormContainer } from './Container';
import Avatar, { AvatarGroup } from './Avatar';

const LayoutDemo = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/user/home');
  const [userType, setUserType] = useState('user');

  const mockUser = {
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  };

  const mockAvatars = [
    { id: 1, name: 'Alice Johnson', src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
    { id: 2, name: 'Bob Smith', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    { id: 3, name: 'Carol Davis', src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
    { id: 4, name: 'David Wilson', src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
    { id: 5, name: 'Eva Brown', src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' }
  ];

  const handleNavigation = (path) => {
    setCurrentPath(path);
    console.log('Navigating to:', path);
  };

  const toggleUserType = () => {
    setUserType(prev => prev === 'user' ? 'captain' : 'user');
    setCurrentPath(userType === 'user' ? '/captain/home' : '/user/home');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        title="Layout Demo"
        user={mockUser}
        onMenuClick={() => setSidebarOpen(true)}
        onNotificationClick={() => console.log('Notifications clicked')}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={mockUser}
        userType={userType}
        currentPath={currentPath}
        onNavigate={handleNavigation}
      />

      {/* Main Content */}
      <PageContainer className="pb-20">
        <div className="space-y-8">
          {/* Navigation Demo */}
          <NavigationDemo />
          
          {/* User Type Toggle */}
          <div className="text-center">
            <button
              onClick={toggleUserType}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors duration-200"
            >
              Switch to {userType === 'user' ? 'Captain' : 'User'} View
            </button>
            <p className="mt-2 text-gray-600">Current: {userType}</p>
          </div>

          {/* Avatar Showcase */}
          <SectionContainer>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Avatar Components</h2>
            
            <div className="space-y-6">
              {/* Different Sizes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Sizes</h3>
                <div className="flex items-center space-x-4">
                  <Avatar src={mockUser.avatar} name={mockUser.name} size="xs" />
                  <Avatar src={mockUser.avatar} name={mockUser.name} size="sm" />
                  <Avatar src={mockUser.avatar} name={mockUser.name} size="md" />
                  <Avatar src={mockUser.avatar} name={mockUser.name} size="lg" />
                  <Avatar src={mockUser.avatar} name={mockUser.name} size="xl" />
                  <Avatar src={mockUser.avatar} name={mockUser.name} size="2xl" />
                </div>
              </div>

              {/* Fallback States */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Fallback States</h3>
                <div className="flex items-center space-x-4">
                  <Avatar name="John Doe" size="md" />
                  <Avatar name="Jane Smith" size="md" />
                  <Avatar size="md" />
                  <Avatar src="invalid-url" name="Fallback User" size="md" />
                </div>
              </div>

              {/* Status Indicators */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Status Indicators</h3>
                <div className="flex items-center space-x-4">
                  <Avatar src={mockUser.avatar} name={mockUser.name} size="md" showStatus status="online" />
                  <Avatar src={mockUser.avatar} name={mockUser.name} size="md" showStatus status="away" />
                  <Avatar src={mockUser.avatar} name={mockUser.name} size="md" showStatus status="busy" />
                  <Avatar src={mockUser.avatar} name={mockUser.name} size="md" showStatus status="offline" />
                </div>
              </div>

              {/* Shapes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Shapes</h3>
                <div className="flex items-center space-x-4">
                  <Avatar src={mockUser.avatar} name={mockUser.name} size="md" shape="circle" />
                  <Avatar src={mockUser.avatar} name={mockUser.name} size="md" shape="square" />
                </div>
              </div>

              {/* Avatar Group */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Avatar Group</h3>
                <div className="space-y-3">
                  <AvatarGroup avatars={mockAvatars.slice(0, 3)} size="md" />
                  <AvatarGroup avatars={mockAvatars} max={4} size="md" />
                  <AvatarGroup avatars={mockAvatars} max={2} size="sm" />
                </div>
              </div>
            </div>
          </SectionContainer>

          {/* Container Showcase */}
          <SectionContainer>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Container Components</h2>
            
            <div className="space-y-4">
              <Container size="sm" padding="default" center className="bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-center text-blue-800">Small Container (centered)</p>
              </Container>
              
              <Container size="default" padding="lg" className="bg-green-50 border border-green-200 rounded-lg">
                <p className="text-center text-green-800">Default Container with large padding</p>
              </Container>
              
              <FormContainer className="bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-center text-purple-800">Form Container</p>
              </FormContainer>
            </div>
          </SectionContainer>

          {/* Navigation Info */}
          <SectionContainer>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Navigation State</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-700">
                <strong>Current Path:</strong> {currentPath}
              </p>
              <p className="text-gray-700 mt-2">
                <strong>User Type:</strong> {userType}
              </p>
              <p className="text-gray-600 text-sm mt-4">
                Try opening the sidebar and navigating to different sections, or check the bottom navigation on mobile.
              </p>
            </div>
          </SectionContainer>
        </div>
      </PageContainer>

      {/* Bottom Navigation */}
      <BottomNav
        userType={userType}
        currentPath={currentPath}
        onNavigate={handleNavigation}
      />
    </div>
  );
};

export default LayoutDemo;