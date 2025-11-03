const captainModel = require("../models/captain.model");
const rideModel = require("../models/ride.model");
const mapService = require("./map.service");
const crypto = require("crypto");

const getFare = async (pickup, destination) => {
  if (!pickup || !destination) {
    throw new Error("Pickup and destination are required");
  }

  try {
    // Use realistic calculations service
    const realWorldCalculations = require('./realWorldCalculations');
    
    console.log('🧮 Calculating realistic fare for:', {
      pickup: pickup.substring(0, 50) + '...',
      destination: destination.substring(0, 50) + '...'
    });

    // Get realistic fares for all vehicle types
    const fareData = await realWorldCalculations.calculateAllVehicleFares(pickup, destination);
    
    // Get distance and time information
    let distanceTime;
    try {
      distanceTime = await mapService.getDistanceTime(pickup, destination);
    } catch (error) {
      console.log("Map service unavailable, using realistic fallback");
      distanceTime = {
        distance: { 
          value: fareData.distance ? fareData.distance * 1000 : 5000,
          text: fareData.distance ? `${fareData.distance.toFixed(1)} km` : '5.0 km'
        },
        duration: { 
          value: fareData.duration ? fareData.duration * 60 : 900,
          text: fareData.duration ? `${fareData.duration} min` : '15 min'
        }
      };
    }

    console.log('✅ Realistic fares calculated:', {
      car: fareData.car,
      auto: fareData.auto,
      bike: fareData.bike,
      distance: distanceTime.distance.text,
      duration: distanceTime.duration.text
    });

    return { 
      fare: fareData, 
      distanceTime,
      breakdown: fareData.breakdown,
      surgeLevel: fareData.surgeLevel
    };

  } catch (error) {
    console.error('❌ Realistic fare calculation failed, using fallback:', error.message);
    
    // Enhanced fallback calculation
    let distanceTime;
    try {
      distanceTime = await mapService.getDistanceTime(pickup, destination);
    } catch (mapError) {
      console.log("Map service also unavailable, using static fallback");
      distanceTime = {
        distance: { value: 5000, text: '5.0 km' },
        duration: { value: 900, text: '15 min' }
      };
    }

    // Time-based surge pricing for fallback
    const now = new Date();
    const hour = now.getHours();
    let surgeMultiplier = 1.0;
    
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      surgeMultiplier = 1.3; // Peak hours
    } else if ((hour >= 22 || hour <= 2) && (now.getDay() === 5 || now.getDay() === 6)) {
      surgeMultiplier = 1.2; // Weekend nights
    }

    // Enhanced Sri Lankan Rupee (LKR) pricing with realistic rates
    const baseFare = {
      auto: 120,    // Base fare for auto-rickshaw
      car: 200,     // Base fare for car
      bike: 80,     // Base fare for motorcycle
    };

    const perKmRate = {
      auto: 35,     // Per kilometer rate for auto
      car: 45,      // Per kilometer rate for car
      bike: 25,     // Per kilometer rate for motorcycle
    };

    const perMinuteRate = {
      auto: 6,      // Per minute rate for auto
      car: 8,       // Per minute rate for car
      bike: 5,      // Per minute rate for motorcycle
    };

    const minimumFare = {
      auto: 150,
      car: 200,
      bike: 120
    };

    const distanceKm = distanceTime.distance.value / 1000;
    const durationMin = distanceTime.duration.value / 60;

    const fare = {
      auto: Math.max(
        Math.round((baseFare.auto + distanceKm * perKmRate.auto + durationMin * perMinuteRate.auto) * surgeMultiplier),
        minimumFare.auto
      ),
      car: Math.max(
        Math.round((baseFare.car + distanceKm * perKmRate.car + durationMin * perMinuteRate.car) * surgeMultiplier),
        minimumFare.car
      ),
      bike: Math.max(
        Math.round((baseFare.bike + distanceKm * perKmRate.bike + durationMin * perMinuteRate.bike) * surgeMultiplier),
        minimumFare.bike
      ),
    };

    return { 
      fare, 
      distanceTime,
      surgeLevel: surgeMultiplier > 1.2 ? 'High Demand' : surgeMultiplier > 1.0 ? 'Slight Increase' : 'Normal',
      isEstimate: true
    };
  }
};

