/**
 * OpenStreetMap Service
 * Free alternative to Google Maps services
 * Provides geocoding and routing using open-source APIs
 */

const axios = require('axios');

class OpenStreetMapService {
  constructor() {
    this.nominatimBaseUrl = 'https://nominatim.openstreetmap.org';
    this.osrmBaseUrl = 'https://router.project-osrm.org/route/v1';
  }

  /**
   * Geocode an address to coordinates
   * @param {string} address - Address to geocode
   * @returns {Promise<Object>} Coordinates and details
   */
  async geocodeAddress(address) {
    try {
      const response = await axios.get(`${this.nominatimBaseUrl}/search`, {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'RideApp/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          success: true,
          data: {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            display_name: result.display_name,
            address: result.address
          }
        };
      }

      return {
        success: false,
        error: 'Address not found'
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return {
        success: false,
        error: 'Geocoding service unavailable'
      };
    }
  }

  /**
   * Reverse geocode coordinates to address
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Address details
   */
  async reverseGeocode(lat, lng) {
    try {
      const response = await axios.get(`${this.nominatimBaseUrl}/reverse`, {
        params: {
          lat,
          lon: lng,
          format: 'json',
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'RideApp/1.0'
        }
      });

      if (response.data) {
        return {
          success: true,
          data: {
            display_name: response.data.display_name,
            address: response.data.address
          }
        };
      }

      return {
        success: false,
        error: 'Location not found'
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        success: false,
        error: 'Reverse geocoding service unavailable'
      };
    }
  }

  /**
   * Calculate route between two points
   * @param {Object} start - Start coordinates {lat, lng}
   * @param {Object} end - End coordinates {lat, lng}
   * @returns {Promise<Object>} Route details
   */
  async calculateRoute(start, end) {
    try {
      const response = await axios.get(
        `${this.osrmBaseUrl}/driving/${start.lng},${start.lat};${end.lng},${end.lat}`,
        {
          params: {
            overview: 'full',
            geometries: 'geojson',
            steps: true
          }
        }
      );

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        
        return {
          success: true,
          data: {
            distance: Math.round(route.distance), // meters
            duration: Math.round(route.duration), // seconds
            geometry: route.geometry,
            steps: route.legs[0]?.steps || []
          }
        };
      }

      return {
        success: false,
        error: 'Route not found'
      };
    } catch (error) {
      console.error('Routing error:', error);
      return {
        success: false,
        error: 'Routing service unavailable'
      };
    }
  }

  /**
   * Get distance and duration between two addresses
   * @param {string} pickup - Pickup address
   * @param {string} destination - Destination address
   * @returns {Promise<Object>} Distance and duration
   */
  async getDistanceAndDuration(pickup, destination) {
    try {
      // Geocode both addresses
      const pickupCoords = await this.geocodeAddress(pickup);
      const destCoords = await this.geocodeAddress(destination);

      if (!pickupCoords.success || !destCoords.success) {
        return {
          success: false,
          error: 'Could not geocode addresses'
        };
      }

      // Calculate route
      const route = await this.calculateRoute(
        {
          lat: pickupCoords.data.latitude,
          lng: pickupCoords.data.longitude
        },
        {
          lat: destCoords.data.latitude,
          lng: destCoords.data.longitude
        }
      );

      if (!route.success) {
        return route;
      }

      return {
        success: true,
        data: {
          distance: {
            meters: route.data.distance,
            kilometers: (route.data.distance / 1000).toFixed(2),
            text: `${(route.data.distance / 1000).toFixed(1)} km`
          },
          duration: {
            seconds: route.data.duration,
            minutes: Math.round(route.data.duration / 60),
            text: `${Math.round(route.data.duration / 60)} min`
          },
          pickup: pickupCoords.data,
          destination: destCoords.data
        }
      };
    } catch (error) {
      console.error('Distance calculation error:', error);
      return {
        success: false,
        error: 'Distance calculation failed'
      };
    }
  }

  /**
   * Search for places/addresses
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchPlaces(query, options = {}) {
    try {
      const { limit = 5, countrycode = null } = options;
      
      const params = {
        q: query,
        format: 'json',
        limit,
        addressdetails: 1
      };

      if (countrycode) {
        params.countrycodes = countrycode;
      }

      const response = await axios.get(`${this.nominatimBaseUrl}/search`, {
        params,
        headers: {
          'User-Agent': 'RideApp/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        const results = response.data.map(item => ({
          display_name: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          address: item.address,
          type: item.type,
          importance: item.importance
        }));

        return {
          success: true,
          data: results
        };
      }

      return {
        success: true,
        data: []
      };
    } catch (error) {
      console.error('Place search error:', error);
      return {
        success: false,
        error: 'Place search service unavailable'
      };
    }
  }
}

module.exports = new OpenStreetMapService();