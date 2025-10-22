import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';

const MessageBubble = ({ 
  message, 
  isOwn = false, 
  timestamp, 
  status = 'sent', // 'sending', 'sent', 'delivered', 'read'
  showAvatar = false,
  avatar,
  userName
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3" />;
      case 'sent':
        return <Check className="w-3 h-3" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-end space-x-2 mb-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar for other user */}
      {!isOwn && showAvatar && (
        <div className="flex-shrink-0 mb-1">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt={userName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-xs font-medium text-gray-600">
                {userName?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            relative px-4 py-3 rounded-2xl shadow-sm message-bubble message-enter
            ${isOwn 
              ? 'bg-orange-500 text-white rounded-br-md' 
              : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
            }
          `}
        >
          <p className="text-sm leading-relaxed break-words">{message}</p>
          
          {/* Message tail */}
          <div
            className={`
              absolute bottom-0 w-3 h-3
              ${isOwn 
                ? 'right-0 bg-orange-500 transform rotate-45 translate-x-1/2 translate-y-1/2' 
                : 'left-0 bg-white border-l border-b border-gray-100 transform rotate-45 -translate-x-1/2 translate-y-1/2'
              }
            `}
          />
        </div>

        {/* Timestamp and Status */}
        <div className={`flex items-center space-x-1 mt-1 px-1 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <span className="text-xs text-gray-500">{timestamp}</span>
          {isOwn && (
            <div className="text-gray-400">
              {getStatusIcon()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;