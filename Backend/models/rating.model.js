const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
    rater: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'raterType'
    },
    raterType: {
      type: String,
      required: true,
      enum: ["User", "Captain"]
    },
    rated: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'ratedType'
    },
    ratedType: {
      type: String,
      required: true,
      enum: ["User", "Captain"]
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    feedback: {
      type: String,
      maxlength: 500,
      trim: true
    },
    categories: {
      // For driver ratings
      driving: {
        type: Number,
        min: 1,
        max: 5
      },
      punctuality: {
        type: Number,
        min: 1,
        max: 5
      },
      cleanliness: {
        type: Number,
        min: 1,
        max: 5
      },
      communication: {
        type: Number,
        min: 1,
        max: 5
      },
      // For passenger ratings
      politeness: {
        type: Number,
        min: 1,
        max: 5
      },
      cleanliness_passenger: {
        type: Number,
        min: 1,
        max: 5
      },
      punctuality_passenger: {
        type: Number,
        min: 1,
        max: 5
      }
    },
    tags: [{
      type: String,
      enum: [
        // Driver tags
        "excellent_driver", "safe_driver", "friendly", "professional", "clean_vehicle",
        "good_communication", "punctual", "helpful", "knowledgeable",
        // Passenger tags
        "polite", "clean", "punctual", "respectful", "cooperative",
        // Negative tags
        "rude", "unsafe", "late", "dirty_vehicle", "poor_communication",
        "disrespectful", "uncooperative", "smoking", "loud_music"
      ]
    }],
    isAnonymous: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    adminNotes: {
      type: String,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ["active", "hidden", "reported", "under_review"],
      default: "active"
    }
  },
  { timestamps: true }
);

// Indexes for better performance
ratingSchema.index({ ride: 1 });
ratingSchema.index({ rater: 1, raterType: 1 });
ratingSchema.index({ rated: 1, ratedType: 1 });
ratingSchema.index({ rating: 1 });
ratingSchema.index({ status: 1 });
ratingSchema.index({ createdAt: -1 });

// Ensure one rating per ride per rater
ratingSchema.index({ ride: 1, rater: 1, raterType: 1 }, { unique: true });

// Virtual for average category rating
ratingSchema.virtual('averageCategoryRating').get(function() {
  const categories = this.categories;
  const values = Object.values(categories).filter(val => typeof val === 'number');
  return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
});

// Static method to get average rating for a user/captain
ratingSchema.statics.getAverageRating = async function(userId, userType) {
  const result = await this.aggregate([
    {
      $match: {
        rated: mongoose.Types.ObjectId(userId),
        ratedType: userType,
        status: "active"
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
        ratingDistribution: {
          $push: "$rating"
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result[0].ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return {
    averageRating: Math.round(result[0].averageRating * 10) / 10,
    totalRatings: result[0].totalRatings,
    ratingDistribution: distribution
  };
};

// Static method to get category averages
ratingSchema.statics.getCategoryAverages = async function(userId, userType) {
  const result = await this.aggregate([
    {
      $match: {
        rated: mongoose.Types.ObjectId(userId),
        ratedType: userType,
        status: "active"
      }
    },
    {
      $group: {
        _id: null,
        driving: { $avg: "$categories.driving" },
        punctuality: { $avg: "$categories.punctuality" },
        cleanliness: { $avg: "$categories.cleanliness" },
        communication: { $avg: "$categories.communication" },
        politeness: { $avg: "$categories.politeness" },
        cleanliness_passenger: { $avg: "$categories.cleanliness_passenger" },
        punctuality_passenger: { $avg: "$categories.punctuality_passenger" }
      }
    }
  ]);

  if (result.length === 0) {
    return {};
  }

  const averages = {};
  Object.keys(result[0]).forEach(key => {
    if (key !== '_id' && result[0][key] !== null) {
      averages[key] = Math.round(result[0][key] * 10) / 10;
    }
  });

  return averages;
};

module.exports = mongoose.model("Rating", ratingSchema);
