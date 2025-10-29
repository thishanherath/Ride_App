const rideService = require("../services/ride.service");
const { validationResult } = require("express-validator");
const mapService = require("../services/map.service");
const { sendMessageToSocketId } = require("../socket");
const rideModel = require("../models/ride.model");
const userModel = require("../models/user.model");

module.exports.chatDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const ride = await rideModel
      .findOne({ _id: id })
      .populate("user", "socketId fullname phone")
      .populate("captain", "socketId fullname phone");

    if (!ride) {
      return res.status(400).json({ message: "Ride not found" });
    }

    const response = {
      user: {
        socketId: ride.user?.socketId,
        fullname: ride.user?.fullname,
        phone: ride.user?.phone,
        _id: ride.user?._id,
      },
      captain: {
        socketId: ride.captain?.socketId,
        fullname: ride.captain?.fullname,
        phone: ride.captain?.phone,
        _id: ride.captain?._id,
      },
      messages: ride.messages,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination, vehicleType } = req.body;

  try {
    const ride = await rideService.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
    });

    const user = await userModel.findOne({ _id: req.user._id });
    if (user) {
      user.rides.push(ride._id);
      await user.save();
    }

    res.status(201).json(ride);

    Promise.resolve().then(async () => {
      try {
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        console.log("Pickup Coordinates", pickupCoordinates);

        const captainsInRadius = await mapService.getCaptainsInTheRadius(
          pickupCoordinates.ltd,
          pickupCoordinates.lng,
          4,
          vehicleType
        );

        ride.otp = "";

        const rideWithUser = await rideModel
          .findOne({ _id: ride._id })
          .populate("user");

        console.log(
          captainsInRadius.map(
            (ride) => `${ride.fullname.firstname} ${ride.fullname.lastname} `
          )
        );
        captainsInRadius.map((captain) => {
          sendMessageToSocketId(captain.socketId, {
            event: "new-ride",
            data: rideWithUser,
          });
        });
      } catch (e) {
        console.error("Background task failed:", e.message);
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query;

  try {
    const { fare, distanceTime } = await rideService.getFare(
      pickup,
      destination
    );
    return res.status(200).json({ fare, distanceTime });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const rideDetails = await rideModel.findOne({ _id: rideId });

    if (!rideDetails) {
      return res.status(404).json({ message: "Ride not found." });
    }

    switch (rideDetails.status) {
      case "accepted":
        return res
          .status(400)
          .json({
            message:
              "The ride is accepted by another captain before you. Better luck next time.",
          });

      case "ongoing":
        return res
          .status(400)
          .json({
            message: "The ride is currently ongoing with another captain.",
          });

      case "completed":
        return res
          .status(400)
          .json({ message: "The ride has already been completed." });

      case "cancelled":
        return res
          .status(400)
          .json({ message: "The ride has been cancelled." });

      default:
        break;
    }

    const ride = await rideService.confirmRide({
      rideId,
      captain: req.captain,
    });

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-confirmed",
      data: ride,
    });

    // TODO: Remove ride from other captains
    // Implement logic here, maybe emit an event or update captain listings

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, otp } = req.query;

  try {
    const ride = await rideService.startRide({
      rideId,
      otp,
      captain: req.captain,
    });

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-started",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.endRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const ride = await rideService.endRide({ rideId, captain: req.captain });

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-ended",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.cancelRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.query;

  try {
    const ride = await rideModel.findOneAndUpdate(
      { _id: rideId },
      {
        status: "cancelled",
      },
      { new: true }
    );

    const pickupCoordinates = await mapService.getAddressCoordinate(ride.pickup);
    const captainsInRadius = await mapService.getCaptainsInTheRadius(
      pickupCoordinates.ltd,
      pickupCoordinates.lng,
      4,
      ride.vehicle
    );

    captainsInRadius.map((captain) => {
      sendMessageToSocketId(captain.socketId, {
        event: "ride-cancelled",
        data: ride,
      });
    });
    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Get all available rides for captains
module.exports.getAvailableRides = async (req, res) => {
  try {
    const captain = req.captain;
    
    // Debug logging
    console.log("🔍 getAvailableRides called for captain:", {
      id: captain._id,
      name: `${captain.fullname.firstname} ${captain.fullname.lastname}`,
      vehicleType: captain.vehicle?.type,
      status: captain.status,
      location: captain.location?.coordinates
    });
    
    // Check if captain has vehicle type
    if (!captain.vehicle || !captain.vehicle.type) {
      console.error("❌ Captain has no vehicle type defined");
      return res.status(400).json({ 
        message: "Captain vehicle type not defined",
        rides: [],
        total: 0 
      });
    }

    // Get all pending rides that match captain's vehicle type
    const availableRides = await rideModel
      .find({
        status: "pending",
        vehicle: captain.vehicle.type, // Only rides for captain's vehicle type
      })
      .populate("user", "fullname phone")
      .sort({ createdAt: -1 }) // Most recent first
      .limit(20); // Limit to 20 rides for performance

    console.log(`📊 Found ${availableRides.length} pending rides for vehicle type: ${captain.vehicle.type}`);
    
    // Debug: Log all pending rides regardless of vehicle type
    const allPendingRides = await rideModel.find({ status: "pending" });
    console.log(`📊 Total pending rides in database: ${allPendingRides.length}`);
    if (allPendingRides.length > 0) {
      console.log("📋 All pending rides:");
      allPendingRides.forEach((ride, index) => {
        console.log(`   ${index + 1}. Vehicle: ${ride.vehicle}, Pickup: ${ride.pickup.substring(0, 30)}...`);
      });
    }

    // Calculate distance from captain to each ride pickup location
    const ridesWithDistance = await Promise.all(
      availableRides.map(async (ride) => {
        try {
          // Skip distance calculation if no map service available (for testing)
          let distance = null;
          let estimatedArrival = null;
          
          try {
            const pickupCoordinates = await mapService.getAddressCoordinate(ride.pickup);
            
            // Calculate distance from captain's location to pickup
            distance = calculateDistance(
              captain.location.coordinates[1], // captain lat
              captain.location.coordinates[0], // captain lng
              pickupCoordinates.ltd,
              pickupCoordinates.lng
            );
            
            distance = Math.round(distance * 100) / 100; // Round to 2 decimal places
            estimatedArrival = Math.ceil(distance * 2); // Rough estimate: 2 minutes per km
          } catch (mapError) {
            console.warn("⚠️ Map service unavailable, using fallback values:", mapError.message);
            distance = 5.0; // Fallback distance
            estimatedArrival = 10; // Fallback time
          }

          return {
            ...ride.toObject(),
            distanceToPickup: distance,
            estimatedArrival: estimatedArrival,
          };
        } catch (error) {
          console.error("❌ Error processing ride:", ride._id, error);
          return {
            ...ride.toObject(),
            distanceToPickup: null,
            estimatedArrival: null,
          };
        }
      })
    );

    // Sort by distance (closest first)
    ridesWithDistance.sort((a, b) => {
      if (a.distanceToPickup === null) return 1;
      if (b.distanceToPickup === null) return -1;
      return a.distanceToPickup - b.distanceToPickup;
    });

    console.log(`✅ Returning ${ridesWithDistance.length} rides to captain`);

    res.status(200).json({
      rides: ridesWithDistance,
      total: ridesWithDistance.length,
      captainLocation: captain.location,
      debug: {
        captainVehicleType: captain.vehicle.type,
        totalPendingRides: allPendingRides.length,
        matchingRides: availableRides.length
      }
    });
  } catch (error) {
    console.error("❌ Error fetching available rides:", error);
    res.status(500).json({ 
      message: "Error fetching available rides",
      error: error.message,
      rides: [],
      total: 0
    });
  }
};

// Get rides by status for captains
module.exports.getRidesByStatus = async (req, res) => {
  try {
    const { status = "pending", vehicleType } = req.query;
    const captain = req.captain;

    let query = { status };
    
    // If vehicleType is specified, filter by it, otherwise use captain's vehicle type
    if (vehicleType) {
      query.vehicle = vehicleType;
    } else {
      query.vehicle = captain.vehicle.type;
    }

    const rides = await rideModel
      .find(query)
      .populate("user", "fullname phone")
      .populate("captain", "fullname phone vehicle")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      rides,
      total: rides.length,
      status,
      vehicleType: vehicleType || captain.vehicle.type,
    });
  } catch (error) {
    console.error("Error fetching rides by status:", error);
    res.status(500).json({ message: "Error fetching rides" });
  }
};

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Get user's ride history
module.exports.getUserRideHistory = async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 20, status } = req.query;

    let query = { user: user._id };
    if (status) {
      query.status = status;
    }

    const rides = await rideModel
      .find(query)
      .populate("captain", "fullname phone vehicle")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await rideModel.countDocuments(query);

    console.log(`📊 Found ${rides.length} rides for user ${user.fullname.firstname}`);

    res.status(200).json({
      success: true,
      rides,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total
    });

  } catch (error) {
    console.error("❌ Error getting user ride history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get ride history",
      error: error.message,
      rides: [],
      total: 0
    });
  }
};
