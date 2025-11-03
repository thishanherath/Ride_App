const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ride",
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    index: true
  },
  captainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "captain",
    required: false
  },
  
  // Payment details
  paymentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  method: {
    type: String,
    required: true,
    enum: ['cash', 'card', 'paypal', 'frimi', 'ezcash', 'mcash'],
    index: true
  },
  gateway: {
    type: String,
    enum: ['stripe', 'paypal', 'frimi', 'ezcash', 'mcash'],
    required: false
  },
  
  // Amount details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'LKR',
    uppercase: true
  },
  processingFee: {
    type: Number,
    default: 0,
    min: 0
  },
  netAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Payment status
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  
  // Gateway specific data
  gatewayData: {
    paymentIntentId: String,
    clientSecret: String,
    approvalUrl: String,
    transactionId: String,
    phoneNumber: String,
    instructions: String
  },
  
  // Payment timeline
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  processedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  failedAt: {
    type: Date
  },
  
  // Additional data
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Refund information
  refund: {
    refundId: String,
    amount: Number,
    reason: String,
    processedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed']
    }
  },
  
  // Error tracking
  errors: [{
    message: String,
    code: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
paymentSchema.index({ rideId: 1, status: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ method: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for payment duration
paymentSchema.virtual('duration').get(function() {
  if (this.completedAt && this.createdAt) {
    return this.completedAt - this.createdAt;
  }
  return null;
});

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `${this.currency} ${this.amount.toFixed(2)}`;
});

// Instance methods
paymentSchema.methods.updateStatus = function(newStatus, metadata = {}) {
  this.status = newStatus;
  this.metadata = { ...this.metadata, ...metadata };
  
  const now = new Date();
  switch (newStatus) {
    case 'processing':
      this.processedAt = now;
      break;
    case 'completed':
      this.completedAt = now;
      break;
    case 'failed':
      this.failedAt = now;
      break;
  }
  
  return this.save();
};

paymentSchema.methods.addError = function(error) {
  this.errors.push({
    message: error.message || error,
    code: error.code || 'UNKNOWN',
    timestamp: new Date()
  });
  
  return this.save();
};

paymentSchema.methods.processRefund = function(refundData) {
  this.refund = {
    ...refundData,
    processedAt: new Date()
  };
  this.status = 'refunded';
  
  return this.save();
};

// Static methods
paymentSchema.statics.findByRide = function(rideId) {
  return this.findOne({ rideId }).populate('userId', 'fullname email phone');
};

paymentSchema.statics.findByUser = function(userId, limit = 20) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('rideId', 'pickup destination fare');
};

paymentSchema.statics.getPaymentStats = function(startDate, endDate) {
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
        _id: {
          method: '$method',
          status: '$status'
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);
};

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  // Calculate net amount if not set
  if (!this.netAmount) {
    this.netAmount = this.amount - (this.processingFee || 0);
  }
  
  next();
});

// Post-save middleware for logging
paymentSchema.post('save', function(doc) {
  console.log(`💰 Payment ${doc.paymentId} status: ${doc.status} (${doc.method})`);
});

module.exports = mongoose.model("payment", paymentSchema);