/**
 * Real World Calculations Service
 * Provides realistic calculations for ETA, distance, fare, and traffic conditions
 */

const openStreetMapService = require('./openstreetmap.service');

class RealWorldCalculations {
  constructor() {
    // Real-world traffic patterns (based on time of day)
    this.trafficMultipliers = {
      // Peak hours (7-9 AM, 5-7 PM)
      peak: 1.8,
      // Semi-peak hours (6-7 AM, 9-11 AM, 3-5 PM, 7-9 PM)
      semiPeak: 1.4,
      // Off-peak hours
      offPeak: 1.0,
      // Late night (11 PM - 5 AM)
      lateNight: 0.8
    };

    // Vehicle speed averages (km/h) in different conditions
    this.vehicleSpeeds = {
      car: {
        highway: 80,
        city: 25,
        residential: 20,
        traffic: 15
      },
      bike: {
        highway: 60,
        city: 30,
        residential: 25,
        traffic: 20
      },
      auto: {
        highway: 50,
        city: 20,
        residential: 15,
        traffic: 10
      }
    };

    // Base fare structure (in local currency)
    this.fareStructure = {
      car: {
        baseFare: 150,
        perKm: 45,
        perMinute: 8,
        minimumFare: 200
      },
      bike: {
        baseFare: 80,
        perKm: 25,
        perMinute: 5,
        minimumFare: 120
      },
      auto: {
        baseFare: 100,
        perKm: 35,
        perMinute: 6,
        minimumFare: 150
      }
    };

    // Surge pricing multipliers
    this.surgeMultipliers = {
      normal: 1.0,
      slight: 1.2,
      moderate: 1.5,
      high: 2.0,
      extreme: 3.0
    };
  }

  /**
   * Get current traffic multiplier based on time
   */
  getCurrentTrafficMultiplier() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Weekend traffic is generally lighter
    const isWeekend = day === 0 || day === 6;
    
    if (isWeekend) {
      if (hour >= 10 && hour <= 14) return this.trafficMultipliers.semiPeak * 0.8;
      if (hour >= 18 && hour <= 21) return this.trafficMultipliers.semiPeak * 0.9;
      return this.trafficMultipliers.offPeak;
    }

