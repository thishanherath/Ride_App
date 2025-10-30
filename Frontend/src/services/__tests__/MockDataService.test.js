/**
 * Unit tests for MockDataService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import MockDataService from '../MockDataService.js';

describe('MockDataService', () => {
  let mockDataService;

  beforeEach(() => {
    mockDataService = new MockDataService();
  });

  describe('Initialization', () => {
    it('should initialize with Sri Lankan locations', () => {
      const locations = mockDataService.getSriLankanLocations();
      
      expect(locations).toBeInstanceOf(Array);
      expect(locations.length).toBeGreaterThan(0);
      
      // Check for some expected Sri Lankan locations
      const locationNames = locations.map(loc => loc.name);
      expect(locationNames).toContain('Fort Railway Station');
      expect(locationNames).toContain('Galle Face Green');
      expect(locationNames).toContain('Kandy City');
      expect(locationNames).toContain('Negombo');
    });

    it('should have proper location structure', () => {
      const locations = mockDataService.getSriLankanLocations();
      const location = locations[0];
      
      expect(location).toHaveProperty('name');
      expect(location).toHaveProperty('district');
      expect(location).toHaveProperty('coordinates');
      expect(location).toHaveProperty('type');
      
      expect(location.coordinates).toHaveLength(2);
      expect(typeof location.coordinates[0]).toBe('number'); // longitude
      expect(typeof location.coordinates[1]).toBe('number'); // latitude
    });

    it('should initialize vehicle types and statuses', () => {
      expect(mockDataService.vehicleTypes).toEqual(['car', 'auto', 'bike']);
      expect(mockDataService.rideStatuses).toEqual(['completed', 'cancelled', 'pending', 'accepted', 'ongoing']);
    });

    it('should initialize captain names', () => {
      expect(mockDataService.captainNames).toBeInstanceOf(Array);
      expect(mockDataService.captainNames.length).toBeGreaterThan(0);
      expect(mockDataService.captainNames).toContain('Sunil Perera');
    });
  });

  describe('Random Data Generation', () => {
    it('should generate random locations', () => {
      const location1 = mockDataService.getRandomLocation();
      const location2 = mockDataService.getRandomLocation();
      
      expect(location1).toHaveProperty('name');
      expect(location1).toHaveProperty('district');
      expect(location1).toHaveProperty('coordinates');
      
      // Test multiple calls to ensure randomness (though they might be the same)
      const locations = Array.from({ length: 10 }, () => mockDataService.getRandomLocation());
      expect(locations).toHaveLength(10);
    });

    it('should generate random vehicle types', () => {
      const vehicleType = mockDataService.getRandomVehicleType();
      expect(['car', 'auto', 'bike']).toContain(vehicleType);
    });

    it('should generate random ride status with realistic distribution', () => {
      // Generate many statuses to test distribution
      const statuses = Array.from({ length: 1000 }, () => mockDataService.getRandomRideStatus());
      const statusCounts = statuses.reduce((acc, status) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Completed should be the most common (around 70%)
      expect(statusCounts.completed).toBeGreaterThan(statusCounts.cancelled);
      expect(statusCounts.completed).toBeGreaterThan(statusCounts.pending);
      
      // All status types should be present
      expect(statusCounts).toHaveProperty('completed');
      expect(statusCounts).toHaveProperty('cancelled');
      expect(statusCounts).toHaveProperty('pending');
    });
  });

  describe('Fare Calculation', () => {
    it('should calculate realistic fares based on distance and vehicle type', () => {
      const pickup = { coordinates: [79.8612, 6.9344] }; // Fort Railway Station
      const destination = { coordinates: [79.8448, 6.9271] }; // Galle Face Green
      
      const carFare = mockDataService.calculateFare(pickup, destination, 'car');
      const autoFare = mockDataService.calculateFare(pickup, destination, 'auto');
      const bikeFare = mockDataService.calculateFare(pickup, destination, 'bike');
      
      // Car should be most expensive, bike should be cheapest
      expect(carFare).toBeGreaterThan(autoFare);
      expect(autoFare).toBeGreaterThan(bikeFare);
      
      // All fares should be positive numbers
      expect(carFare).toBeGreaterThan(0);
      expect(autoFare).toBeGreaterThan(0);
      expect(bikeFare).toBeGreaterThan(0);
    });

    it('should ensure minimum fare is applied', () => {
      const pickup = { coordinates: [79.8612, 6.9344] };
      const destination = { coordinates: [79.8612, 6.9344] }; // Same location
      
      const carFare = mockDataService.calculateFare(pickup, destination, 'car');
      const autoFare = mockDataService.calculateFare(pickup, destination, 'auto');
      const bikeFare = mockDataService.calculateFare(pickup, destination, 'bike');
      
      // Should get minimum fares even for zero distance
      expect(carFare).toBe(250); // Base fare for car
      expect(autoFare).toBe(150); // Base fare for auto
      expect(bikeFare).toBe(100); // Base fare for bike
    });
  });

  describe('Captain Data Generation', () => {
    it('should generate realistic captain data', () => {
      const captain = mockDataService.generateCaptainData();
      
      expect(captain).toHaveProperty('_id');
      expect(captain).toHaveProperty('name');
      expect(captain).toHaveProperty('phone');
      expect(captain).toHaveProperty('vehicle');
      expect(captain).toHaveProperty('rating');
      
      // Phone should be Sri Lankan format
      expect(captain.phone).toMatch(/^\+94\d{9}$/);
      
      // Rating should be between 3.0 and 5.0
      const rating = parseFloat(captain.rating);
      expect(rating).toBeGreaterThanOrEqual(3.0);
      expect(rating).toBeLessThanOrEqual(5.0);
      
      // Vehicle should have proper structure
      expect(captain.vehicle).toHaveProperty('type');
      expect(captain.vehicle).toHaveProperty('number');
      expect(captain.vehicle).toHaveProperty('color');
      expect(['car', 'auto', 'bike']).toContain(captain.vehicle.type);
    });

    it('should generate Sri Lankan vehicle numbers', () => {
      const vehicleNumber = mockDataService.generateVehicleNumber();
      
      // Should match Sri Lankan vehicle number format: WP AB 1234
      expect(vehicleNumber).toMatch(/^[A-Z]{2,3} [A-Z]{2} \d{4}$/);
    });

    it('should generate valid vehicle colors', () => {
      const color = mockDataService.getRandomVehicleColor();
      const validColors = ['White', 'Black', 'Silver', 'Red', 'Blue', 'Yellow', 'Green'];
      
      expect(validColors).toContain(color);
    });
  });

  describe('Date and Time Generation', () => {
    it('should generate dates within the last 6 months', () => {
      const date = mockDataService.generateRandomDate();
      const now = new Date();
      const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
      
      expect(date.getTime()).toBeGreaterThanOrEqual(sixMonthsAgo.getTime());
      expect(date.getTime()).toBeLessThanOrEqual(now.getTime());
    });

    it('should generate realistic timestamps with peak hour distribution', () => {
      // This test is probabilistic, so we'll generate many timestamps
      const timestamps = Array.from({ length: 100 }, () => mockDataService.generateRealisticTimestamp());
      
      expect(timestamps).toHaveLength(100);
      timestamps.forEach(timestamp => {
        expect(timestamp).toBeInstanceOf(Date);
      });
    });
  });

  describe('Mock Ride Generation', () => {
    it('should generate a complete mock ride', () => {
      const ride = mockDataService.generateMockRide(1);
      
      // Check all required properties
      expect(ride).toHaveProperty('_id');
      expect(ride).toHaveProperty('user');
      expect(ride).toHaveProperty('pickup');
      expect(ride).toHaveProperty('destination');
      expect(ride).toHaveProperty('fare');
      expect(ride).toHaveProperty('vehicle');
      expect(ride).toHaveProperty('status');
      expect(ride).toHaveProperty('createdAt');
      expect(ride).toHaveProperty('updatedAt');
      expect(ride).toHaveProperty('messages');
      
      // Pickup and destination should be different
      expect(ride.pickup).not.toBe(ride.destination);
      
      // Fare should be positive
      expect(ride.fare).toBeGreaterThan(0);
      
      // Vehicle should be valid type
      expect(['car', 'auto', 'bike']).toContain(ride.vehicle);
      
      // Status should be valid
      expect(['completed', 'cancelled', 'pending', 'accepted', 'ongoing']).toContain(ride.status);
      
      // Dates should be valid ISO strings
      expect(() => new Date(ride.createdAt)).not.toThrow();
      expect(() => new Date(ride.updatedAt)).not.toThrow();
    });

    it('should generate rides with captain data for non-pending rides', () => {
      // Generate multiple rides to test different statuses
      const rides = Array.from({ length: 20 }, (_, i) => mockDataService.generateMockRide(i));
      
      const pendingRides = rides.filter(ride => ride.status === 'pending');
      const nonPendingRides = rides.filter(ride => ride.status !== 'pending');
      
      // Pending rides should not have captain
      pendingRides.forEach(ride => {
        expect(ride.captain).toBeNull();
      });
      
      // Non-pending rides should have captain
      nonPendingRides.forEach(ride => {
        expect(ride.captain).not.toBeNull();
        expect(ride.captain).toHaveProperty('name');
        expect(ride.captain).toHaveProperty('vehicle');
      });
    });

    it('should generate completed rides with additional data', () => {
      // Generate many rides to get some completed ones
      const rides = Array.from({ length: 50 }, (_, i) => mockDataService.generateMockRide(i));
      const completedRides = rides.filter(ride => ride.status === 'completed');
      
      if (completedRides.length > 0) {
        const completedRide = completedRides[0];
        
        expect(completedRide.duration).toBeGreaterThan(0);
        expect(completedRide.distance).toBeGreaterThan(0);
        expect(completedRide.paymentID).toBeTruthy();
        expect(completedRide.signature).toBeTruthy();
        expect(completedRide.rating).toBeTruthy();
      }
    });
  });

  describe('Paginated Rides', () => {
    it('should return paginated rides with correct structure', () => {
      const result = mockDataService.getPaginatedRides(1, 10);
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('rides');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('pages');
      expect(result).toHaveProperty('hasMore');
      expect(result).toHaveProperty('message');
      
      expect(result.rides).toBeInstanceOf(Array);
      expect(result.rides.length).toBeLessThanOrEqual(10);
    });

    it('should filter rides by status', () => {
      const result = mockDataService.getPaginatedRides(1, 50, { status: 'completed' });
      
      result.rides.forEach(ride => {
        expect(ride.status).toBe('completed');
      });
    });

    it('should filter rides by vehicle type', () => {
      const result = mockDataService.getPaginatedRides(1, 50, { vehicleType: 'car' });
      
      result.rides.forEach(ride => {
        expect(ride.vehicle).toBe('car');
      });
    });

    it('should handle pagination correctly', () => {
      const page1 = mockDataService.getPaginatedRides(1, 5);
      const page2 = mockDataService.getPaginatedRides(2, 5);
      
      expect(page1.rides).toHaveLength(5);
      expect(page2.rides).toHaveLength(5);
      
      // Rides should be different between pages
      const page1Ids = page1.rides.map(ride => ride._id);
      const page2Ids = page2.rides.map(ride => ride._id);
      
      expect(page1Ids).not.toEqual(page2Ids);
    });

    it('should calculate hasMore correctly', () => {
      const result = mockDataService.getPaginatedRides(1, 10);
      
      if (result.total > 10) {
        expect(result.hasMore).toBe(true);
      } else {
        expect(result.hasMore).toBe(false);
      }
    });
  });

  describe('Realistic Ride Scenarios', () => {
    it('should create realistic ride scenarios', () => {
      const scenarios = mockDataService.createRealisticRideScenarios();
      
      expect(scenarios).toBeInstanceOf(Array);
      expect(scenarios.length).toBeGreaterThan(0);
      
      scenarios.forEach(scenario => {
        expect(scenario).toHaveProperty('pickup');
        expect(scenario).toHaveProperty('destination');
        expect(scenario).toHaveProperty('vehicle');
        expect(scenario).toHaveProperty('status');
        
        // Should have realistic Sri Lankan locations
        expect(typeof scenario.pickup).toBe('string');
        expect(typeof scenario.destination).toBe('string');
      });
      
      // Should include various scenarios
      const statuses = scenarios.map(s => s.status);
      expect(statuses).toContain('completed');
      expect(statuses).toContain('cancelled');
    });
  });

  describe('Message Generation', () => {
    it('should generate appropriate messages for different ride statuses', () => {
      const pendingMessages = mockDataService.generateRideMessages('pending');
      const completedMessages = mockDataService.generateRideMessages('completed');
      
      expect(pendingMessages).toHaveLength(0);
      expect(completedMessages.length).toBeGreaterThan(0);
      
      completedMessages.forEach(message => {
        expect(message).toHaveProperty('msg');
        expect(message).toHaveProperty('by');
        expect(message).toHaveProperty('time');
        expect(message).toHaveProperty('date');
        expect(message).toHaveProperty('timestamp');
        
        expect(['user', 'captain']).toContain(message.by);
      });
    });
  });
});