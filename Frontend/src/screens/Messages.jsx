import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageSquare,
  Search,
  Phone,
  Video,
  MoreVertical,
  Clock,
  Check,
  CheckCheck
} from "lucide-react";
import { Card, Button, Input } from "../components/ui";
import Avatar from "../components/layout/Avatar";

function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Determine user type from current path
  const userType = location.pathname.includes('/captain/') ? 'captain' : 'user';
  const [conversations, setConversations] = useState([
    {
      id: "ride_001",
      type: "ride",
      participant: {
        name: "Captain John",
        avatar: null,
        phone: "+94 77 123 4567"
      },
      lastMessage: {
        text: "I'm arriving at your pickup location in 2 minutes",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        sender: "other",
        read: false
      },
      rideDetails: {
        pickup: "Colombo Fort",
        destination: "Kandy",
        status: "active"
      }
    },
    {
      id: "ride_002",
      type: "ride",
      participant: {
        name: "Captain Sarah",
        avatar: null,
        phone: "+94 77 987 6543"
      },
      lastMessage: {
        text: "Thank you for choosing our service!",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        sender: "other",
        read: true
      },
      rideDetails: {
        pickup: "Galle Face",
        destination: "Airport",
        status: "completed"
      }
    },
    {
      id: "ride_003",
      type: "ride",
      participant: {
        name: "Captain Mike",
        avatar: null,
        phone: "+94 77 555 1234"
      },
      lastMessage: {
        text: "Ride completed successfully. Have a great day!",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        sender: "other",
        read: true
      },
      rideDetails: {
        pickup: "Nugegoda",
        destination: "Colombo",
        status: "completed"
      }
    }
  ]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation =>
    conversation.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.rideDetails.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.rideDetails.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-500">
                {conversations.filter(c => !c.lastMessage.read).length} unread conversations
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Empty State */}
        {filteredConversations.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <MessageSquare className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Your ride conversations will appear here'}
            </p>
          </div>
        )}

        {/* Conversations List */}
        <div className="space-y-3">
          {filteredConversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  !conversation.lastMessage.read ? 'border-l-4 border-l-orange-500 bg-orange-50/30' : ''
                }`}
                onClick={() => navigate(`/${userType}/chat/${conversation.id}`)}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar 
                      src={conversation.participant.avatar}
                      name={conversation.participant.name}
                      size="md"
                    />
                    {conversation.rideDetails.status === 'active' && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className={`font-medium ${!conversation.lastMessage.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {conversation.participant.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {conversation.rideDetails.pickup} → {conversation.rideDetails.destination}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(conversation.lastMessage.timestamp)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(conversation.rideDetails.status)}`}>
                          {conversation.rideDetails.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${!conversation.lastMessage.read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                        {conversation.lastMessage.text}
                      </p>
                      <div className="flex items-center gap-1">
                        {conversation.lastMessage.sender === 'self' && (
                          conversation.lastMessage.read ? 
                            <CheckCheck className="w-4 h-4 text-blue-500" /> :
                            <Check className="w-4 h-4 text-gray-400" />
                        )}
                        {!conversation.lastMessage.read && conversation.lastMessage.sender === 'other' && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `tel:${conversation.participant.phone}`;
                      }}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      title="Call"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle more options
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                      title="More options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Messages;