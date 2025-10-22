import React from 'react';

const EmptyState = ({ 
  icon,
  title,
  description,
  action,
  variant = 'default',
  className = ''
}) => {
  // Default icons for common empty states
  const defaultIcons = {
    rides: (
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0" />
      </svg>
    ),
    search: (
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    notifications: (
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5zM11.613 15.932c-.299-.932-1.431-1.932-3.613-1.932-2.182 0-3.314 1-3.613 1.932M8 7a4 4 0 118 0c0 1.526-.5 2.896-1.336 4M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4" />
      </svg>
    ),
    messages: (
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    error: (
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    location: (
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    default: (
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    )
  };

  const renderIcon = () => {
    if (icon) return icon;
    return defaultIcons[variant] || defaultIcons.default;
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}>
      <div className="mb-6">
        {renderIcon()}
      </div>
      
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-gray-500 mb-6 max-w-sm">
          {description}
        </p>
      )}
      
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

// Predefined empty state components for common scenarios
export const NoRidesEmpty = ({ onBookRide, className = '' }) => (
  <EmptyState
    variant="rides"
    title="No rides yet"
    description="Start your journey by booking your first ride with QuickRide."
    action={
      onBookRide && (
        <button
          onClick={onBookRide}
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
        >
          Book Your First Ride
        </button>
      )
    }
    className={className}
  />
);

export const NoSearchResultsEmpty = ({ searchTerm, onClearSearch, className = '' }) => (
  <EmptyState
    variant="search"
    title="No results found"
    description={searchTerm ? `No results found for "${searchTerm}". Try adjusting your search.` : "Try searching for something else."}
    action={
      onClearSearch && (
        <button
          onClick={onClearSearch}
          className="text-orange-500 font-medium hover:text-orange-600 transition-colors"
        >
          Clear Search
        </button>
      )
    }
    className={className}
  />
);

export const NoNotificationsEmpty = ({ className = '' }) => (
  <EmptyState
    variant="notifications"
    title="No notifications"
    description="You're all caught up! We'll notify you when there's something new."
    className={className}
  />
);

export const NoMessagesEmpty = ({ onStartChat, className = '' }) => (
  <EmptyState
    variant="messages"
    title="No messages yet"
    description="Start a conversation with your driver or support team."
    action={
      onStartChat && (
        <button
          onClick={onStartChat}
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
        >
          Start Conversation
        </button>
      )
    }
    className={className}
  />
);

export const ErrorEmpty = ({ 
  title = "Something went wrong", 
  description = "We're having trouble loading this content. Please try again.",
  onRetry,
  className = '' 
}) => (
  <EmptyState
    variant="error"
    title={title}
    description={description}
    action={
      onRetry && (
        <button
          onClick={onRetry}
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
        >
          Try Again
        </button>
      )
    }
    className={className}
  />
);

export const NoLocationEmpty = ({ onEnableLocation, className = '' }) => (
  <EmptyState
    variant="location"
    title="Location access needed"
    description="Enable location access to find nearby rides and get accurate pickup times."
    action={
      onEnableLocation && (
        <button
          onClick={onEnableLocation}
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
        >
          Enable Location
        </button>
      )
    }
    className={className}
  />
);

export const MaintenanceEmpty = ({ className = '' }) => (
  <EmptyState
    variant="default"
    title="Under Maintenance"
    description="We're currently updating our services. Please check back in a few minutes."
    className={className}
  />
);

export const OfflineEmpty = ({ onRetry, className = '' }) => (
  <EmptyState
    variant="error"
    title="You're offline"
    description="Check your internet connection and try again."
    action={
      onRetry && (
        <button
          onClick={onRetry}
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
        >
          Retry
        </button>
      )
    }
    className={className}
  />
);

export default EmptyState;