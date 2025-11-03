const captainModel = require("../models/captain.model");
const rideModel = require("../models/ride.model");
const mapService = require("./map.service");
const crypto = require("crypto");

const getFare = async (pickup, destination) => {
  if (!pickup || !destination) {
    throw new Error("Pickup and destination are required");
  }

  let distanceTime;
  try {
    distanceTime = await mapService.getDistanceTime(pickup, destination);
  } catch (error) {
    // Fallback for testing without Google Maps API
    console.log("Google Maps API not available, using fallback values");
    distanceTime = {
      distance: { value: 5000 }, // 5km in meters
      duration: { value: 900 }   // 15 minutes in seconds
    };
  }

  // Sri Lankan Rupee (LKR) pricing structure
  // Rates are set for the Sri Lankan market
  const baseFare = {
    auto: 150,    // Base fare for auto-rickshaw in LKR
    car: 250,     // Base fare for car in LKR  
    bike: 100,    // Base fare for motorcycle in LKR
  };

  const perKmRate = {
    auto: 50,     // Per kilometer rate for auto in LKR
    car: 75,      // Per kilometer rate for car in LKR
    bike: 40,     // Per kilometer rate for motorcycle in LKR
  };

  const perMinuteRate = {
    auto: 10,     // Per minute rate for auto in LKR
    car: 15,      // Per minute rate for car in LKR
    bike: 7.5,    // Per minute rate for motorcycle in LKR
  };

  const fare = {
    auto: Math.round(
      baseFare.auto +
        (distanceTime.distance.value / 1000) * perKmRate.auto +
        (distanceTime.duration.value / 60) * perMinuteRate.auto
    ),
    car: Math.round(
      baseFare.car +
        (distanceTime.distance.value / 1000) * perKmRate.car +
        (distanceTime.duration.value / 60) * perMinuteRate.car
    ),
    bike: Math.round(
      baseFare.bike +
        (distanceTime.distance.value / 1000) * perKmRate.bike +
        (distanceTime.duration.value / 60) * perMinuteRate.bike
    ),
  };

  return { fare, distanceTime };
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
