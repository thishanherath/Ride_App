const axios = require("axios");
const captainModel = require("../models/captain.model");
const openStreetMapService = require("./openstreetmap.service");

/**
 * Rate limiter for API requests (lighter for free services)
 */
class ApiRateLimiter {
  constructor() {
    this.requests = [];
    this.maxRequestsPerSecond = 5; // Conservative for free services
    this.maxRequestsPerMinute = 300;
  }

  canMakeRequest() {
    const now = Date.now();
    
    // Remove requests older than 1 minute
    this.requests = this.requests.filter(time => now - time < 60000);
    
    // Check per-second limit
    const recentRequests = this.requests.filter(time => now - time < 1000);
    if (recentRequests.length >= this.maxRequestsPerSecond) {
      return false;
    }
    
    // Check per-minute limit
    if (this.requests.length >= this.maxRequestsPerMinute) {
      return false;
    }
    
    return true;
  }

  recordRequest() {
    this.requests.push(Date.now());
  }

  async waitForRateLimit() {
    while (!this.canMakeRequest()) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    this.recordRequest();
  }
}

const rateLimiter = new ApiRateLimiter();

module.exports.getAddressCoordinate = async (address) => {
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    throw new Error('Valid address is required');
  }

  await rateLimiter.waitForRateLimit();
  
  try {
    const result = await openStreetMapService.geocodeAddress(address.trim());
    
    if (result.success) {
      return {
        ltd: result.data.latitude,
        lng: result.data.longitude,
        formatted_address: result.data.display_name
      };
    } else {
      throw new Error(result.error || "No results found for the given address");
    }
  } catch (error) {
    console.error('Geocoding error:', error.message);
    throw error;
  }
};

module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }
  
  if (typeof origin !== 'string' || typeof destination !== 'string') {
    throw new Error("Origin and destination must be strings");
  }

  await rateLimiter.waitForRateLimit();
  
  try {
    const result = await openStreetMapService.getDistanceAndDuration(origin.trim(), destination.trim());
    
    if (result.success) {
      return {
        distance: {
          text: result.data.distance.text,
          value: result.data.distance.meters
        },
        duration: {
          text: result.data.duration.text,
          value: result.data.duration.seconds
        },
        duration_in_traffic: {
          text: result.data.duration.text,
          value: result.data.duration.seconds
        },
        status: "OK"
      };
    } else {
      throw new Error(result.error || "Route calculation failed");
    }
  } catch (error) {
    console.error('Distance calculation error:', error.message);
    throw error;
  }
};

module.exports.getAutoCompleteSuggestions = async (input) => {
  if (!input) {
    throw new Error("query is required");
  }

  await rateLimiter.waitForRateLimit();

  try {
    const result = await openStreetMapService.searchPlaces(input, {
      limit: 5,
      countrycode: 'lk' // Sri Lanka - adjust as needed
    });
    
    if (result.success) {
      return result.data
        .map((place) => place.display_name)
        .filter((value) => value);
    } else {
      throw new Error(result.error || "Unable to fetch suggestions");
    }
  } catch (err) {
    console.log(err.message);
    throw err;
  }
};

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius, vehicleType) => {
  // radius in km
  
  try {
    console.log(`🔍 Searching for captains near [${ltd}, ${lng}] within ${radius}km for vehicle type: ${vehicleType}`);
    
    // First, let's see all captains regardless of location and vehicle type
    const allCaptains = await captainModel.find({});
    console.log(`📊 Total captains in database: ${allCaptains.length}`);
    
    // Check captains with the right vehicle type
    const captainsWithVehicleType = await captainModel.find({
      "vehicle.type": vehicleType,
    });
    console.log(`🚗 Captains with vehicle type '${vehicleType}': ${captainsWithVehicleType.length}`);
    
    // Check captains with location data
    const captainsWithLocation = await captainModel.find({
      location: { $exists: true },
      "location.coordinates": { $exists: true, $ne: [] }
    });
    console.log(`📍 Captains with location data: ${captainsWithLocation.length}`);
    
    // Now find captains in radius with correct vehicle type and active status
    const captains = await captainModel.find({
      location: {
        $geoWithin: {
          $centerSphere: [[lng, ltd], radius / 6371],
        },
      },
      "vehicle.type": vehicleType,
      status: "active", // Only active captains should receive rides
      socketId: { $exists: true, $ne: null } // Only connected captains
    });
    
    console.log(`✅ Found ${captains.length} captains in radius with matching vehicle type`);
    
    // Log details of found captains
    captains.forEach(captain => {
      console.log(`👨‍✈️ Captain: ${captain.fullname.firstname} ${captain.fullname.lastname}, Vehicle: ${captain.vehicle.type}, Location: [${captain.location.coordinates}], SocketId: ${captain.socketId ? 'Connected' : 'Not Connected'}`);
    });
    
    return captains;
  } catch (error) {
    console.error("❌ Error in getCaptainsInTheRadius:", error.message);
    throw new Error("Error in getting captain in radius: " + error.message);
  }
};
