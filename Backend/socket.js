const moment = require("moment-timezone");
const { Server } = require("socket.io");
const userModel = require("./models/user.model");
const rideModel = require("./models/ride.model");
const captainModel = require("./models/captain.model");
const frontendLogModel = require("./models/frontend-log.model");
const socketConnectionManager = require("./services/socketConnectionManager");
const socketEventValidator = require("./services/socketEventValidator");

let io;

// Enhanced connection tracking
const connectedUsers = new Map(); // socketId -> { userId, userType, connectedAt }
const userSockets = new Map(); // userId -> socketId

// Socket functions object for connection manager
let socketFunctions;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    // Enhanced connection options
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id} at ${new Date().toISOString()}`);
    
    // Track connection
    connectedUsers.set(socket.id, {
      connectedAt: new Date(),
      lastActivity: new Date()
    });

    // Enhanced logging for production
    if (process.env.ENVIRONMENT == "production") {
      socket.on("log", async (log) => {
        try {
          log.formattedTimestamp = moment().tz("Asia/Kolkata").format("MMM DD hh:mm:ss A");
          log.socketId = socket.id;
          await frontendLogModel.create(log);
        } catch (error) {
          console.error("Error saving frontend log:", error.message);
          socket.emit("log-error", { message: "Failed to save log" });
        }
      });
    }

    // Enhanced join event with validation and error handling
    socket.on("join", async (data) => {
      try {
        const validation = socketEventValidator.validate('join', data);
        if (!validation.valid) {
          return socket.emit("join-error", { 
            message: validation.errors.join(', '),
            errors: validation.errors 
          });
        }

        const { userId, userType } = validation.sanitizedData;
        console.log(`${userType} joining: ${userId} with socket ${socket.id}`);

        // Check if user is already connected with different socket
        const existingSocketId = userSockets.get(userId);
        if (existingSocketId && existingSocketId !== socket.id) {
          // Disconnect old socket
          const oldSocket = io.sockets.sockets.get(existingSocketId);
          if (oldSocket) {
            oldSocket.emit("connection-replaced", { message: "New connection established" });
            oldSocket.disconnect(true);
          }
          connectedUsers.delete(existingSocketId);
        }

        // Update connection tracking
        connectedUsers.set(socket.id, {
          userId,
          userType,
          connectedAt: new Date(),
          lastActivity: new Date()
        });
        userSockets.set(userId, socket.id);

        // Update database with socket ID
        if (userType === "user") {
          await userModel.findByIdAndUpdate(userId, { 
            socketId: socket.id,
            lastOnline: new Date()
          });
        } else if (userType === "captain") {
          await captainModel.findByIdAndUpdate(userId, { 
            socketId: socket.id,
            lastOnline: new Date()
          });
        }

        // Clear any previous reconnection attempts
        socketConnectionManager.clearReconnectionAttempts(userId);

        socket.emit("join-success", { 
          message: "Successfully connected",
          socketId: socket.id,
          timestamp: new Date(),
          connectionStats: socketConnectionManager.getReconnectionStatus(userId)
        });

      } catch (error) {
        console.error("Error in join event:", error.message);
        
        // Handle reconnection logic
        const reconnectionResult = socketConnectionManager.handleReconnection(userId, userType);
        
        socket.emit("join-error", { 
          message: "Failed to join. Please try again.",
          reconnection: reconnectionResult
        });
      }
    });

    // Enhanced location update with validation
    socket.on("update-location-captain", async (data) => {
      try {
        const validation = socketEventValidator.validate('update-location-captain', data);
        if (!validation.valid) {
          return socket.emit("location-error", { 
            message: validation.errors.join(', '),
            errors: validation.errors 
          });
        }

        const { userId, location } = validation.sanitizedData;
        
        // Update last activity
        const userConnection = connectedUsers.get(socket.id);
        if (userConnection) {
          userConnection.lastActivity = new Date();
        }

        await captainModel.findByIdAndUpdate(userId, {
          location: {
            type: "Point",
            coordinates: [location.lng, location.ltd],
          },
          lastLocationUpdate: new Date()
        });

        // Find active rides for this captain and notify passengers
        const activeRides = await rideModel.find({
          captain: userId,
          status: { $in: ['accepted', 'ongoing'] }
        }).populate('user');

        // Notify passengers of captain location update
        for (const ride of activeRides) {
          if (ride.user && ride.user.socketId) {
            io.to(ride.user.socketId).emit("captain-location-update", {
              rideId: ride._id,
              captainLocation: {
                latitude: location.ltd,
                longitude: location.lng
              },
              timestamp: new Date()
            });
          }
        }

        socket.emit("location-updated", { 
          message: "Location updated successfully",
          timestamp: new Date()
        });

      } catch (error) {
        console.error("Error updating captain location:", error.message);
        socket.emit("location-error", { message: "Failed to update location" });
      }
    });

    // Enhanced room joining with validation
    socket.on("join-room", (data) => {
      try {
        const validation = socketEventValidator.validate('join-room', data);
        if (!validation.valid) {
          return socket.emit("room-error", { 
            message: validation.errors.join(', '),
            errors: validation.errors 
          });
        }

        const roomId = validation.sanitizedData;
        socket.join(roomId);
        console.log(`${socket.id} joined room: ${roomId}`);
        
        socket.emit("room-joined", { 
          roomId,
          message: "Successfully joined room",
          timestamp: new Date()
        });

      } catch (error) {
        console.error("Error joining room:", error.message);
        socket.emit("room-error", { message: "Failed to join room" });
      }
    });

    // Enhanced messaging with validation and error handling
    socket.on("message", async (data) => {
      try {
        const validation = socketEventValidator.validate('message', data);
        if (!validation.valid) {
          return socket.emit("message-error", { 
            message: validation.errors.join(', '),
            errors: validation.errors 
          });
        }

        const { rideId, msg, userType, time } = validation.sanitizedData;
        const date = moment().tz("Asia/Kolkata").format("MMM DD");
        
        // Update last activity
        const userConnection = connectedUsers.get(socket.id);
        if (userConnection) {
          userConnection.lastActivity = new Date();
        }

        // Emit to room
        socket.to(rideId).emit("receiveMessage", { 
          msg, 
          by: userType, 
          time,
          timestamp: new Date()
        });

        // Save to database
        const ride = await rideModel.findOne({ _id: rideId });
        if (!ride) {
          return socket.emit("message-error", { message: "Ride not found" });
        }

        ride.messages.push({
          msg: msg,
          by: userType,
          time: time,
          date: date,
          timestamp: new Date(),
        });
        await ride.save();

        socket.emit("message-sent", { 
          message: "Message sent successfully",
          timestamp: new Date()
        });

      } catch (error) {
        console.error("Error handling message:", error.message);
        socket.emit("message-error", { message: "Failed to send message" });
      }
    });

    // Ride status update event
    socket.on("ride-status-update", async (data) => {
      try {
        const validation = socketEventValidator.validate('ride-status-update', data);
        if (!validation.valid) {
          return socket.emit("ride-status-error", { 
            message: validation.errors.join(', '),
            errors: validation.errors 
          });
        }

        const { rideId, status, reason, updatedBy } = validation.sanitizedData;
        
        // Update last activity
        const userConnection = connectedUsers.get(socket.id);
        if (userConnection) {
          userConnection.lastActivity = new Date();
        }

        // Find and update the ride
        const ride = await rideModel.findById(rideId);
        if (!ride) {
          return socket.emit("ride-status-error", { message: "Ride not found" });
        }

        // Use the enhanced updateStatus method
        await ride.updateStatus(status, updatedBy, reason);

        // Notify all parties in the ride room
        socket.to(rideId).emit("ride-status-changed", {
          rideId,
          status,
          reason,
          updatedBy,
          timestamp: new Date()
        });

        socket.emit("ride-status-updated", {
          message: "Ride status updated successfully",
          rideId,
          status,
          timestamp: new Date()
        });

      } catch (error) {
        console.error("Error updating ride status:", error.message);
        socket.emit("ride-status-error", { message: "Failed to update ride status" });
      }
    });

    // Heartbeat mechanism
    socket.on("ping", () => {
      const userConnection = connectedUsers.get(socket.id);
      if (userConnection) {
        userConnection.lastActivity = new Date();
      }
      socket.emit("pong", { timestamp: new Date() });
    });

    // Connection health response
    socket.on("health-check-response", (data) => {
      const userConnection = connectedUsers.get(socket.id);
      if (userConnection) {
        userConnection.lastActivity = new Date();
        userConnection.lastHealthCheck = new Date();
      }
    });

    // Enhanced disconnect handling with cleanup
    socket.on("disconnect", async (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
      
      try {
        const userConnection = connectedUsers.get(socket.id);
        if (userConnection && userConnection.userId) {
          const { userId, userType } = userConnection;
          
          // Handle disconnection in connection manager
          if (reason === 'transport close' || reason === 'transport error') {
            socketConnectionManager.handleConnectionError(userId, userType, new Error(reason), socketFunctions);
          } else if (reason === 'ping timeout') {
            socketConnectionManager.handleConnectionTimeout(userId, userType, socketFunctions);
          }
          
          // Clean up user socket mapping
          userSockets.delete(userId);
          
          // Update database to remove socket ID
          if (userType === "user") {
            await userModel.findByIdAndUpdate(userId, { 
              socketId: null,
              lastOnline: new Date(),
              disconnectReason: reason
            });
          } else if (userType === "captain") {
            await captainModel.findByIdAndUpdate(userId, { 
              socketId: null,
              lastOnline: new Date(),
              disconnectReason: reason
            });
          }
        }
        
        // Clean up connection tracking
        connectedUsers.delete(socket.id);
        
      } catch (error) {
        console.error("Error during disconnect cleanup:", error.message);
      }
    });

    // Handle connection errors
    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.id}:`, error.message);
    });
  });

  // Periodic cleanup of stale connections
  setInterval(() => {
    const now = new Date();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes
    
    for (const [socketId, connection] of connectedUsers.entries()) {
      if (now - connection.lastActivity > staleThreshold) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
          console.log(`Disconnecting stale connection: ${socketId}`);
          socket.emit("connection-timeout", { message: "Connection timed out due to inactivity" });
          socket.disconnect(true);
        }
      }
    }
  }, 60000); // Check every minute

  // Initialize socket functions for connection manager
  socketFunctions = {
    sendMessageToUser,
    isUserConnected,
    getConnectionStats,
    broadcastToUserType,
    sendMessageToRoom
  };

  // Start connection manager with socket functions
  socketConnectionManager.startPeriodicCleanup(socketFunctions);
}

