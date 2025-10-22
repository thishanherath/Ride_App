import React from 'react';

const TypingIndicator = ({ isVisible = false, userName = 'Someone' }) => {
  if (!isVisible) return null;

  return (
    <div className="flex items-center space-x-2 px-4 py-2 mb-2">
      <div className="flex items-center space-x-1 bg-gray-100 rounded-2xl px-4 py-3">
        <span className="text-sm text-gray-600">{userName} is typing</span>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;