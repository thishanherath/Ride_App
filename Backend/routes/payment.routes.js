const express = require("express");
const router = express.Router();
const { body, param, query } = require("express-validator");
const authMiddleware = require("../middlewares/auth.middleware");
const paymentController = require("../controllers/payment.controller");

// Validation rules
const createPaymentIntentValidation = [
  body("rideId")
    .isMongoId()
    .withMessage("Valid ride ID is required"),
  body("amount")
    .isFloat({ min: 1 })
    .withMessage("Amount must be a positive number"),
  body("currency")
    .optional()
    .isIn(["LKR", "USD", "EUR"])
    .withMessage("Currency must be LKR, USD, or EUR")
];

const processPaymentValidation = [
  body("rideId")
    .isMongoId()
    .withMessage("Valid ride ID is required"),
  body("paymentMethod")
    .isIn(["cash", "card", "paypal", "frimi", "ezcash", "mcash"])
    .withMessage("Invalid payment method"),
  body("paymentData")
    .optional()
    .isObject()
    .withMessage("Payment data must be an object")
];

const paymentIdValidation = [
  param("paymentId")
    .notEmpty()
    .withMessage("Payment ID is required")
];

const paymentHistoryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("status")
    .optional()
    .isIn(["pending", "processing", "completed", "failed", "cancelled", "refunded"])
    .withMessage("Invalid status"),
  query("method")
    .optional()
    .isIn(["cash", "card", "paypal", "frimi", "ezcash", "mcash"])
    .withMessage("Invalid payment method")
];

// Routes

/**
 * @route   GET /api/payment/methods
 * @desc    Get available payment methods
 * @access  Public
 */
router.get("/methods", paymentController.getPaymentMethods);

/**
 * @route   POST /api/payment/create-intent
 * @desc    Create payment intent for card payments
 * @access  Private (User)
 */
router.post(
  "/create-intent",
  authMiddleware.authUser,
  createPaymentIntentValidation,
  paymentController.createIntent
);

/**
 * @route   POST /api/payment/process
 * @desc    Process ride payment
 * @access  Private (User)
 */
router.post(
  "/process",
  authMiddleware.authUser,
  processPaymentValidation,
  paymentController.processPayment
);

/**
 * @route   GET /api/payment/status/:paymentId
 * @desc    Get payment status
 * @access  Private (User)
 */
router.get(
  "/status/:paymentId",
  authMiddleware.authUser,
  paymentIdValidation,
  paymentController.getPaymentStatus
);

/**
 * @route   GET /api/payment/history
 * @desc    Get user payment history
 * @access  Private (User)
 */
router.get(
  "/history",
  authMiddleware.authUser,
  paymentHistoryValidation,
  paymentController.getPaymentHistory
);

/**
 * @route   POST /api/payment/refund/:paymentId
 * @desc    Refund payment
 * @access  Private (Admin/User)
 */
router.post(
  "/refund/:paymentId",
  authMiddleware.authUser,
  paymentIdValidation,
  body("reason")
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage("Reason must be between 1 and 200 characters"),
  paymentController.refundPayment
);

module.exports = router;