// Enhanced message sending with error handling and retry logic
const sendMessageToSocketId = (socketId, messageObject, retryCount = 0) => {
  if (!io) {
    console.error("Socket.io not initialized.");
    return false;
  }

  if (!socketId || !messageObject || !messageObject.event) {
    console.error("Invalid parameters for sendMessageToSocketId");
    return false;
  }

  try {
    const socket = io.sockets.sockets.get(socketId);
    if (!socket || !socket.connected) {
      console.warn(`Socket ${socketId} not found or not connected`);
      return false;
    }

    console.log(`Sending ${messageObject.event} to socket: ${socketId}`);
    socket.emit(messageObject.event, {
      ...messageObject.data,
      timestamp: new Date(),
      messageId: generateMessageId()
    });

    return true;
  } catch (error) {
    console.error(`Error sending message to ${socketId}:`, error.message);
    
    // Retry logic for critical messages
    if (retryCount < 2 && messageObject.critical) {
      console.log(`Retrying message send to ${socketId}, attempt ${retryCount + 1}`);
      setTimeout(() => {
        sendMessageToSocketId(socketId, messageObject, retryCount + 1);
      }, 1000 * (retryCount + 1));
    }
    
    return false;
  }
};

// Send message to user by userId
const sendMessageToUser = async (userId, messageObject) => {
  try {
    const socketId = userSockets.get(userId);
    if (!socketId) {
      console.warn(`No active socket found for user: ${userId}`);
      return false;
    }
    
    return sendMessageToSocketId(socketId, messageObject);
  } catch (error) {
    console.error(`Error sending message to user ${userId}:`, error.message);
    return false;
  }
};

