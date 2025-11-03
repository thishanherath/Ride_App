const { validationResult } = require("express-validator");
const paymentService = require("../services/paymentService");
const paymentModel = require("../models/payment.model");
const rideModel = require("../models/ride.model");

/**
 * Get available payment methods
 */
module.exports.getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = paymentService.getAvailablePaymentMethods();
    
    res.status(200).json({
      success: true,
      paymentMethods,
      message: 'Payment methods retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error getting payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment methods',
      error: error.message
    });
  }
};

/**
 * Create payment intent for card payments
 */
module.exports.createPaymentIntent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { rideId, amount, currency = 'LKR' } = req.body;
    
    // Verify ride exists and belongs to user
    const ride = await rideModel.findOne({
      _id: rideId,
      user: req.user._id
    });
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found or access denied'
      });
    }
    
    // Create payment intent
    const result = await paymentService.createCardPaymentIntent(
      amount,
      currency.toLowerCase(),
      {
        rideId,
        userId: req.user._id,
        userEmail: req.user.email
      }
    );
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create payment intent',
        error: result.error
      });
    }
    
    // Save payment record
    const payment = new paymentModel({
      rideId,
      userId: req.user._id,
      paymentId: result.paymentIntentId,
      method: 'card',
      gateway: 'stripe',
      amount,
      currency: currency.toUpperCase(),
      processingFee: paymentService.calculateProcessingFee(amount, 'card'),
      gatewayData: {
        paymentIntentId: result.paymentIntentId,
        clientSecret: result.clientSecret
      },
      status: 'pending'
    });
    
    await payment.save();
    
    res.status(200).json({
      success: true,
      paymentIntent: result,
      paymentId: payment._id,
      message: 'Payment intent created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

/**
 * Process ride payment
 */
module.exports.processPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { rideId, paymentMethod, paymentData = {} } = req.body;
    
    // Verify ride exists and belongs to user
    const ride = await rideModel.findOne({
      _id: rideId,
      user: req.user._id
    });
    
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found or access denied'
      });
    }
    
    // Check if payment already exists
    const existingPayment = await paymentModel.findOne({
      rideId,
      status: { $in: ['completed', 'processing'] }
    });
    
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed for this ride'
      });
    }
    
    // Process payment
    const result = await paymentService.processRidePayment(
      rideId,
      paymentMethod,
      ride.fare,
      paymentData
    );
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Payment processing failed',
        error: result.error
      });
    }
    
    // Save or update payment record
    let payment;
    if (paymentData.paymentId) {
      // Update existing payment
      payment = await paymentModel.findById(paymentData.paymentId);
      if (payment) {
        payment.status = result.status || 'processing';
        payment.gatewayData = { ...payment.gatewayData, ...result };
        await payment.save();
      }
    } else {
      // Create new payment record
      payment = new paymentModel({
        rideId,
        userId: req.user._id,
        captainId: ride.captain,
        paymentId: result.paymentId || `${paymentMethod}_${Date.now()}`,
        method: paymentMethod,
        gateway: result.gateway,
        amount: ride.fare,
        currency: 'LKR',
        processingFee: paymentService.calculateProcessingFee(ride.fare, paymentMethod),
        gatewayData: result,
        status: result.status || 'pending'
      });
      
      await payment.save();
    }
    
    res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        paymentId: payment.paymentId,
        method: payment.method,
        amount: payment.amount,
        status: payment.status,
        requiresAction: result.requiresAction,
        ...result
      },
      message: 'Payment processed successfully'
    });
    
  } catch (error) {
    console.error('❌ Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
};

/**
 * Get payment status
 */
module.exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Find payment record
    const payment = await paymentModel.findOne({
      $or: [
        { _id: paymentId },
        { paymentId: paymentId }
      ],
      userId: req.user._id
    }).populate('rideId', 'pickup destination fare status');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Get latest status from gateway if needed
    if (payment.method === 'card' && payment.status === 'pending') {
      const gatewayStatus = await paymentService.getPaymentStatus(
        payment.gatewayData.paymentIntentId,
        payment.method
      );
      
      if (gatewayStatus.success && gatewayStatus.status !== payment.status) {
        await payment.updateStatus(gatewayStatus.status);
      }
    }
    
    res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        paymentId: payment.paymentId,
        method: payment.method,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt,
        ride: payment.rideId
      },
      message: 'Payment status retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
};

/**
 * Get user payment history
 */
module.exports.getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, method } = req.query;
    
    const query = { userId: req.user._id };
    if (status) query.status = status;
    if (method) query.method = method;
    
    const payments = await paymentModel.find(query)
      .populate('rideId', 'pickup destination fare status createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await paymentModel.countDocuments(query);
    
    res.status(200).json({
      success: true,
      payments: payments.map(payment => ({
        id: payment._id,
        paymentId: payment.paymentId,
        method: payment.method,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        createdAt: payment.createdAt,
        ride: payment.rideId
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      message: 'Payment history retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error getting payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history',
      error: error.message
    });
  }
};

/**
 * Refund payment
 */
module.exports.refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason = 'Ride cancelled' } = req.body;
    
    // Find payment record
    const payment = await paymentModel.findOne({
      $or: [
        { _id: paymentId },
        { paymentId: paymentId }
      ]
    }).populate('rideId');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check if refund is allowed
    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }
    
    if (payment.refund && payment.refund.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already refunded'
      });
    }
    
    // Process refund
    const refundResult = await paymentService.refundPayment(
      payment.gatewayData.paymentIntentId || payment.paymentId,
      payment.amount,
      reason
    );
    
    if (!refundResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Refund processing failed',
        error: refundResult.error
      });
    }
    
    // Update payment record
    await payment.processRefund(refundResult);
    
    res.status(200).json({
      success: true,
      refund: refundResult,
      message: 'Refund processed successfully'
    });
    
  } catch (error) {
    console.error('❌ Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Refund processing failed',
      error: error.message
    });
  }
};