    // Weekday traffic patterns
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return this.trafficMultipliers.peak;
    }
    if ((hour >= 6 && hour <= 7) || (hour >= 9 && hour <= 11) || 
        (hour >= 15 && hour <= 17) || (hour >= 19 && hour <= 21)) {
      return this.trafficMultipliers.semiPeak;
    }
    if (hour >= 23 || hour <= 5) {
      return this.trafficMultipliers.lateNight;
    }
    
    return this.trafficMultipliers.offPeak;
  }

  /**
   * Calculate realistic ETA based on distance, vehicle type, and traffic
   */
  async calculateRealisticETA(driverLocation, pickupLocation, vehicleType = 'car') {
    try {
      // Get route information
      const routeResult = await openStreetMapService.calculateRoute(
        {
          lat: driverLocation.latitude || driverLocation.lat,
          lng: driverLocation.longitude || driverLocation.lng
        },
        {
          lat: pickupLocation.latitude || pickupLocation.lat,
          lng: pickupLocation.longitude || pickupLocation.lng
        }
      );

      if (!routeResult.success) {
        // Fallback to straight-line distance calculation
        return this.calculateFallbackETA(driverLocation, pickupLocation, vehicleType);
      }

      const distanceKm = routeResult.data.distance / 1000;
      const baseTimeMinutes = routeResult.data.duration / 60;

      // Apply traffic multiplier
      const trafficMultiplier = this.getCurrentTrafficMultiplier();
      
      // Apply vehicle-specific adjustments
      const vehicleMultiplier = this.getVehicleSpeedMultiplier(vehicleType, distanceKm);
      
      // Calculate realistic ETA
      const realisticETA = Math.round(baseTimeMinutes * trafficMultiplier * vehicleMultiplier);
      
      // Add buffer time (2-5 minutes) for real-world delays
      const bufferTime = Math.min(Math.max(Math.round(distanceKm * 0.5), 2), 5);
      
      return {
        eta: realisticETA + bufferTime,
        distance: distanceKm,
        baseTime: Math.round(baseTimeMinutes),
        trafficCondition: this.getTrafficConditionText(trafficMultiplier),
        confidence: 'high'
      };

    } catch (error) {
      console.error('ETA calculation error:', error);
      return this.calculateFallbackETA(driverLocation, pickupLocation, vehicleType);
    }
  }

  /**
   * Fallback ETA calculation using straight-line distance
   */
  calculateFallbackETA(driverLocation, pickupLocation, vehicleType) {
    const distance = this.calculateStraightLineDistance(
      driverLocation.latitude || driverLocation.lat,
      driverLocation.longitude || driverLocation.lng,
      pickupLocation.latitude || pickupLocation.lat,
      pickupLocation.longitude || pickupLocation.lng
    );

    // Assume 1.4x multiplier for actual road distance vs straight line
    const roadDistance = distance * 1.4;
    
    // Use average city speed for vehicle type
    const avgSpeed = this.vehicleSpeeds[vehicleType]?.city || 25;
    const trafficMultiplier = this.getCurrentTrafficMultiplier();
    
    const baseTime = (roadDistance / avgSpeed) * 60; // minutes
    const realisticETA = Math.round(baseTime * trafficMultiplier);
    
    return {
      eta: Math.max(realisticETA + 3, 5), // Minimum 5 minutes
      distance: roadDistance,
      baseTime: Math.round(baseTime),
      trafficCondition: this.getTrafficConditionText(trafficMultiplier),
      confidence: 'medium'
    };
  }

  /**
   * Calculate straight-line distance between two points (Haversine formula)
   */
  calculateStraightLineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  /**
   * Get vehicle speed multiplier based on distance and vehicle type
   */
  getVehicleSpeedMultiplier(vehicleType, distanceKm) {
    // Shorter distances favor bikes and autos in city traffic
    if (distanceKm < 2) {
      return vehicleType === 'bike' ? 0.8 : vehicleType === 'auto' ? 0.9 : 1.1;
    }
    
    // Medium distances are neutral
    if (distanceKm < 10) {
      return 1.0;
    }
    
    // Longer distances favor cars
    return vehicleType === 'car' ? 0.9 : vehicleType === 'auto' ? 1.2 : 1.1;
  }

  /**
   * Get traffic condition text
   */
  getTrafficConditionText(multiplier) {
    if (multiplier >= 1.7) return 'Heavy Traffic';
    if (multiplier >= 1.3) return 'Moderate Traffic';
    if (multiplier >= 1.1) return 'Light Traffic';
    return 'Clear Roads';
  }

  /**
   * Calculate realistic fare based on distance, time, and surge
   */
  async calculateRealisticFare(pickupAddress, destinationAddress, vehicleType = 'car') {
    try {
      // Get route information
      const routeResult = await openStreetMapService.getDistanceAndDuration(
        pickupAddress,
        destinationAddress
      );

      if (!routeResult.success) {
        throw new Error('Could not calculate route for fare estimation');
      }

      const distanceKm = parseFloat(routeResult.data.distance.kilometers);
      const durationMinutes = routeResult.data.duration.minutes;

      // Get fare structure for vehicle type
      const fareConfig = this.fareStructure[vehicleType] || this.fareStructure.car;

      // Calculate base fare
      let totalFare = fareConfig.baseFare;
      totalFare += distanceKm * fareConfig.perKm;
      totalFare += durationMinutes * fareConfig.perMinute;

      // Apply minimum fare
      totalFare = Math.max(totalFare, fareConfig.minimumFare);

      // Apply surge pricing based on current conditions
      const surgeMultiplier = this.getCurrentSurgeMultiplier();
      totalFare *= surgeMultiplier;

      // Round to nearest 10
      totalFare = Math.round(totalFare / 10) * 10;

      return {
        [vehicleType]: totalFare,
        breakdown: {
          baseFare: fareConfig.baseFare,
          distanceFare: Math.round(distanceKm * fareConfig.perKm),
          timeFare: Math.round(durationMinutes * fareConfig.perMinute),
          surgeMultiplier: surgeMultiplier,
          minimumFare: fareConfig.minimumFare
        },
        distance: distanceKm,
        duration: durationMinutes,
        surgeLevel: this.getSurgeLevelText(surgeMultiplier)
      };

    } catch (error) {
      console.error('Fare calculation error:', error);
      
      // Fallback fare calculation
      const fareConfig = this.fareStructure[vehicleType] || this.fareStructure.car;
      const estimatedDistance = 5; // 5km default
      const estimatedTime = 15; // 15 minutes default
      
      let fallbackFare = fareConfig.baseFare + 
                        (estimatedDistance * fareConfig.perKm) + 
                        (estimatedTime * fareConfig.perMinute);
      
      fallbackFare = Math.max(fallbackFare, fareConfig.minimumFare);
      
      return {
        [vehicleType]: Math.round(fallbackFare / 10) * 10,
        breakdown: {
          baseFare: fareConfig.baseFare,
          distanceFare: Math.round(estimatedDistance * fareConfig.perKm),
          timeFare: Math.round(estimatedTime * fareConfig.perMinute),
          surgeMultiplier: 1.0,
          minimumFare: fareConfig.minimumFare
        },
        distance: estimatedDistance,
        duration: estimatedTime,
        surgeLevel: 'Normal',
        isEstimate: true
      };
    }
  }

  /**
   * Get current surge multiplier based on demand and supply
   */
  getCurrentSurgeMultiplier() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Peak hours have higher surge
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return this.surgeMultipliers.moderate;
    }

    // Weekend nights
    if ((day === 5 || day === 6) && (hour >= 22 || hour <= 2)) {
      return this.surgeMultipliers.slight;
    }

    // Rain/weather conditions (simplified - could integrate weather API)
    const isRainyHour = Math.random() < 0.1; // 10% chance of rain
    if (isRainyHour) {
      return this.surgeMultipliers.slight;
    }

    return this.surgeMultipliers.normal;
  }

  /**
   * Get surge level text
   */
  getSurgeLevelText(multiplier) {
    if (multiplier >= 2.5) return 'Very High Demand';
    if (multiplier >= 2.0) return 'High Demand';
    if (multiplier >= 1.5) return 'Increased Demand';
    if (multiplier >= 1.2) return 'Slight Increase';
    return 'Normal';
  }

  /**
   * Calculate all vehicle fares for comparison
   */
  async calculateAllVehicleFares(pickupAddress, destinationAddress) {
    const vehicleTypes = ['car', 'bike', 'auto'];
    const fares = {};

    for (const vehicleType of vehicleTypes) {
      try {
        const fareData = await this.calculateRealisticFare(
          pickupAddress, 
          destinationAddress, 
          vehicleType
        );
        fares[vehicleType] = fareData[vehicleType];
      } catch (error) {
        console.error(`Error calculating fare for ${vehicleType}:`, error);
        // Use fallback fare
        const fareConfig = this.fareStructure[vehicleType];
        fares[vehicleType] = fareConfig.minimumFare;
      }
    }

    return fares;
  }

  /**
   * Get real-time traffic update for ongoing ride
   */
  async getTrafficUpdate(currentLocation, destinationLocation) {
    try {
      const routeResult = await openStreetMapService.calculateRoute(
        currentLocation,
        destinationLocation
      );

      if (!routeResult.success) {
        return {
          success: false,
          message: 'Unable to get traffic update'
        };
      }

      const distanceKm = routeResult.data.distance / 1000;
      const baseTimeMinutes = routeResult.data.duration / 60;
      const trafficMultiplier = this.getCurrentTrafficMultiplier();
      const adjustedTime = Math.round(baseTimeMinutes * trafficMultiplier);

      return {
        success: true,
        remainingDistance: distanceKm,
        estimatedTime: adjustedTime,
        trafficCondition: this.getTrafficConditionText(trafficMultiplier),
        alternativeRoutes: routeResult.data.steps?.length > 0
      };

    } catch (error) {
      console.error('Traffic update error:', error);
      return {
        success: false,
        message: 'Traffic service unavailable'
      };
    }
  }
}

module.exports = new RealWorldCalculations();