// Broadcast message to all connected users of a specific type
const broadcastToUserType = (userType, messageObject) => {
  if (!io) {
    console.error("Socket.io not initialized.");
    return false;
  }

  try {
    let sentCount = 0;
    for (const [socketId, connection] of connectedUsers.entries()) {
      if (connection.userType === userType) {
        if (sendMessageToSocketId(socketId, messageObject)) {
          sentCount++;
        }
      }
    }
    
    console.log(`Broadcast sent to ${sentCount} ${userType}s`);
    return sentCount;
  } catch (error) {
    console.error(`Error broadcasting to ${userType}s:`, error.message);
    return 0;
  }
};

// Send message to room with enhanced error handling
const sendMessageToRoom = (roomId, messageObject) => {
  if (!io) {
    console.error("Socket.io not initialized.");
    return false;
  }

  if (!roomId || !messageObject || !messageObject.event) {
    console.error("Invalid parameters for sendMessageToRoom");
    return false;
  }

  try {
    console.log(`Sending ${messageObject.event} to room: ${roomId}`);
    io.to(roomId).emit(messageObject.event, {
      ...messageObject.data,
      timestamp: new Date(),
      messageId: generateMessageId()
    });
    
    return true;
  } catch (error) {
    console.error(`Error sending message to room ${roomId}:`, error.message);
    return false;
  }
};

