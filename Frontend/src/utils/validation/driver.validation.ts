/**
 * Validation functions for driver and vehicle data
 * Used in driver acceptance progress feature
 */

import { Driver, Vehicle, RideAcceptance, Location } from '../../types/driver.types';

// Driver validation functions
export const validateDriver = (driver: Partial<Driver>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!driver.id || typeof driver.id !== 'string' || driver.id.trim().length === 0) {
    errors.push('Driver ID is required and must be a non-empty string');
  }

  if (!driver.name || typeof driver.name !== 'string' || driver.name.trim().length === 0) {
    errors.push('Driver name is required and must be a non-empty string');
  }

  if (driver.name && driver.name.length > 100) {
    errors.push('Driver name must be less than 100 characters');
  }

  if (!driver.photo || typeof driver.photo !== 'string') {
    errors.push('Driver photo URL is required');
  }

  if (typeof driver.rating !== 'number' || driver.rating < 0 || driver.rating > 5) {
    errors.push('Driver rating must be a number between 0 and 5');
  }

  if (typeof driver.totalRides !== 'number' || driver.totalRides < 0) {
    errors.push('Total rides must be a non-negative number');
  }

  if (driver.phoneNumber && typeof driver.phoneNumber !== 'string') {
    errors.push('Phone number must be a string');
  }

  if (typeof driver.isOnline !== 'boolean') {
    errors.push('Online status must be a boolean');
  }

  if (!driver.currentLocation) {
    errors.push('Current location is required');
  } else {
    const locationValidation = validateLocation(driver.currentLocation);
    if (!locationValidation.isValid) {
      errors.push(...locationValidation.errors.map(err => `Current location: ${err}`));
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Vehicle validation functions
export const validateVehicle = (vehicle: Partial<Vehicle>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const validVehicleTypes = ['sedan', 'suv', 'hatchback', 'coupe', 'wagon'];

  if (!vehicle.id || typeof vehicle.id !== 'string' || vehicle.id.trim().length === 0) {
    errors.push('Vehicle ID is required and must be a non-empty string');
  }

  if (!vehicle.make || typeof vehicle.make !== 'string' || vehicle.make.trim().length === 0) {
    errors.push('Vehicle make is required and must be a non-empty string');
  }

  if (!vehicle.model || typeof vehicle.model !== 'string' || vehicle.model.trim().length === 0) {
    errors.push('Vehicle model is required and must be a non-empty string');
  }

  if (!vehicle.color || typeof vehicle.color !== 'string' || vehicle.color.trim().length === 0) {
    errors.push('Vehicle color is required and must be a non-empty string');
  }

  if (!vehicle.licensePlate || typeof vehicle.licensePlate !== 'string' || vehicle.licensePlate.trim().length === 0) {
    errors.push('License plate is required and must be a non-empty string');
  }

  if (vehicle.licensePlate && vehicle.licensePlate.length > 20) {
    errors.push('License plate must be less than 20 characters');
  }

  if (!vehicle.type || !validVehicleTypes.includes(vehicle.type)) {
    errors.push(`Vehicle type must be one of: ${validVehicleTypes.join(', ')}`);
  }

  if (typeof vehicle.year !== 'number' || vehicle.year < 1900 || vehicle.year > new Date().getFullYear() + 1) {
    errors.push('Vehicle year must be a valid year');
  }

  if (typeof vehicle.capacity !== 'number' || vehicle.capacity < 1 || vehicle.capacity > 20) {
    errors.push('Vehicle capacity must be between 1 and 20');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Location validation functions
export const validateLocation = (location: Partial<Location>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (typeof location.latitude !== 'number' || location.latitude < -90 || location.latitude > 90) {
    errors.push('Latitude must be a number between -90 and 90');
  }

  if (typeof location.longitude !== 'number' || location.longitude < -180 || location.longitude > 180) {
    errors.push('Longitude must be a number between -180 and 180');
  }

  if (location.address && typeof location.address !== 'string') {
    errors.push('Address must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// RideAcceptance validation functions
export const validateRideAcceptance = (acceptance: Partial<RideAcceptance>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!acceptance.rideId || typeof acceptance.rideId !== 'string' || acceptance.rideId.trim().length === 0) {
    errors.push('Ride ID is required and must be a non-empty string');
  }

  if (!acceptance.driverId || typeof acceptance.driverId !== 'string' || acceptance.driverId.trim().length === 0) {
    errors.push('Driver ID is required and must be a non-empty string');
  }

  if (!acceptance.acceptedAt || !(acceptance.acceptedAt instanceof Date)) {
    errors.push('Accepted at must be a valid Date');
  }

  if (typeof acceptance.estimatedArrival !== 'number' || acceptance.estimatedArrival < 0) {
    errors.push('Estimated arrival must be a non-negative number');
  }

  if (!acceptance.driver) {
    errors.push('Driver information is required');
  } else {
    const driverValidation = validateDriver(acceptance.driver);
    if (!driverValidation.isValid) {
      errors.push(...driverValidation.errors.map(err => `Driver: ${err}`));
    }
  }

  if (!acceptance.vehicle) {
    errors.push('Vehicle information is required');
  } else {
    const vehicleValidation = validateVehicle(acceptance.vehicle);
    if (!vehicleValidation.isValid) {
      errors.push(...vehicleValidation.errors.map(err => `Vehicle: ${err}`));
    }
  }

  if (!acceptance.pickupLocation) {
    errors.push('Pickup location is required');
  } else {
    const pickupValidation = validateLocation(acceptance.pickupLocation);
    if (!pickupValidation.isValid) {
      errors.push(...pickupValidation.errors.map(err => `Pickup location: ${err}`));
    }
  }

  if (!acceptance.destinationLocation) {
    errors.push('Destination location is required');
  } else {
    const destinationValidation = validateLocation(acceptance.destinationLocation);
    if (!destinationValidation.isValid) {
      errors.push(...destinationValidation.errors.map(err => `Destination location: ${err}`));
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Utility functions for data sanitization
export const sanitizeDriverData = (driver: Partial<Driver>): Partial<Driver> => {
  return {
    ...driver,
    name: driver.name?.trim(),
    phoneNumber: driver.phoneNumber?.trim(),
    rating: driver.rating ? Math.round(driver.rating * 10) / 10 : driver.rating, // Round to 1 decimal
    totalRides: driver.totalRides ? Math.max(0, Math.floor(driver.totalRides)) : driver.totalRides
  };
};

export const sanitizeVehicleData = (vehicle: Partial<Vehicle>): Partial<Vehicle> => {
  return {
    ...vehicle,
    make: vehicle.make?.trim(),
    model: vehicle.model?.trim(),
    color: vehicle.color?.trim(),
    licensePlate: vehicle.licensePlate?.trim().toUpperCase(),
    capacity: vehicle.capacity ? Math.max(1, Math.floor(vehicle.capacity)) : vehicle.capacity
  };
};

// Type guards
export const isValidDriver = (obj: any): obj is Driver => {
  return validateDriver(obj).isValid;
};

export const isValidVehicle = (obj: any): obj is Vehicle => {
  return validateVehicle(obj).isValid;
};

export const isValidRideAcceptance = (obj: any): obj is RideAcceptance => {
  return validateRideAcceptance(obj).isValid;
};