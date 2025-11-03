const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Captain",
    },
    pickup: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    vehicle: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "paypal", "frimi", "ezcash", "mcash"],
      default: "cash",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "ongoing", "completed", "cancelled"],
      default: "pending",
    },
    
    // Enhanced status tracking fields
    acceptedAt: {
      type: Date,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    
    // Driver assignment tracking
    assignmentTimeout: {
      type: Date,
    },
    driverSearchRadius: {
      type: Number,
      default: 5, // km
    },
    
    // Real-time tracking
    estimatedArrival: {
      type: Number, // minutes
    },
    actualDuration: {
      type: Number, // seconds
    },
    
    // Status history for debugging and analytics
    statusHistory: [{
      status: {
        type: String,
        enum: ["pending", "accepted", "ongoing", "completed", "cancelled"],
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      updatedBy: {
        type: String,
        enum: ["user", "captain", "system"],
        required: true
      },
      reason: {
        type: String, // Optional reason for status change
      },
      _id: false
    }],
    
    duration: {
      type: Number,
    }, // in seconds

    distance: {
      type: Number,
    }, // in meters

    paymentID: {
      type: String,
    },
    orderId: {
      type: String,
    },
    signature: {
      type: String,
    },
    otp: {
      type: String,
      select: false,
      required: true,
    },
    messages: [
      {
        msg: String,
        by: {
          type: String,
          enum: ["user", "captain"],
        },
        time: String,
        date: String,
        timestamp: Date,
        _id: false
      },
    ],
  },
  { timestamps: true }
);

// Database indexes for performance optimization
rideSchema.index({ status: 1, vehicle: 1 }); // For finding available rides by vehicle type
rideSchema.index({ captain: 1, status: 1 }); // For captain's ride history and current rides
rideSchema.index({ user: 1, createdAt: -1 }); // For user's ride history
rideSchema.index({ status: 1, createdAt: -1 }); // For admin dashboard and analytics
rideSchema.index({ assignmentTimeout: 1, status: 1 }); // For timeout cleanup jobs
rideSchema.index({ "statusHistory.timestamp": -1 }); // For analytics on status changes

// Middleware to automatically track status changes
rideSchema.pre('save', function(next) {
  // Only track status changes if the document is being modified
  if (this.isModified('status')) {
    const statusChange = {
      status: this.status,
      timestamp: new Date(),
      updatedBy: this._statusUpdatedBy || 'system',
      reason: this._statusChangeReason
    };
    
    // Initialize statusHistory if it doesn't exist
    if (!this.statusHistory) {
      this.statusHistory = [];
    }
    
    this.statusHistory.push(statusChange);
    
    // Update timestamp fields based on status
    const now = new Date();
    switch (this.status) {
      case 'accepted':
        this.acceptedAt = now;
        break;
      case 'ongoing':
        this.startedAt = now;
        break;
      case 'completed':
        this.completedAt = now;
        break;
      case 'cancelled':
        this.cancelledAt = now;
        break;
    }
    
    // Clean up temporary fields
    this._statusUpdatedBy = undefined;
    this._statusChangeReason = undefined;
  }
  
  next();
});

// Instance method to update status with tracking
rideSchema.methods.updateStatus = function(newStatus, updatedBy = 'system', reason = null) {
  this._statusUpdatedBy = updatedBy;
  this._statusChangeReason = reason;
  this.status = newStatus;
  return this.save();
};

// Static method to find rides with timeout
rideSchema.statics.findTimedOutRides = function() {
  const timeoutThreshold = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
  return this.find({
    status: 'pending',
    $or: [
      { assignmentTimeout: { $lt: new Date() } },
      { createdAt: { $lt: timeoutThreshold } }
    ]
  });
};

// Static method to get ride analytics
rideSchema.statics.getRideAnalytics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDuration: { $avg: '$actualDuration' },
        avgFare: { $avg: '$fare' }
      }
    }
  ]);
};

module.exports = mongoose.model("Ride", rideSchema);
