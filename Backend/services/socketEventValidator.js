const mongoose = require('mongoose');

class SocketEventValidator {
  constructor() {
    this.validators = new Map();
    this.setupValidators();
  }

  setupValidators() {
    // Join event validation
    this.validators.set('join', (data) => {
      const errors = [];
      
      if (!data) {
        errors.push('Data is required');
        return { valid: false, errors };
      }

      if (!data.userId) {
        errors.push('userId is required');
      } else if (!mongoose.Types.ObjectId.isValid(data.userId)) {
        errors.push('userId must be a valid ObjectId');
      }

      if (!data.userType) {
        errors.push('userType is required');
      } else if (!['user', 'captain'].includes(data.userType)) {
        errors.push('userType must be either "user" or "captain"');
      }

      return {
        valid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? {
          userId: data.userId.toString(),
          userType: data.userType
        } : null
      };
    });

    // Location update validation
    this.validators.set('update-location-captain', (data) => {
      const errors = [];
      
      if (!data) {
        errors.push('Data is required');
        return { valid: false, errors };
      }

      if (!data.userId) {
        errors.push('userId is required');
      } else if (!mongoose.Types.ObjectId.isValid(data.userId)) {
        errors.push('userId must be a valid ObjectId');
      }

      if (!data.location) {
        errors.push('location is required');
      } else {
        if (typeof data.location.ltd !== 'number') {
          errors.push('location.ltd must be a number');
        } else if (data.location.ltd < -90 || data.location.ltd > 90) {
          errors.push('location.ltd must be between -90 and 90');
        }

        if (typeof data.location.lng !== 'number') {
          errors.push('location.lng must be a number');
        } else if (data.location.lng < -180 || data.location.lng > 180) {
          errors.push('location.lng must be between -180 and 180');
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? {
          userId: data.userId.toString(),
          location: {
            ltd: parseFloat(data.location.ltd),
            lng: parseFloat(data.location.lng)
          }
        } : null
      };
    });

    // Message validation
    this.validators.set('message', (data) => {
      const errors = [];
      
      if (!data) {
        errors.push('Data is required');
        return { valid: false, errors };
      }

      if (!data.rideId) {
        errors.push('rideId is required');
      } else if (!mongoose.Types.ObjectId.isValid(data.rideId)) {
        errors.push('rideId must be a valid ObjectId');
      }

      if (!data.msg) {
        errors.push('msg is required');
      } else if (typeof data.msg !== 'string') {
        errors.push('msg must be a string');
      } else if (data.msg.length > 1000) {
        errors.push('msg must be less than 1000 characters');
      }

      if (!data.userType) {
        errors.push('userType is required');
      } else if (!['user', 'captain'].includes(data.userType)) {
        errors.push('userType must be either "user" or "captain"');
      }

      return {
        valid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? {
          rideId: data.rideId.toString(),
          msg: data.msg.trim(),
          userType: data.userType,
          time: data.time || new Date().toISOString()
        } : null
      };
    });

    // Room join validation
    this.validators.set('join-room', (data) => {
      const errors = [];
      
      if (!data) {
        errors.push('Room ID is required');
        return { valid: false, errors };
      }

      const roomId = typeof data === 'string' ? data : data.roomId;
      
      if (!roomId) {
        errors.push('roomId is required');
      } else if (typeof roomId !== 'string') {
        errors.push('roomId must be a string');
      } else if (!mongoose.Types.ObjectId.isValid(roomId)) {
        errors.push('roomId must be a valid ObjectId');
      }

      return {
        valid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? roomId : null
      };
    });

    // Ride status update validation
    this.validators.set('ride-status-update', (data) => {
      const errors = [];
      const validStatuses = ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'];
      
      if (!data) {
        errors.push('Data is required');
        return { valid: false, errors };
      }

      if (!data.rideId) {
        errors.push('rideId is required');
      } else if (!mongoose.Types.ObjectId.isValid(data.rideId)) {
        errors.push('rideId must be a valid ObjectId');
      }

      if (!data.status) {
        errors.push('status is required');
      } else if (!validStatuses.includes(data.status)) {
        errors.push(`status must be one of: ${validStatuses.join(', ')}`);
      }

      if (data.reason && typeof data.reason !== 'string') {
        errors.push('reason must be a string');
      }

      return {
        valid: errors.length === 0,
        errors,
        sanitizedData: errors.length === 0 ? {
          rideId: data.rideId.toString(),
          status: data.status,
          reason: data.reason || null,
          updatedBy: data.updatedBy || 'system'
        } : null
      };
    });
  }

  // Validate event data
  validate(eventName, data) {
    const validator = this.validators.get(eventName);
    
    if (!validator) {
      return {
        valid: false,
        errors: [`No validator found for event: ${eventName}`],
        sanitizedData: null
      };
    }

    try {
      return validator(data);
    } catch (error) {
      return {
        valid: false,
        errors: [`Validation error: ${error.message}`],
        sanitizedData: null
      };
    }
  }

  // Add custom validator
  addValidator(eventName, validatorFunction) {
    if (typeof validatorFunction !== 'function') {
      throw new Error('Validator must be a function');
    }
    
    this.validators.set(eventName, validatorFunction);
  }

  // Remove validator
  removeValidator(eventName) {
    return this.validators.delete(eventName);
  }

  // Get all registered event names
  getRegisteredEvents() {
    return Array.from(this.validators.keys());
  }

  // Validate multiple events
  validateBatch(events) {
    const results = {};
    
    for (const [eventName, data] of Object.entries(events)) {
      results[eventName] = this.validate(eventName, data);
    }
    
    return results;
  }

  // Check if event is supported
  isEventSupported(eventName) {
    return this.validators.has(eventName);
  }
}

// Create singleton instance
const socketEventValidator = new SocketEventValidator();

module.exports = socketEventValidator;