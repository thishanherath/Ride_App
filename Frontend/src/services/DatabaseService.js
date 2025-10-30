/**
 * Enhanced Database Service Layer
 * Provides connection monitoring, error handling, and automatic fallback mechanisms
 */

import axios from 'axios';

class DatabaseService {
  constructor() {
    this.baseURL = import.meta.env.VITE_SERVER_URL;
    this.isConnected = true;
    this.connectionAttempts = 0;
    this.maxRetryAttempts = 3;
    this.retryDelay = 1000; // Start with 1 second
    this.maxRetryDelay = 10000; // Max 10 seconds
    this.connectionListeners = new Set();
    
    // Initialize axios instance with interceptors
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000, // 10 second timeout
    });
    
    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for request/response handling
   */
  setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.token = token;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Reset connection attempts on successful response
        this.connectionAttempts = 0;
        this.setConnectionStatus(true);
        return response;
      },
      (error) => {
        this.handleConnectionError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check if database connection is available
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Set connection status and notify listeners
   */
  setConnectionStatus(status) {
    if (this.isConnected !== status) {
      this.isConnected = status;
      this.notifyConnectionListeners(status);
    }
  }

  /**
   * Add connection status listener
   */
  addConnectionListener(callback) {
    this.connectionListeners.add(callback);
    return () => this.connectionListeners.delete(callback);
  }

  /**
   * Notify all connection listeners
   */
  notifyConnectionListeners(status) {
    this.connectionListeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  /**
   * Handle connection errors with retry logic
   */
  handleConnectionError(error) {
    this.connectionAttempts++;
    
    const isNetworkError = !error.response || 
      error.code === 'NETWORK_ERROR' || 
      error.code === 'ECONNABORTED' ||
      error.message.includes('timeout');

    const isServerError = error.response && error.response.status >= 500;
    
    if (isNetworkError || isServerError) {
      this.setConnectionStatus(false);
      
      console.warn(`Database connection error (attempt ${this.connectionAttempts}):`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        isNetworkError,
        isServerError
      });
    }

    // Log error for monitoring
    this.logError(error);
  }

  /**
   * Calculate exponential backoff delay
   */
  calculateRetryDelay() {
    const delay = Math.min(
      this.retryDelay * Math.pow(2, this.connectionAttempts - 1),
      this.maxRetryDelay
    );
    return delay + Math.random() * 1000; // Add jitter
  }

  /**
   * Retry request with exponential backoff
   */
  async retryRequest(requestFn, maxAttempts = this.maxRetryAttempts) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await requestFn();
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          break;
        }
        
        const delay = this.calculateRetryDelay();
        console.log(`Retrying request in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Get user ride history with retry logic
   */
  async getUserRides(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      status = null,
      dateRange = null,
      vehicleType = null
    } = options;

    const requestFn = async () => {
      const params = { page, limit };
      
      if (status) params.status = status;
      if (dateRange) {
        params.startDate = dateRange.start;
        params.endDate = dateRange.end;
      }
      if (vehicleType) params.vehicleType = vehicleType;

      const response = await this.axiosInstance.get('/ride/user/history', { params });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch ride history');
      }
      
      return response.data;
    };

    return this.retryRequest(requestFn);
  }

  /**
   * Get captain ride history with retry logic
   */
  async getCaptainRides(captainId, options = {}) {
    const {
      page = 1,
      limit = 20,
      status = null,
      dateRange = null
    } = options;

    const requestFn = async () => {
      const params = { page, limit };
      
      if (status) params.status = status;
      if (dateRange) {
        params.startDate = dateRange.start;
        params.endDate = dateRange.end;
      }

      const response = await this.axiosInstance.get('/ride/captain/history', { params });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch captain ride history');
      }
      
      return response.data;
    };

    return this.retryRequest(requestFn);
  }

  /**
   * Test database connection
   */
  async testConnection() {
    try {
      const response = await this.axiosInstance.get('/health', { timeout: 5000 });
      this.setConnectionStatus(true);
      return true;
    } catch (error) {
      this.setConnectionStatus(false);
      return false;
    }
  }

  /**
   * Log errors for monitoring and debugging
   */
  logError(error) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      connectionAttempts: this.connectionAttempts,
      isConnected: this.isConnected
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('DatabaseService Error:', errorInfo);
    }

    // In production, you might want to send this to a monitoring service
    // Example: sendToMonitoringService(errorInfo);
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    return {
      isConnected: this.isConnected,
      connectionAttempts: this.connectionAttempts,
      maxRetryAttempts: this.maxRetryAttempts,
      retryDelay: this.retryDelay
    };
  }

  /**
   * Reset connection state
   */
  resetConnection() {
    this.connectionAttempts = 0;
    this.setConnectionStatus(true);
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

export default databaseService;