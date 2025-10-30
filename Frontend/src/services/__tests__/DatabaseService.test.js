/**
 * Unit tests for DatabaseService
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import DatabaseService from '../DatabaseService.js';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('DatabaseService', () => {
  let databaseService;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });

    // Create axios instance mock
    const mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    
    // Create new instance for each test
    databaseService = new DatabaseService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with correct default values', () => {
      expect(databaseService.baseURL).toBe('http://localhost:3000');
      expect(databaseService.isConnected).toBe(true);
      expect(databaseService.connectionAttempts).toBe(0);
      expect(databaseService.maxRetryAttempts).toBe(3);
      expect(databaseService.retryDelay).toBe(1000);
      expect(databaseService.maxRetryDelay).toBe(10000);
    });

    it('should create axios instance with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000',
        timeout: 10000,
      });
    });

    it('should setup interceptors', () => {
      const mockAxiosInstance = mockedAxios.create.mock.results[0].value;
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('Connection Status Management', () => {
    it('should return correct connection status', () => {
      expect(databaseService.getConnectionStatus()).toBe(true);
      
      databaseService.setConnectionStatus(false);
      expect(databaseService.getConnectionStatus()).toBe(false);
    });

    it('should notify listeners when connection status changes', () => {
      const listener = vi.fn();
      databaseService.addConnectionListener(listener);
      
      databaseService.setConnectionStatus(false);
      expect(listener).toHaveBeenCalledWith(false);
      
      databaseService.setConnectionStatus(true);
      expect(listener).toHaveBeenCalledWith(true);
    });

    it('should not notify listeners when status does not change', () => {
      const listener = vi.fn();
      databaseService.addConnectionListener(listener);
      
      databaseService.setConnectionStatus(true); // Same as initial
      expect(listener).not.toHaveBeenCalled();
    });

    it('should remove connection listeners', () => {
      const listener = vi.fn();
      const removeListener = databaseService.addConnectionListener(listener);
      
      removeListener();
      databaseService.setConnectionStatus(false);
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors correctly', () => {
      const networkError = {
        code: 'NETWORK_ERROR',
        message: 'Network Error',
      };
      
      databaseService.handleConnectionError(networkError);
      
      expect(databaseService.connectionAttempts).toBe(1);
      expect(databaseService.getConnectionStatus()).toBe(false);
    });

    it('should handle server errors correctly', () => {
      const serverError = {
        response: { status: 500 },
        message: 'Internal Server Error',
      };
      
      databaseService.handleConnectionError(serverError);
      
      expect(databaseService.connectionAttempts).toBe(1);
      expect(databaseService.getConnectionStatus()).toBe(false);
    });

    it('should not change connection status for client errors', () => {
      const clientError = {
        response: { status: 400 },
        message: 'Bad Request',
      };
      
      databaseService.handleConnectionError(clientError);
      
      expect(databaseService.connectionAttempts).toBe(1);
      expect(databaseService.getConnectionStatus()).toBe(true); // Should remain true
    });
  });

  describe('Retry Logic', () => {
    it('should calculate exponential backoff delay correctly', () => {
      databaseService.connectionAttempts = 1;
      const delay1 = databaseService.calculateRetryDelay();
      expect(delay1).toBeGreaterThanOrEqual(1000);
      expect(delay1).toBeLessThanOrEqual(2000);
      
      databaseService.connectionAttempts = 3;
      const delay3 = databaseService.calculateRetryDelay();
      expect(delay3).toBeGreaterThanOrEqual(4000);
      expect(delay3).toBeLessThanOrEqual(5000);
    });

    it('should not exceed maximum retry delay', () => {
      databaseService.connectionAttempts = 10;
      const delay = databaseService.calculateRetryDelay();
      expect(delay).toBeLessThanOrEqual(databaseService.maxRetryDelay + 1000); // +1000 for jitter
    });

    it('should retry failed requests', async () => {
      const mockRequest = vi.fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValueOnce({ data: 'success' });

      const result = await databaseService.retryRequest(mockRequest, 3);
      
      expect(mockRequest).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ data: 'success' });
    });

    it('should throw error after max retry attempts', async () => {
      const mockRequest = vi.fn().mockRejectedValue(new Error('Always fails'));

      await expect(databaseService.retryRequest(mockRequest, 2)).rejects.toThrow('Always fails');
      expect(mockRequest).toHaveBeenCalledTimes(2);
    });
  });

  describe('User Rides API', () => {
    beforeEach(() => {
      // Mock successful axios response
      databaseService.axiosInstance.get = vi.fn().mockResolvedValue({
        data: {
          success: true,
          rides: [
            {
              _id: 'ride1',
              pickup: 'Location A',
              destination: 'Location B',
              status: 'completed',
              fare: 500,
            },
          ],
          total: 1,
          page: 1,
          pages: 1,
          hasMore: false,
        },
      });
    });

    it('should fetch user rides with default options', async () => {
      const result = await databaseService.getUserRides('user123');
      
      expect(databaseService.axiosInstance.get).toHaveBeenCalledWith('/ride/user/history', {
        params: { page: 1, limit: 20 },
      });
      
      expect(result.success).toBe(true);
      expect(result.rides).toHaveLength(1);
    });

    it('should fetch user rides with custom options', async () => {
      const options = {
        page: 2,
        limit: 10,
        status: 'completed',
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31',
        },
        vehicleType: 'car',
      };

      await databaseService.getUserRides('user123', options);
      
      expect(databaseService.axiosInstance.get).toHaveBeenCalledWith('/ride/user/history', {
        params: {
          page: 2,
          limit: 10,
          status: 'completed',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          vehicleType: 'car',
        },
      });
    });

    it('should handle API errors', async () => {
      databaseService.axiosInstance.get = vi.fn().mockResolvedValue({
        data: {
          success: false,
          message: 'Failed to fetch rides',
        },
      });

      await expect(databaseService.getUserRides('user123')).rejects.toThrow('Failed to fetch rides');
    });

    it('should retry on network errors', async () => {
      databaseService.axiosInstance.get = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: {
            success: true,
            rides: [],
            total: 0,
          },
        });

      const result = await databaseService.getUserRides('user123');
      
      expect(databaseService.axiosInstance.get).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
    });
  });

  describe('Captain Rides API', () => {
    beforeEach(() => {
      databaseService.axiosInstance.get = vi.fn().mockResolvedValue({
        data: {
          success: true,
          rides: [],
          total: 0,
        },
      });
    });

    it('should fetch captain rides with default options', async () => {
      await databaseService.getCaptainRides('captain123');
      
      expect(databaseService.axiosInstance.get).toHaveBeenCalledWith('/ride/captain/history', {
        params: { page: 1, limit: 20 },
      });
    });

    it('should fetch captain rides with filters', async () => {
      const options = {
        status: 'ongoing',
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31',
        },
      };

      await databaseService.getCaptainRides('captain123', options);
      
      expect(databaseService.axiosInstance.get).toHaveBeenCalledWith('/ride/captain/history', {
        params: {
          page: 1,
          limit: 20,
          status: 'ongoing',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      });
    });
  });

  describe('Connection Testing', () => {
    it('should test connection successfully', async () => {
      databaseService.axiosInstance.get = vi.fn().mockResolvedValue({ data: 'OK' });
      
      const result = await databaseService.testConnection();
      
      expect(result).toBe(true);
      expect(databaseService.getConnectionStatus()).toBe(true);
      expect(databaseService.axiosInstance.get).toHaveBeenCalledWith('/health', { timeout: 5000 });
    });

    it('should handle connection test failure', async () => {
      databaseService.axiosInstance.get = vi.fn().mockRejectedValue(new Error('Connection failed'));
      
      const result = await databaseService.testConnection();
      
      expect(result).toBe(false);
      expect(databaseService.getConnectionStatus()).toBe(false);
    });
  });

  describe('Statistics and State Management', () => {
    it('should return connection statistics', () => {
      databaseService.connectionAttempts = 2;
      databaseService.setConnectionStatus(false);
      
      const stats = databaseService.getConnectionStats();
      
      expect(stats).toEqual({
        isConnected: false,
        connectionAttempts: 2,
        maxRetryAttempts: 3,
        retryDelay: 1000,
      });
    });

    it('should reset connection state', () => {
      databaseService.connectionAttempts = 5;
      databaseService.setConnectionStatus(false);
      
      databaseService.resetConnection();
      
      expect(databaseService.connectionAttempts).toBe(0);
      expect(databaseService.getConnectionStatus()).toBe(true);
    });
  });

  describe('Error Logging', () => {
    it('should log errors in development mode', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const error = {
        message: 'Test error',
        code: 'TEST_ERROR',
        response: { status: 500 },
        config: { url: '/test', method: 'GET' },
      };

      databaseService.logError(error);
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});