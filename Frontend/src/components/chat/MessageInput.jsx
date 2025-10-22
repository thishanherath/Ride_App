import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import Button from '../ui/Button';

const MessageInput = ({ 
  value, 
  onChange, 
  onSend, 
  placeholder = "Type a message...",
  disabled = false,
  onTyping,
  onStopTyping
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend(value.trim());
      if (onStopTyping) onStopTyping();
    }
  };

  const handleInputChange = (e) => {
    onChange(e.target.value);
    
    // Handle typing indicators
    if (onTyping && e.target.value.trim()) {
      onTyping();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        if (onStopTyping) onStopTyping();
      }, 1000);
    } else if (onStopTyping && !e.target.value.trim()) {
      onStopTyping();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white border-t border-gray-100 px-4 py-3 chat-input">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* Attachment Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full flex-shrink-0"
          icon={<Paperclip className="w-5 h-5" />}
        />

        {/* Message Input Container */}
        <div className="flex-1 relative">
          <div
            className={`
              flex items-end bg-gray-50 rounded-2xl border-2 transition-all duration-200 message-input-container
              ${isFocused ? 'border-orange-500 bg-white shadow-sm' : 'border-transparent'}
            `}
          >
            <textarea
              ref={inputRef}
              value={value}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="
                flex-1 bg-transparent border-0 outline-none resize-none
                px-4 py-3 text-base placeholder-gray-400
                max-h-32 min-h-[48px]
              "
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            />
            
            {/* Emoji Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full mr-2 flex-shrink-0"
              icon={<Smile className="w-5 h-5" />}
            />
          </div>
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!value.trim() || disabled}
          className="p-3 rounded-full flex-shrink-0 shadow-md hover:shadow-lg transition-all duration-200"
          icon={<Send className="w-5 h-5" />}
        />
      </form>
    </div>
  );
};

export default MessageInput;