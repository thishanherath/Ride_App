/**
 * Unit tests for RideDataService
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RideDataService from '../RideDataService.js';

// Mock the service dependencies
vi.mock('../DatabaseService.js', () => ({
  default: {
    getConnectionStatus: vi.fn(),
    getUserRides: vi.fn(),
    getCaptainRides: vi.fn(),
    testConnection: vi.fn(),
    addConnectionListener: vi.fn(),
    getConnectionStats: vi.fn(),
    resetConnection: vi.fn(),
  }
}));

vi.mock('../MockDataService.js', () => ({
  default: {
    getPaginatedRides: vi.fn(),
    createRealisticRideScenarios: vi.fn(),
    getSriLankanLocations: vi.fn(),
  }
}));

describe('RideDataService', () => {
  let rideDataService;
  let mockDatabaseService;
  let mockDataService;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Create new instance for each test
    rideDataService = new RideDataService();
    mockDatabaseService = rideDataService.databaseService;
    mockDataService = rideDataService.mockDataService;
    
    // Setup default mock behaviors
    mockDatabaseService.getConnectionStatus.mockReturnValue(true);
    mockDatabaseService.addConnectionListener.mockReturnValue(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with correct default values', () => {
      expect(rideDataService.currentDataSource).toBe('database');
      expect(rideDataService.fallbackEnabled).toBe(true);
    });

    it('should setup database connection listener', () => {
      expect(mockDatabaseService.addConnectionListener).toHaveBeenCalled();
    });
  });

  describe('Data Source Management', () => {
    it('should return current data source', () => {
      expect(rideDataService.getCurrentDataSource()).toBe('database');
      
      rideDataService.currentDataSource = 'mock';
      expect(rideDataService.getCurrentDataSource()).toBe('mock');
    });

    it('should check if using mock data', () => {
      expect(rideDataService.isUsingMockData()).toBe(false);
      
      rideDataService.currentDataSource = 'mock';
      expect(rideDataService.isUsingMockData()).toBe(true);
    });

    it('should enable/disable fallback', () => {
      rideDataService.setFallbackEnabled(false);
      expect(rideDataService.fallbackEnabled).toBe(false);
      
      rideDataService.setFallbackEnabled(true);
      expect(rideDataService.fallbackEnabled).toBe(true);
    });

    it('should add and remove data source listeners', () => {
      const listener = vi.fn();
      const removeListener = rideDataService.addDataSourceListener(listener);
      
      // Simulate data source change
      rideDataService.notifyDataSourceChange('mock', 'database');
      expect(listener).toHaveBeenCalledWith('mock', 'database');
      
      // Remove listener
      removeListener();
      rideDataService.notifyDataSourceChange('database', 'mock');
      expect(listener).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  describe('Connection Change Handling', () => {
    it('should switch to database when connection is restored', () => {
      rideDataService.currentDataSource = 'mock';
      const listener = vi.fn();
      rideDataService.addDataSourceListener(listener);
      
      rideDataService.handleConnectionChange(true);
      
      expect(rideDataService.currentDataSource).toBe('database');
      expect(listener).toHaveBeenCalledWith('database', 'mock');
    });

    it('should switch to mock when connection is lost and fallback is enabled', () => {
      rideDataService.currentDataSource = 'database';
      rideDataService.fallbackEnabled = true;
      const listener = vi.fn();
      rideDataService.addDataSourceListener(listener);
      
      rideDataService.handleConnectionChange(false);
      
      expect(rideDataService.currentDataSource).toBe('mock');
      expect(listener).toHaveBeenCalledWith('mock', 'database');
    });

    it('should not switch to mock when fallback is disabled', () => {
      rideDataService.currentDataSource = 'database';
      rideDataService.fallbackEnabled = false;
      const listener = vi.fn();
      rideDataService.addDataSourceListener(listener);
      
      rideDataService.handleConnectionChange(false);
      
      expect(rideDataService.currentDataSource).toBe('database');
      expect(listener).not.toHaveBeenCalled();
    });

    it('should not notify listeners if data source does not change', () => {
      rideDataService.currentDataSource = 'database';
      const listener = vi.fn();
      rideDataService.addDataSourceListener(listener);
      
      rideDataService.handleConnectionChange(true); // Already using database
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('User Ride History', () => {
    const mockRideData = {
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
    };

    it('should fetch from database when connection is available', async () => {
      mockDatabaseService.getConnectionStatus.mockReturnValue(true);
      mockDatabaseService.getUserRides.mockResolvedValue(mockRideData);
      
      const result = await rideDataService.getUserRideHistory('user123');
      
      expect(mockDatabaseService.getUserRides).toHaveBeenCalledWith('user123', {});
      expect(result.dataSource).toBe('database');
      expect(result.rides).toEqual(mockRideData.rides);
    });

    it('should switch back to database if it was using mock data', async () => {
      rideDataService.currentDataSource = 'mock';
      mockDatabaseService.getConnectionStatus.mockReturnValue(true);
      mockDatabaseService.getUserRides.mockResolvedValue(mockRideData);
      
      const listener = vi.fn();
      rideDataService.addDataSourceListener(listener);
      
      await rideDataService.getUserRideHistory('user123');
      
      expect(rideDataService.currentDataSource).toBe('database');
      expect(listener).toHaveBeenCalledWith('database', 'mock');
    });

    it('should fallback to mock data when database fails', async () => {
      mockDatabaseService.getConnectionStatus.mockReturnValue(true);
      mockDatabaseService.getUserRides.mockRejectedValue(new Error('Database error'));
      mockDataService.getPaginatedRides.mockReturnValue(mockRideData);
      
      const result = await rideDataService.getUserRideHistory('user123');
      
      expect(mockDataService.getPaginatedRides).toHaveBeenCalled();
      expect(result.dataSource).toBe('mock');
      expect(rideDataService.currentDataSource).toBe('mock');
    });

    it('should use mock data when database is not connected', async () => {
      mockDatabaseService.getConnectionStatus.mockReturnValue(false);
      mockDataService.getPaginatedRides.mockReturnValue(mockRideData);
      
      const result = await rideDataService.getUserRideHistory('user123');
      
      expect(mockDatabaseService.getUserRides).not.toHaveBeenCalled();
      expect(mockDataService.getPaginatedRides).toHaveBeenCalled();
      expect(result.dataSource).toBe('mock');
    });

    it('should throw error when fallback is disabled and database fails', async () => {
      rideDataService.fallbackEnabled = false;
      mockDatabaseService.getConnectionStatus.mockReturnValue(true);
      mockDatabaseService.getUserRides.mockRejectedValue(new Error('Database error'));
      
      await expect(rideDataService.getUserRideHistory('user123')).rejects.toThrow('Database error');
      expect(mockDataService.getPaginatedRides).not.toHaveBeenCalled();
    });

    it('should pass options to database service', async () => {
      const options = {
        page: 2,
        limit: 10,
        status: 'completed',
        vehicleType: 'car',
        dateRange: { start: '2024-01-01', end: '2024-01-31' },
      };
      
      mockDatabaseService.getConnectionStatus.mockReturnValue(true);
      mockDatabaseService.getUserRides.mockResolvedValue(mockRideData);
      
      await rideDataService.getUserRideHistory('user123', options);
      
      expect(mockDatabaseService.getUserRides).toHaveBeenCalledWith('user123', options);
    });

    it('should pass options to mock service', async () => {
      const options = {
        page: 2,
        limit: 10,
        status: 'completed',
        vehicleType: 'car',
        dateRange: { start: '2024-01-01', end: '2024-01-31' },
      };
      
      mockDatabaseService.getConnectionStatus.mockReturnValue(false);
      mockDataService.getPaginatedRides.mockReturnValue(mockRideData);
      
      await rideDataService.getUserRideHistory('user123', options);
      
      expect(mockDataService.getPaginatedRides).toHaveBeenCalledWith(
        options.page,
        options.limit,
        {
          status: options.status,
          vehicleType: options.vehicleType,
          dateRange: options.dateRange,
        }
      );
    });
  });

  describe('Captain Ride History', () => {
    const mockRideData = {
      success: true,
      rides: [],
      total: 0,
    };

    it('should fetch captain rides from database when available', async () => {
      mockDatabaseService.getConnectionStatus.mockReturnValue(true);
      mockDatabaseService.getCaptainRides.mockResolvedValue(mockRideData);
      
      const result = await rideDataService.getCaptainRideHistory('captain123');
      
      expect(mockDatabaseService.getCaptainRides).toHaveBeenCalledWith('captain123', {});
      expect(result.dataSource).toBe('database');
    });

    it('should fallback to mock data for captain rides', async () => {
      mockDatabaseService.getConnectionStatus.mockReturnValue(true);
      mockDatabaseService.getCaptainRides.mockRejectedValue(new Error('Database error'));
      mockDataService.getPaginatedRides.mockReturnValue(mockRideData);
      
      const result = await rideDataService.getCaptainRideHistory('captain123');
      
      expect(mockDataService.getPaginatedRides).toHaveBeenCalled();
      expect(result.dataSource).toBe('mock');
    });
  });

  describe('Connection Testing', () => {
    it('should test connection and return status', async () => {
      mockDatabaseService.testConnection.mockResolvedValue(true);
      
      const result = await rideDataService.testConnection();
      
      expect(result).toEqual({
        database: true,
        mock: true,
        current: 'database',
        fallbackEnabled: true,
      });
    });

    it('should handle connection test errors', async () => {
      mockDatabaseService.testConnection.mockRejectedValue(new Error('Connection failed'));
      
      const result = await rideDataService.testConnection();
      
      expect(result).toEqual({
        database: false,
        mock: true,
        current: 'database',
        fallbackEnabled: true,
        error: 'Connection failed',
      });
    });
  });

  describe('Data Source Switching', () => {
    it('should switch to database when connection is available', async () => {
      mockDatabaseService.testConnection.mockResolvedValue(true);
      
      const result = await rideDataService.switchDataSource('database');
      
      expect(result).toBe(true);
      expect(rideDataService.currentDataSource).toBe('database');
    });

    it('should fail to switch to database when connection is not available', async () => {
      mockDatabaseService.testConnection.mockResolvedValue(false);
      
      await expect(rideDataService.switchDataSource('database')).rejects.toThrow(
        'Cannot switch to database: connection not available'
      );
    });

    it('should switch to mock data source', async () => {
      const listener = vi.fn();
      rideDataService.addDataSourceListener(listener);
      
      const result = await rideDataService.switchDataSource('mock');
      
      expect(result).toBe(true);
      expect(rideDataService.currentDataSource).toBe('mock');
      expect(listener).toHaveBeenCalledWith('mock', 'database');
    });

    it('should not notify listeners when switching to same source', async () => {
      const listener = vi.fn();
      rideDataService.addDataSourceListener(listener);
      
      await rideDataService.switchDataSource('database'); // Already database
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Statistics and State Management', () => {
    it('should return connection statistics', () => {
      const mockStats = {
        isConnected: true,
        connectionAttempts: 0,
        maxRetryAttempts: 3,
        retryDelay: 1000,
      };
      
      mockDatabaseService.getConnectionStats.mockReturnValue(mockStats);
      
      const stats = rideDataService.getConnectionStats();
      
      expect(stats).toEqual({
        currentDataSource: 'database',
        fallbackEnabled: true,
        databaseStats: mockStats,
        isUsingMockData: false,
      });
    });

    it('should reset all connections and state', () => {
      rideDataService.currentDataSource = 'mock';
      rideDataService.fallbackEnabled = false;
      
      rideDataService.reset();
      
      expect(mockDatabaseService.resetConnection).toHaveBeenCalled();
      expect(rideDataService.currentDataSource).toBe('database');
      expect(rideDataService.fallbackEnabled).toBe(true);
    });
  });

  describe('Mock Data Access', () => {
    it('should get mock ride scenarios', () => {
      const mockScenarios = [{ pickup: 'A', destination: 'B' }];
      mockDataService.createRealisticRideScenarios.mockReturnValue(mockScenarios);
      
      const result = rideDataService.getMockRideScenarios();
      
      expect(result).toEqual(mockScenarios);
      expect(mockDataService.createRealisticRideScenarios).toHaveBeenCalled();
    });

    it('should get Sri Lankan locations', () => {
      const mockLocations = [{ name: 'Colombo', coordinates: [79.8612, 6.9344] }];
      mockDataService.getSriLankanLocations.mockReturnValue(mockLocations);
      
      const result = rideDataService.getSriLankanLocations();
      
      expect(result).toEqual(mockLocations);
      expect(mockDataService.getSriLankanLocations).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle listener errors gracefully', () => {
      const faultyListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      const goodListener = vi.fn();
      
      rideDataService.addDataSourceListener(faultyListener);
      rideDataService.addDataSourceListener(goodListener);
      
      // Should not throw error
      expect(() => {
        rideDataService.notifyDataSourceChange('mock', 'database');
      }).not.toThrow();
      
      expect(faultyListener).toHaveBeenCalled();
      expect(goodListener).toHaveBeenCalled();
    });

    it('should throw error when both database and mock fail', async () => {
      mockDatabaseService.getConnectionStatus.mockReturnValue(true);
      mockDatabaseService.getUserRides.mockRejectedValue(new Error('Database error'));
      mockDataService.getPaginatedRides.mockImplementation(() => {
        throw new Error('Mock error');
      });
      
      await expect(rideDataService.getUserRideHistory('user123')).rejects.toThrow(
        'Unable to retrieve ride history from any data source'
      );
    });
  });
});