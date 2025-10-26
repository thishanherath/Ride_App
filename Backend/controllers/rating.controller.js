const asyncHandler = require("express-async-handler");
const ratingModel = require("../models/rating.model");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");
const rideModel = require("../models/ride.model");
const { validationResult } = require("express-validator");

// Submit a rating
module.exports.submitRating = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { rideId, rating, feedback, categories, tags, isAnonymous } = req.body;
  const raterId = req.user._id;
  const raterType = "User";

  try {
    // Check if ride exists and is completed
    const ride = await rideModel.findById(rideId)
      .populate("user", "_id")
      .populate("captain", "_id");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "completed") {
      return res.status(400).json({ message: "Can only rate completed rides" });
    }

    // Check if user is part of this ride
    if (ride.user._id.toString() !== raterId.toString()) {
      return res.status(403).json({ message: "You can only rate your own rides" });
    }

    // Check if already rated
    const existingRating = await ratingModel.findOne({
      ride: rideId,
      rater: raterId,
      raterType: raterType
    });

    if (existingRating) {
      return res.status(400).json({ message: "You have already rated this ride" });
    }

    // Create rating
    const newRating = await ratingModel.create({
      ride: rideId,
      rater: raterId,
      raterType: raterType,
      rated: ride.captain._id,
      ratedType: "Captain",
      rating,
      feedback,
      categories,
      tags,
      isAnonymous
    });

    // Update captain's average rating
    await updateUserRating(ride.captain._id, "Captain");

    res.status(201).json({
      message: "Rating submitted successfully",
      rating: newRating
    });

  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ message: "Error submitting rating" });
  }
});

// Submit captain rating for passenger
module.exports.submitCaptainRating = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { rideId, rating, feedback, categories, tags, isAnonymous } = req.body;
  const raterId = req.captain._id;
  const raterType = "Captain";

  try {
    // Check if ride exists and is completed
    const ride = await rideModel.findById(rideId)
      .populate("user", "_id")
      .populate("captain", "_id");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "completed") {
      return res.status(400).json({ message: "Can only rate completed rides" });
    }

    // Check if captain is part of this ride
    if (ride.captain._id.toString() !== raterId.toString()) {
      return res.status(403).json({ message: "You can only rate your own rides" });
    }

    // Check if already rated
    const existingRating = await ratingModel.findOne({
      ride: rideId,
      rater: raterId,
      raterType: raterType
    });

    if (existingRating) {
      return res.status(400).json({ message: "You have already rated this ride" });
    }

    // Create rating
    const newRating = await ratingModel.create({
      ride: rideId,
      rater: raterId,
      raterType: raterType,
      rated: ride.user._id,
      ratedType: "User",
      rating,
      feedback,
      categories,
      tags,
      isAnonymous
    });

    // Update user's average rating
    await updateUserRating(ride.user._id, "User");

    res.status(201).json({
      message: "Rating submitted successfully",
      rating: newRating
    });

  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ message: "Error submitting rating" });
  }
});

// Get ratings for a user/captain
module.exports.getRatings = asyncHandler(async (req, res) => {
  const { userId, userType } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const skip = (page - 1) * limit;

    const ratings = await ratingModel
      .find({
        rated: userId,
        ratedType: userType,
        status: "active"
      })
      .populate("rater", "fullname")
      .populate("ride", "pickup destination fare createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ratingModel.countDocuments({
      rated: userId,
      ratedType: userType,
      status: "active"
    });

    // Get average rating and distribution
    const stats = await ratingModel.getAverageRating(userId, userType);
    const categoryAverages = await ratingModel.getCategoryAverages(userId, userType);

    res.status(200).json({
      ratings,
      stats,
      categoryAverages,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ message: "Error fetching ratings" });
  }
});

// Get user's rating history
module.exports.getUserRatingHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user._id;

  try {
    const skip = (page - 1) * limit;

    const ratings = await ratingModel
      .find({
        rater: userId,
        raterType: "User"
      })
      .populate("rated", "fullname")
      .populate("ride", "pickup destination fare createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ratingModel.countDocuments({
      rater: userId,
      raterType: "User"
    });

    res.status(200).json({
      ratings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error("Error fetching rating history:", error);
    res.status(500).json({ message: "Error fetching rating history" });
  }
});

// Get captain's rating history
module.exports.getCaptainRatingHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const captainId = req.captain._id;

  try {
    const skip = (page - 1) * limit;

    const ratings = await ratingModel
      .find({
        rater: captainId,
        raterType: "Captain"
      })
      .populate("rated", "fullname")
      .populate("ride", "pickup destination fare createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ratingModel.countDocuments({
      rater: captainId,
      raterType: "Captain"
    });

    res.status(200).json({
      ratings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error("Error fetching rating history:", error);
    res.status(500).json({ message: "Error fetching rating history" });
  }
});

// Update a rating
module.exports.updateRating = asyncHandler(async (req, res) => {
  const { ratingId } = req.params;
  const { rating, feedback, categories, tags } = req.body;
  const userId = req.user._id;

  try {
    const existingRating = await ratingModel.findOne({
      _id: ratingId,
      rater: userId,
      raterType: "User"
    });

    if (!existingRating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    const updatedRating = await ratingModel.findByIdAndUpdate(
      ratingId,
      {
        rating,
        feedback,
        categories,
        tags
      },
      { new: true }
    ).populate("rated", "fullname")
     .populate("ride", "pickup destination fare createdAt");

    // Update user's average rating
    await updateUserRating(existingRating.rated, existingRating.ratedType);

    res.status(200).json({
      message: "Rating updated successfully",
      rating: updatedRating
    });

  } catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({ message: "Error updating rating" });
  }
});

// Delete a rating
module.exports.deleteRating = asyncHandler(async (req, res) => {
  const { ratingId } = req.params;
  const userId = req.user._id;

  try {
    const existingRating = await ratingModel.findOne({
      _id: ratingId,
      rater: userId,
      raterType: "User"
    });

    if (!existingRating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    await ratingModel.findByIdAndDelete(ratingId);

    // Update user's average rating
    await updateUserRating(existingRating.rated, existingRating.ratedType);

    res.status(200).json({ message: "Rating deleted successfully" });

  } catch (error) {
    console.error("Error deleting rating:", error);
    res.status(500).json({ message: "Error deleting rating" });
  }
});

// Report a rating
module.exports.reportRating = asyncHandler(async (req, res) => {
  const { ratingId } = req.params;
  const { reason } = req.body;
  const userId = req.user._id;

  try {
    const rating = await ratingModel.findById(ratingId);

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    // Update rating status
    await ratingModel.findByIdAndUpdate(ratingId, {
      status: "reported",
      adminNotes: `Reported by user ${userId}: ${reason}`
    });

    res.status(200).json({ message: "Rating reported successfully" });

  } catch (error) {
    console.error("Error reporting rating:", error);
    res.status(500).json({ message: "Error reporting rating" });
  }
});

// Helper function to update user rating averages
async function updateUserRating(userId, userType) {
  try {
    const stats = await ratingModel.getAverageRating(userId, userId, userType);
    
    if (userType === "User") {
      await userModel.findByIdAndUpdate(userId, {
        "rating.average": stats.averageRating,
        "rating.count": stats.totalRatings
      });
    } else if (userType === "Captain") {
      await captainModel.findByIdAndUpdate(userId, {
        "rating.average": stats.averageRating,
        "rating.count": stats.totalRatings
      });
    }
  } catch (error) {
    console.error("Error updating user rating:", error);
  }
}
