import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Clock,
  Car,
  MapPin,
  CreditCard,
  AlertTriangle,
  Info,
  Trash2,
  Filter,
  MoreVertical
} from "lucide-react";
import { Card, Button } from "../components/ui";
import { formatCurrency } from "../utils/currency";

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'ride_update',
      title: 'Ride Completed',
      message: 'Your ride from Colombo to Kandy has been completed successfully.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      icon: Car,
      color: 'green',
      actionable: true,
      rideId: 'ride_001'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Processed',
      message: 'Payment of Rs. 450 has been successfully processed for your recent ride.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      read: false,
      icon: CreditCard,
      color: 'blue',
      actionable: false,
      amount: 450
    },
    {
      id: 3,
      type: 'ride_update',
      title: 'Driver Assigned',
      message: 'Captain John has been assigned to your ride. ETA: 5 minutes.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: true,
      icon: MapPin,
      color: 'orange',
      actionable: true,
      captainName: 'John'
    },
    {
      id: 4,
      type: 'system',
      title: 'Welcome to QuickRide!',
      message: 'Thank you for joining QuickRide. Complete your profile to get better ride matches.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      icon: Info,
      color: 'purple',
      actionable: true
    },
    {
      id: 5,
      type: 'promotion',
      title: 'Special Offer',
      message: 'Get 20% off on your next 3 rides! Use code SAVE20.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      icon: AlertTriangle,
      color: 'yellow',
      actionable: false,
      promoCode: 'SAVE20'
    }
  ]);

  const [filter, setFilter] = useState('all'); // all, unread, read
  const [loading, setLoading] = useState(false);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  // Get notification color classes
  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      orange: 'bg-orange-100 text-orange-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      red: 'bg-red-100 text-red-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 pb-4">
          <div className="flex gap-2">
            {['all', 'unread', 'read'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                {filterType === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <BellOff className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'read' ? 'No read notifications' : 'No notifications'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? "You're all caught up! We'll notify you when there's something new."
                : filter === 'read'
                ? "No read notifications to show."
                : "We'll notify you about ride updates, payments, and important information."}
            </p>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Clear All Button */}
        {notifications.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={clearAllNotifications}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear all notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Notification Card Component
const NotificationCard = ({ notification, onMarkAsRead, onDelete }) => {
  const Icon = notification.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${
        !notification.read ? 'border-l-4 border-l-orange-500 bg-orange-50/30' : ''
      }`}>
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            getColorClasses(notification.color)
          }`}>
            <Icon className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                  {notification.title}
                </h3>
                <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}>
                  {notification.message}
                </p>
                
                {/* Additional info based on type */}
                {notification.amount && (
                  <p className="text-sm font-medium text-green-600 mt-2">
                    Amount: {formatCurrency(notification.amount)}
                  </p>
                )}
                {notification.promoCode && (
                  <p className="text-sm font-medium text-orange-600 mt-2">
                    Code: {notification.promoCode}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {formatTimestamp(notification.timestamp)}
                </span>
                
                {!notification.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}
                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action buttons for actionable notifications */}
            {notification.actionable && (
              <div className="mt-3 flex gap-2">
                {notification.type === 'ride_update' && notification.rideId && (
                  <button className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full hover:bg-orange-200 transition-colors">
                    View Ride
                  </button>
                )}
                {notification.type === 'system' && (
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors">
                    Complete Profile
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Helper function for color classes
const getColorClasses = (color) => {
  const colors = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600'
  };
  return colors[color] || colors.blue;
};

// Format timestamp helper
const formatTimestamp = (timestamp) => {
  const now = new Date();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return timestamp.toLocaleDateString();
};

export default Notifications;