// Get connection statistics
const getConnectionStats = () => {
  const stats = {
    totalConnections: connectedUsers.size,
    userConnections: 0,
    captainConnections: 0,
    activeConnections: 0
  };

  const now = new Date();
  const activeThreshold = 2 * 60 * 1000; // 2 minutes

  for (const connection of connectedUsers.values()) {
    if (connection.userType === 'user') {
      stats.userConnections++;
    } else if (connection.userType === 'captain') {
      stats.captainConnections++;
    }
    
    if (now - connection.lastActivity < activeThreshold) {
      stats.activeConnections++;
    }
  }

  return stats;
};

// Check if user is connected
const isUserConnected = (userId) => {
  const socketId = userSockets.get(userId);
  if (!socketId) return false;
  
  const socket = io?.sockets.sockets.get(socketId);
  return socket && socket.connected;
};

// Generate unique message ID
const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Graceful shutdown cleanup
const cleanup = async () => {
  console.log("Cleaning up socket connections...");
  
  try {
    // Notify all connected clients about shutdown
    for (const [socketId] of connectedUsers.entries()) {
      const socket = io?.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit("server-shutdown", { 
          message: "Server is shutting down. Please reconnect in a moment." 
        });
      }
    }

    // Clear all tracking maps
    connectedUsers.clear();
    userSockets.clear();
    
    // Close socket.io server
    if (io) {
      io.close();
    }
    
    console.log("Socket cleanup completed");
  } catch (error) {
    console.error("Error during socket cleanup:", error.message);
  }
};

module.exports = { 
  initializeSocket, 
  sendMessageToSocketId,
  sendMessageToUser,
  broadcastToUserType,
  sendMessageToRoom,
  getConnectionStats,
  isUserConnected,
  cleanup
};
