import axios from "axios";
import { ArrowLeft, Send, MoreVertical, Phone, Video } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SocketDataContext } from "../contexts/SocketContext";
import Console from "../utils/console";
import Loading from "./Loading";
import Avatar from "../components/layout/Avatar";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

// Import the new chat components
import { ChatHeader, MessageBubble, MessageInput, TypingIndicator } from "../components/chat";

function ChatScreen() {
  const { rideId, userType } = useParams();
  const navigation = useNavigate();
  const scrollableDivRef = useRef(null);

  const { socket } = useContext(SocketDataContext);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [socketID, setSocketID] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("userData"))?.data?._id || null;

  const scrollToBottom = () => {
    if (scrollableDivRef.current) {
      scrollableDivRef.current.scrollTop = scrollableDivRef.current.scrollHeight;
    }
  };

  const getUserDetails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/ride/chat-details/${rideId}`
      );

      //  Protecting unauthorised users to read the chats
      if (currentUser !== response.data.user._id && currentUser !== response.data.captain._id) {
        Console.log("You are not authorized to view this chat.");
        navigation(-1);
        return;
      }
      setMessages(response.data.messages);

      socket.emit("join-room", rideId);
      if (userType == "user") {
        setUserData(response.data.captain);
      }
      if (userType == "captain") {
        setUserData(response.data.user);
      }
      const socketIds = {
        user: response.data.user.socketId,
        captain: response.data.captain.socketId,
      };
      setSocketID(socketIds);
    } catch (error) {
      Console.log("No such ride exists.");
    }
  };

  const sendMessage = (messageText) => {
    if (!messageText.trim()) {
      return;
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    socket.emit("message", { rideId: rideId, msg: messageText, userType: userType, time });
    setMessages((prev) => [...prev, { msg: messageText, by: userType, time, status: 'sent' }]);

    setMessage("");
    setIsTyping(false);
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { rideId, userType });
    }
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      socket.emit("stopTyping", { rideId, userType });
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (userData) {
      scrollToBottom();
    }
  }, [userData]);

  useEffect(() => {
    setTimeout(() => {
      getUserDetails();
    }, 3000);

    socket.on("receiveMessage", ({ msg, by, time }) => {
      setMessages((prev) => [...prev, { msg, by, time, status: 'delivered' }]);
    });

    socket.on("userTyping", ({ userType: typingUserType }) => {
      if (typingUserType !== userType) {
        setOtherUserTyping(true);
      }
    });

    socket.on("userStoppedTyping", ({ userType: typingUserType }) => {
      if (typingUserType !== userType) {
        setOtherUserTyping(false);
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
    };
  }, []);

  if (userData) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Modern Chat Header */}
        <ChatHeader
          onBack={() => navigation(-1)}
          user={userData}
          isOnline={false} // You can implement online status logic here
          lastSeen="2 min ago" // You can implement last seen logic here
          onCall={() => console.log('Call initiated')}
          onVideoCall={() => console.log('Video call initiated')}
          onMore={() => console.log('More options')}
        />

        {/* Messages Container */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-6 space-y-1 chat-messages"
          ref={scrollableDivRef}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          {/* Messages */}
          {messages.length > 0 ? (
            messages.map((msg, index) => {
              const isOwn = msg.by === userType;
              const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.by !== msg.by);
              
              return (
                <MessageBubble
                  key={index}
                  message={msg.msg}
                  isOwn={isOwn}
                  timestamp={msg.time}
                  status={msg.status || 'sent'}
                  showAvatar={showAvatar}
                  avatar={userData?.avatar}
                  userName={userData?.fullname ? `${userData.fullname.firstname} ${userData.fullname.lastname}` : 'User'}
                />
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start the conversation</h3>
              <p className="text-gray-500 max-w-sm">
                Send a message to start chatting with {userData?.fullname ? `${userData.fullname.firstname}` : 'the user'}.
              </p>
            </div>
          )}

          {/* Typing Indicator */}
          <TypingIndicator
            isVisible={otherUserTyping}
            userName={userData?.fullname ? userData.fullname.firstname : 'User'}
          />
        </div>

        {/* Modern Message Input */}
        <MessageInput
          value={message}
          onChange={setMessage}
          onSend={sendMessage}
          placeholder="Type a message..."
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
        />
      </div>
    );
  } else {
    return <Loading />;
  }


}

export default ChatScreen;
