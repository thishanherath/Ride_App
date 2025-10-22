import React from 'react';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import Avatar from '../layout/Avatar';
import Button from '../ui/Button';

const ChatHeader = ({ 
  onBack, 
  user, 
  isOnline = false, 
  lastSeen,
  onCall,
  onVideoCall,
  onMore 
}) => {
  const getStatusText = () => {
    if (isOnline) return 'Online';
    if (lastSeen) return `Last seen ${lastSeen}`;
    return 'Offline';
  };

  return (
    <div className="bg-white border-b border-gray-100 px-4 py-3 shadow-sm chat-header">
      <div className="flex items-center justify-between">
        {/* Left Section - Back button and user info */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full"
            icon={<ArrowLeft className="w-5 h-5" />}
          />
          
          <div className="flex items-center space-x-3">
            <Avatar
              src={user?.avatar}
              name={user?.fullname ? `${user.fullname.firstname} ${user.fullname.lastname}` : 'User'}
              size="md"
              showStatus={true}
              status={isOnline ? 'online' : 'offline'}
            />
            
            <div className="flex flex-col">
              <h2 className="font-semibold text-gray-900 text-base leading-tight">
                {user?.fullname ? `${user.fullname.firstname} ${user.fullname.lastname}` : 'User'}
              </h2>
              <p className={`text-sm ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                {getStatusText()}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Action buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCall}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 hover:text-gray-900"
            icon={<Phone className="w-5 h-5" />}
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onVideoCall}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 hover:text-gray-900"
            icon={<Video className="w-5 h-5" />}
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onMore}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 hover:text-gray-900"
            icon={<MoreVertical className="w-5 h-5" />}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;