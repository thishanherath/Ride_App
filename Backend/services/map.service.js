const axios = require("axios");
const captainModel = require("../models/captain.model");
const openStreetMapService = require("./openstreetmap.service");
const geocodingCache = require("./geocodingCache");

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

  const trimmedAddress = address.trim();
  
  // Check cache first for instant response
  const cachedCoordinates = geocodingCache.get(trimmedAddress);
  if (cachedCoordinates) {
    console.log(`⚡ Cache HIT for address: ${trimmedAddress.substring(0, 50)}...`);
    return {
      ltd: cachedCoordinates.ltd,
      lng: cachedCoordinates.lng,
      formatted_address: trimmedAddress,
      fromCache: true
    };
  }

  console.log(`🔍 Cache MISS for address: ${trimmedAddress.substring(0, 50)}...`);
  await rateLimiter.waitForRateLimit();
  
  try {
    const result = await openStreetMapService.geocodeAddress(trimmedAddress);
    
    if (result.success) {
      const coordinates = {
        ltd: result.data.latitude,
        lng: result.data.longitude,
        formatted_address: result.data.display_name
      };
      
      // Cache the result for future use
      geocodingCache.set(trimmedAddress, {
        ltd: coordinates.ltd,
        lng: coordinates.lng
      });
      
      return coordinates;
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
  const startTime = Date.now();
  
  try {
    console.log(`🔍 FAST SEARCH: Captains near [${ltd}, ${lng}] within ${radius}km for ${vehicleType}`);
    
    // OPTIMIZED: Single query with all conditions and lean() for speed
    const captains = await captainModel.find({
      location: {
        $geoWithin: {
          $centerSphere: [[lng, ltd], radius / 6371],
        },
      },
      "vehicle.type": vehicleType,
      status: "active", // Only active captains
      socketId: { $exists: true, $ne: null } // Only connected captains
    })
    .select('fullname vehicle location socketId status rating') // Only select needed fields
    .lean() // Use lean() for faster queries (returns plain objects)
    .limit(20); // Limit results for performance
    
    const queryTime = Date.now() - startTime;
    console.log(`⚡ FAST SEARCH COMPLETE: Found ${captains.length} captains in ${queryTime}ms`);
    
    // Performance warning
    if (queryTime > 500) {
      console.warn(`⚠️ Slow captain search: ${queryTime}ms (target: <500ms)`);
    }
    
    // Log found captains (only in development)
    if (process.env.NODE_ENV !== 'production') {
      captains.forEach(captain => {
        console.log(`👨‍✈️ ${captain.fullname.firstname} ${captain.fullname.lastname} - ${captain.vehicle.type} - Connected: ${!!captain.socketId}`);
      });
    }
    
    // If no captains found, provide debugging info
    if (captains.length === 0) {
      console.log(`🔍 DEBUG: No captains found. Running diagnostic...`);
      
      // Quick diagnostic queries (only run when no captains found)
      const [totalCaptains, activeCaptains, connectedCaptains, vehicleTypeCaptains] = await Promise.all([
        captainModel.countDocuments({}),
        captainModel.countDocuments({ status: "active" }),
        captainModel.countDocuments({ socketId: { $exists: true, $ne: null } }),
        captainModel.countDocuments({ "vehicle.type": vehicleType })
      ]);
      
      console.log(`📊 DIAGNOSTIC: Total: ${totalCaptains}, Active: ${activeCaptains}, Connected: ${connectedCaptains}, ${vehicleType}: ${vehicleTypeCaptains}`);
    }
    
    return captains;
  } catch (error) {
    const queryTime = Date.now() - startTime;
    console.error(`❌ FAST SEARCH FAILED after ${queryTime}ms:`, error.message);
    throw new Error("Error in getting captain in radius: " + error.message);
  }
};
