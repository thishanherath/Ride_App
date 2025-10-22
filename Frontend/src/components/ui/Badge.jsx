import React from 'react';

const Badge = ({ 
  children,
  variant = 'default',
  size = 'md',
  color = 'gray',
  className = '',
  icon,
  dot = false,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors';
  
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-sm',
    xl: 'px-5 py-2 text-base'
  };

  const variantClasses = {
    default: {
      gray: 'bg-gray-100 text-gray-800',
      primary: 'bg-orange-100 text-orange-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800'
    },
    solid: {
      gray: 'bg-gray-500 text-white',
      primary: 'bg-orange-500 text-white',
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-white',
      error: 'bg-red-500 text-white',
      info: 'bg-blue-500 text-white'
    },
    outline: {
      gray: 'border border-gray-300 text-gray-700 bg-transparent',
      primary: 'border border-orange-300 text-orange-700 bg-transparent',
      success: 'border border-green-300 text-green-700 bg-transparent',
      warning: 'border border-yellow-300 text-yellow-700 bg-transparent',
      error: 'border border-red-300 text-red-700 bg-transparent',
      info: 'border border-blue-300 text-blue-700 bg-transparent'
    },
    dot: {
      gray: 'bg-gray-50 text-gray-600 border border-gray-200',
      primary: 'bg-orange-50 text-orange-600 border border-orange-200',
      success: 'bg-green-50 text-green-600 border border-green-200',
      warning: 'bg-yellow-50 text-yellow-600 border border-yellow-200',
      error: 'bg-red-50 text-red-600 border border-red-200',
      info: 'bg-blue-50 text-blue-600 border border-blue-200'
    }
  };

  const dotColors = {
    gray: 'bg-gray-400',
    primary: 'bg-orange-400',
    success: 'bg-green-400',
    warning: 'bg-yellow-400',
    error: 'bg-red-400',
    info: 'bg-blue-400'
  };

  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant][color]}
    ${className}
  `;

  return (
    <span className={classes} {...props}>
      {dot && (
        <span className={`w-2 h-2 rounded-full mr-2 ${dotColors[color]}`} />
      )}
      {icon && (
        <span className="mr-1">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
};

// Predefined badge components for common use cases
export const StatusBadge = ({ status, className = '' }) => {
  const statusConfig = {
    active: { color: 'success', text: 'Active', dot: true },
    inactive: { color: 'gray', text: 'Inactive', dot: true },
    pending: { color: 'warning', text: 'Pending', dot: true },
    completed: { color: 'success', text: 'Completed', dot: true },
    cancelled: { color: 'error', text: 'Cancelled', dot: true },
    confirmed: { color: 'success', text: 'Confirmed', dot: true },
    'in-progress': { color: 'primary', text: 'In Progress', dot: true },
    waiting: { color: 'warning', text: 'Waiting', dot: true },
    arrived: { color: 'info', text: 'Arrived', dot: true },
    'on-the-way': { color: 'primary', text: 'On the way', dot: true }
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <Badge
      variant="dot"
      color={config.color}
      dot={config.dot}
      className={className}
    >
      {config.text}
    </Badge>
  );
};

export const RideBadge = ({ rideStatus, className = '' }) => {
  const rideStatusConfig = {
    'ride-requested': { color: 'warning', text: 'Requested', variant: 'default' },
    'driver-assigned': { color: 'info', text: 'Driver Assigned', variant: 'default' },
    'driver-arriving': { color: 'primary', text: 'Driver Arriving', variant: 'default' },
    'driver-arrived': { color: 'success', text: 'Driver Arrived', variant: 'solid' },
    'ride-started': { color: 'primary', text: 'Ride Started', variant: 'solid' },
    'ride-completed': { color: 'success', text: 'Completed', variant: 'default' },
    'ride-cancelled': { color: 'error', text: 'Cancelled', variant: 'default' }
  };

  const config = rideStatusConfig[rideStatus] || { color: 'gray', text: 'Unknown', variant: 'default' };

  return (
    <Badge
      variant={config.variant}
      color={config.color}
      className={className}
    >
      {config.text}
    </Badge>
  );
};

export const PriorityBadge = ({ priority, className = '' }) => {
  const priorityConfig = {
    low: { color: 'success', text: 'Low', variant: 'outline' },
    medium: { color: 'warning', text: 'Medium', variant: 'outline' },
    high: { color: 'error', text: 'High', variant: 'solid' },
    urgent: { color: 'error', text: 'Urgent', variant: 'solid' }
  };

  const config = priorityConfig[priority] || priorityConfig.low;

  return (
    <Badge
      variant={config.variant}
      color={config.color}
      className={className}
    >
      {config.text}
    </Badge>
  );
};

export const VehicleTypeBadge = ({ vehicleType, className = '' }) => {
  const vehicleConfig = {
    auto: { color: 'primary', text: 'Auto', icon: '🛺' },
    bike: { color: 'info', text: 'Bike', icon: '🏍️' },
    car: { color: 'success', text: 'Car', icon: '🚗' },
    suv: { color: 'warning', text: 'SUV', icon: '🚙' }
  };

  const config = vehicleConfig[vehicleType] || { color: 'gray', text: vehicleType, icon: '🚗' };

  return (
    <Badge
      variant="default"
      color={config.color}
      className={className}
    >
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </Badge>
  );
};

export const RatingBadge = ({ rating, className = '' }) => {
  const getColor = (rating) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 4.0) return 'primary';
    if (rating >= 3.5) return 'warning';
    return 'error';
  };

  return (
    <Badge
      variant="default"
      color={getColor(rating)}
      className={className}
      icon={
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      }
    >
      {rating.toFixed(1)}
    </Badge>
  );
};

export const NotificationBadge = ({ count, className = '' }) => {
  if (!count || count === 0) return null;

  return (
    <Badge
      variant="solid"
      color="error"
      size="xs"
      className={`absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center ${className}`}
    >
      {count > 99 ? '99+' : count}
    </Badge>
  );
};

export default Badge;