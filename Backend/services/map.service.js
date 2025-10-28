const axios = require("axios");
const captainModel = require("../models/captain.model");

/**
 * Validates Google Maps API key
 */
const validateApiKey = () => {
  const apiKey = process.env.GOOGLE_MAPS_API;
  
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured. Please set GOOGLE_MAPS_API in your environment variables.');
  }
  
  if (apiKey === 'YOUR_REAL_API_KEY_HERE') {
    throw new Error('Google Maps API key is still set to placeholder value. Please configure a real API key.');
  }
  
  return apiKey;
};

/**
 * Rate limiter for API requests
 */
class ApiRateLimiter {
  constructor() {
    this.requests = [];
    this.maxRequestsPerSecond = 10;
    this.maxRequestsPerMinute = 600;
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
      await new Promise(resolve => setTimeout(resolve, 100));
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
  
  const apiKey = validateApiKey();
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address.trim()
  )}&key=${apiKey}&region=LK&language=en`;

  try {
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'QuickRide-Backend/1.0'
      }
    });
    
    if (response.data.status === "OK" && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        ltd: location.lat,
        lng: location.lng,
        formatted_address: response.data.results[0].formatted_address
      };
    } else if (response.data.status === "ZERO_RESULTS") {
      throw new Error("No results found for the given address");
    } else if (response.data.status === "OVER_QUERY_LIMIT") {
      throw new Error("API quota exceeded. Please try again later.");
    } else if (response.data.status === "REQUEST_DENIED") {
      throw new Error("API request denied. Please check your API key configuration.");
    } else {
      throw new Error(`Geocoding failed: ${response.data.status} - ${response.data.error_message || 'Unknown error'}`);
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    
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
  
  const apiKey = validateApiKey();
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin.trim()
  )}&destinations=${encodeURIComponent(destination.trim())}&key=${apiKey}&units=metric&mode=driving&traffic_model=best_guess&departure_time=now&language=en`;

  try {
    const response = await axios.get(url, {
      timeout: 15000, // 15 second timeout
      headers: {
        'User-Agent': 'QuickRide-Backend/1.0'
      }
    });
    
    if (response.data.status === "OK") {
      const element = response.data.rows[0].elements[0];
      
      if (element.status === "ZERO_RESULTS") {
        throw new Error("No routes found between the specified locations");
      } else if (element.status === "NOT_FOUND") {
        throw new Error("One or both locations could not be found");
      } else if (element.status !== "OK") {
        throw new Error(`Route calculation failed: ${element.status}`);
      }

      return {
        distance: element.distance,
        duration: element.duration,
        duration_in_traffic: element.duration_in_traffic || element.duration,
        status: element.status
      };
    } else if (response.data.status === "OVER_QUERY_LIMIT") {
      throw new Error("API quota exceeded. Please try again later.");
    } else if (response.data.status === "REQUEST_DENIED") {
      throw new Error("API request denied. Please check your API key configuration.");
    } else {
      throw new Error(`Distance Matrix API failed: ${response.data.status} - ${response.data.error_message || 'Unknown error'}`);
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    
    console.error('Distance Matrix error:', error.message);
    throw error;
  }
};

module.exports.getAutoCompleteSuggestions = async (input) => {
  if (!input) {
    throw new Error("query is required");
  }

  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      return response.data.predictions
        .map((prediction) => prediction.description)
        .filter((value) => value);
    } else {
      throw new Error("Unable to fetch suggestions");
    }
  } catch (err) {
    console.log(err.message);
    throw err;
  }
};

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius, vehicleType) => {
  // radius in km
  
  try {
    const captains = await captainModel.find({
      location: {
        $geoWithin: {
          $centerSphere: [[lng, ltd], radius / 6371],
        },
      },
      "vehicle.type": vehicleType,
    });
    return captains;
  } catch (error) {
    throw new Error("Error in getting captain in radius: " + error.message);
  }
};
