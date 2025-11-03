// Note: We'll get these functions dynamically to avoid circular dependency

class SocketConnectionManager {
  constructor() {
    this.reconnectionAttempts = new Map(); // userId -> { attempts, lastAttempt, backoffDelay }
    this.maxReconnectionAttempts = 5;
    this.baseBackoffDelay = 1000; // 1 second
    this.maxBackoffDelay = 30000; // 30 seconds
  }

  // Handle user reconnection with exponential backoff
  handleReconnection(userId, userType) {
    const attempts = this.reconnectionAttempts.get(userId) || { 
      attempts: 0, 
      lastAttempt: 0, 
      backoffDelay: this.baseBackoffDelay 
    };

    const now = Date.now();
    const timeSinceLastAttempt = now - attempts.lastAttempt;

    // Reset attempts if enough time has passed
    if (timeSinceLastAttempt > 60000) { // 1 minute
      attempts.attempts = 0;
      attempts.backoffDelay = this.baseBackoffDelay;
    }

    attempts.attempts++;
    attempts.lastAttempt = now;

    if (attempts.attempts > this.maxReconnectionAttempts) {
      console.log(`Max reconnection attempts reached for user: ${userId}`);
      return {
        success: false,
        message: 'Maximum reconnection attempts exceeded. Please refresh the page.',
        shouldRetry: false
      };
    }

    // Calculate exponential backoff delay
    attempts.backoffDelay = Math.min(
      this.baseBackoffDelay * Math.pow(2, attempts.attempts - 1),
      this.maxBackoffDelay
    );

    this.reconnectionAttempts.set(userId, attempts);

    return {
      success: true,
      message: 'Reconnection attempt registered',
      shouldRetry: true,
      retryDelay: attempts.backoffDelay,
      attemptsRemaining: this.maxReconnectionAttempts - attempts.attempts
    };
  }

  // Clear reconnection attempts for successful connection
  clearReconnectionAttempts(userId) {
    this.reconnectionAttempts.delete(userId);
  }

  // Send connection health check
  async sendHealthCheck(userId, socketFunctions) {
    if (!socketFunctions || !socketFunctions.isUserConnected(userId)) {
      return false;
    }

    try {
      const result = await socketFunctions.sendMessageToUser(userId, {
        event: 'health-check',
        data: {
          message: 'Connection health check',
          timestamp: new Date(),
          requiresResponse: true
        }
      });

      return result;
    } catch (error) {
      console.error(`Health check failed for user ${userId}:`, error.message);
      return false;
    }
  }

  // Monitor connection health for all users
  async monitorConnectionHealth(socketFunctions) {
    if (!socketFunctions) {
      console.warn('Socket functions not available for health monitoring');
      return null;
    }

    const stats = socketFunctions.getConnectionStats();
    console.log('Connection Health Stats:', stats);

    // Check for users who might need health checks
    for (const [userId] of this.reconnectionAttempts.entries()) {
      if (socketFunctions.isUserConnected(userId)) {
        await this.sendHealthCheck(userId, socketFunctions);
      }
    }

    return stats;
  }

  // Handle connection timeout
  handleConnectionTimeout(userId, userType, socketFunctions) {
    console.log(`Connection timeout for ${userType}: ${userId}`);
    
    // Send reconnection instructions
    if (socketFunctions && socketFunctions.isUserConnected(userId)) {
      socketFunctions.sendMessageToUser(userId, {
        event: 'connection-timeout-warning',
        data: {
          message: 'Your connection is experiencing issues. Please check your internet connection.',
          timestamp: new Date(),
          userType
        }
      });
    }

    // Track timeout for analytics
    this.trackConnectionIssue(userId, 'timeout');
  }

  // Handle connection error
  handleConnectionError(userId, userType, error, socketFunctions) {
    console.error(`Connection error for ${userType} ${userId}:`, error.message);
    
    // Send error notification
    if (socketFunctions && socketFunctions.isUserConnected(userId)) {
      socketFunctions.sendMessageToUser(userId, {
        event: 'connection-error',
        data: {
          message: 'Connection error occurred. Attempting to reconnect...',
          timestamp: new Date(),
          userType,
          error: error.message
        }
      });
    }

    // Track error for analytics
    this.trackConnectionIssue(userId, 'error', error.message);
  }

  // Track connection issues for analytics
  trackConnectionIssue(userId, issueType, details = null) {
    // This could be expanded to store in database for analytics
    console.log(`Connection issue tracked: ${userId} - ${issueType}`, details);
  }

  // Get reconnection status for a user
  getReconnectionStatus(userId) {
    const attempts = this.reconnectionAttempts.get(userId);
    if (!attempts) {
      return {
        hasAttempts: false,
        attempts: 0,
        nextRetryDelay: this.baseBackoffDelay
      };
    }

    return {
      hasAttempts: true,
      attempts: attempts.attempts,
      lastAttempt: attempts.lastAttempt,
      nextRetryDelay: attempts.backoffDelay,
      attemptsRemaining: this.maxReconnectionAttempts - attempts.attempts
    };
  }

  // Cleanup old reconnection attempts
  cleanupOldAttempts() {
    const now = Date.now();
    const cleanupThreshold = 300000; // 5 minutes

    for (const [userId, attempts] of this.reconnectionAttempts.entries()) {
      if (now - attempts.lastAttempt > cleanupThreshold) {
        this.reconnectionAttempts.delete(userId);
      }
    }
  }

  // Start periodic cleanup
  startPeriodicCleanup(socketFunctions) {
    // Cleanup old attempts every 5 minutes
    setInterval(() => {
      this.cleanupOldAttempts();
    }, 300000);

    // Monitor connection health every 2 minutes
    if (socketFunctions) {
      setInterval(() => {
        this.monitorConnectionHealth(socketFunctions);
      }, 120000);
    }
  }

  // Get statistics
  getStats(socketFunctions) {
    return {
      activeReconnectionAttempts: this.reconnectionAttempts.size,
      connectionStats: socketFunctions ? socketFunctions.getConnectionStats() : null,
      maxReconnectionAttempts: this.maxReconnectionAttempts,
      baseBackoffDelay: this.baseBackoffDelay,
      maxBackoffDelay: this.maxBackoffDelay
    };
  }
}

// Create singleton instance
const socketConnectionManager = new SocketConnectionManager();

module.exports = socketConnectionManager;