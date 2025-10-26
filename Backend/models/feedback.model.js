const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ["bug_report", "feature_request", "complaint", "suggestion", "general", "safety_concern"]
    },
    category: {
      type: String,
      required: true,
      enum: [
        "app_issue", "driver_issue", "payment_issue", "ride_issue", 
        "account_issue", "technical_issue", "safety_issue", "other"
      ]
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    subject: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true
    },
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride"
    },
    attachments: [{
      filename: String,
      url: String,
      type: String,
      size: Number
    }],
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed", "duplicate"],
      default: "open"
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },
    adminResponse: {
      message: String,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
      },
      respondedAt: Date
    },
    resolution: {
      type: String,
      maxlength: 1000
    },
    resolvedAt: Date,
    isAnonymous: {
      type: Boolean,
      default: false
    },
    userSatisfaction: {
      type: Number,
      min: 1,
      max: 5
    },
    tags: [String],
    internalNotes: {
      type: String,
      maxlength: 1000
    }
  },
  { timestamps: true }
);

// Indexes for better performance
feedbackSchema.index({ user: 1 });
feedbackSchema.index({ type: 1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ priority: 1 });
feedbackSchema.index({ assignedTo: 1 });
feedbackSchema.index({ createdAt: -1 });

// Virtual for response time
feedbackSchema.virtual('responseTime').get(function() {
  if (this.adminResponse && this.adminResponse.respondedAt) {
    return this.adminResponse.respondedAt - this.createdAt;
  }
  return null;
});

// Static method to get feedback statistics
feedbackSchema.statics.getFeedbackStats = async function(dateFrom, dateTo) {
  const matchStage = {};
  if (dateFrom || dateTo) {
    matchStage.createdAt = {};
    if (dateFrom) matchStage.createdAt.$gte = new Date(dateFrom);
    if (dateTo) matchStage.createdAt.$lte = new Date(dateTo);
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalFeedback: { $sum: 1 },
        openFeedback: {
          $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] }
        },
        inProgressFeedback: {
          $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] }
        },
        resolvedFeedback: {
          $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
        },
        closedFeedback: {
          $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] }
        },
        avgSatisfaction: { $avg: "$userSatisfaction" },
        byType: {
          $push: {
            type: "$type",
            status: "$status"
          }
        },
        byCategory: {
          $push: {
            category: "$category",
            status: "$status"
          }
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalFeedback: 0,
      openFeedback: 0,
      inProgressFeedback: 0,
      resolvedFeedback: 0,
      closedFeedback: 0,
      avgSatisfaction: 0,
      byType: {},
      byCategory: {}
    };
  }

  const result = stats[0];
  
  // Process type distribution
  const typeDistribution = {};
  result.byType.forEach(item => {
    if (!typeDistribution[item.type]) {
      typeDistribution[item.type] = { total: 0, open: 0, resolved: 0 };
    }
    typeDistribution[item.type].total++;
    if (item.status === 'open') typeDistribution[item.type].open++;
    if (item.status === 'resolved') typeDistribution[item.type].resolved++;
  });

  // Process category distribution
  const categoryDistribution = {};
  result.byCategory.forEach(item => {
    if (!categoryDistribution[item.category]) {
      categoryDistribution[item.category] = { total: 0, open: 0, resolved: 0 };
    }
    categoryDistribution[item.category].total++;
    if (item.status === 'open') categoryDistribution[item.category].open++;
    if (item.status === 'resolved') categoryDistribution[item.category].resolved++;
  });

  return {
    totalFeedback: result.totalFeedback,
    openFeedback: result.openFeedback,
    inProgressFeedback: result.inProgressFeedback,
    resolvedFeedback: result.resolvedFeedback,
    closedFeedback: result.closedFeedback,
    avgSatisfaction: Math.round((result.avgSatisfaction || 0) * 10) / 10,
    byType: typeDistribution,
    byCategory: categoryDistribution
  };
};

module.exports = mongoose.model("Feedback", feedbackSchema);