module.exports.getFare = getFare;

function getOtp(num) {
  function generateOtp(num) {
    const otp = crypto
      .randomInt(Math.pow(10, num - 1), Math.pow(10, num))
      .toString();
    return otp;
  }
  return generateOtp(num);
}

module.exports.createRide = async ({
  user,
  pickup,
  destination,
  vehicleType,
}) => {
  if (!user || !pickup || !destination || !vehicleType) {
    throw new Error("All fields are required");
  }

  try {
    const { fare, distanceTime } = await getFare(pickup, destination);

    const ride = rideModel.create({
      user,
      pickup,
      destination,
      fare: fare[vehicleType],
      vehicle: vehicleType,
      distance: distanceTime.distance.value,
      duration: distanceTime.duration.value,
      otp: getOtp(6), // Generate 6-digit OTP
    });

    return ride;
  } catch (error) {
    throw new Error("Error occured while creating ride.");
  }
};

// when ride request is accepted by captain
module.exports.confirmRide = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  try {
    // Find the ride first
    const ride = await rideModel.findOne({ _id: rideId });
    if (!ride) {
      throw new Error("Ride not found");
    }

    // Check if ride is still pending
    if (ride.status !== "pending") {
      throw new Error("Ride is no longer available for acceptance");
    }

    // Update captain assignment
    ride.captain = captain._id;
    
    // Use the new updateStatus method for proper tracking
    await ride.updateStatus("accepted", "captain", "Driver accepted the ride");

    const captainData = await captainModel.findOne({ _id: captain._id });
    captainData.rides.push(rideId);
    await captainData.save();

    // Return the updated ride with populated fields
    const updatedRide = await rideModel
      .findOne({ _id: rideId })
      .populate("user")
      .populate("captain")
      .select("+otp");

    return updatedRide;
  } catch (error) {
    console.log(error)
    throw new Error("Error occured while confirming ride.");
  }
};

module.exports.startRide = async ({ rideId, otp, captain }) => {
  if (!rideId || !otp) {
    throw new Error("Ride id and OTP are required");
  }

  const ride = await rideModel
    .findOne({
      _id: rideId,
    })
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "accepted") {
    throw new Error("Ride not accepted");
  }

  if (ride.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  // Use the new updateStatus method for proper tracking
  await ride.updateStatus("ongoing", "captain", "Ride started with OTP verification");

  return ride;
};

module.exports.startRideWithoutOTP = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  const ride = await rideModel
    .findOne({
      _id: rideId,
    })
    .populate("user")
    .populate("captain");

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "accepted") {
    throw new Error("Ride not accepted");
  }

  // Verify the captain is the one assigned to this ride
  if (ride.captain._id.toString() !== captain._id.toString()) {
    throw new Error("Unauthorized: You are not assigned to this ride");
  }

  // Use the new updateStatus method for proper tracking
  await ride.updateStatus("ongoing", "captain", "Ride started without OTP verification");

  // Return updated ride with populated fields
  const updatedRide = await rideModel
    .findOne({
      _id: rideId,
    })
    .populate("user")
    .populate("captain");

  return updatedRide;
};

module.exports.endRide = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  const ride = await rideModel
    .findOne({
      _id: rideId,
      captain: captain._id,
    })
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "ongoing") {
    throw new Error("Ride not ongoing");
  }

  // Calculate actual duration if startedAt exists
  if (ride.startedAt) {
    const actualDuration = Math.floor((new Date() - ride.startedAt) / 1000); // in seconds
    ride.actualDuration = actualDuration;
  }

  // Use the new updateStatus method for proper tracking
  await ride.updateStatus("completed", "captain", "Ride completed by driver");

  return ride;
};

module.exports.cancelRide = async ({ rideId, cancelledBy, reason }) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  const ride = await rideModel
    .findOne({ _id: rideId })
    .populate("user")
    .populate("captain");

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status === "completed" || ride.status === "cancelled") {
    throw new Error("Ride cannot be cancelled");
  }

  // Use the new updateStatus method for proper tracking
  await ride.updateStatus("cancelled", cancelledBy, reason || "Ride cancelled");

  return ride;
};
