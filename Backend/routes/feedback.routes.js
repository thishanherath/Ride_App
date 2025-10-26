const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedback.controller");
const { body, query, param } = require("express-validator");
const { authUser, authAdmin } = require("../middlewares/auth.middleware");

// User routes
router.post("/submit",
    authUser,
    body("type").isIn(["bug_report", "feature_request", "complaint", "suggestion", "general", "safety_concern"]).withMessage("Invalid feedback type"),
    body("category").isIn(["app_issue", "driver_issue", "payment_issue", "ride_issue", "account_issue", "technical_issue", "safety_issue", "other"]).withMessage("Invalid category"),
    body("priority").optional().isIn(["low", "medium", "high", "urgent"]).withMessage("Invalid priority"),
    body("subject").isString().isLength({ min: 5, max: 200 }).withMessage("Subject must be between 5 and 200 characters"),
    body("description").isString().isLength({ min: 10, max: 2000 }).withMessage("Description must be between 10 and 2000 characters"),
    body("rideId").optional().isMongoId().withMessage("Invalid ride ID"),
    body("attachments").optional().isArray().withMessage("Attachments must be an array"),
    body("isAnonymous").optional().isBoolean().withMessage("isAnonymous must be a boolean"),
    feedbackController.submitFeedback
);

router.get("/user-feedback",
    authUser,
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
    query("status").optional().isIn(["open", "in_progress", "resolved", "closed", "duplicate"]).withMessage("Invalid status"),
    query("type").optional().isIn(["bug_report", "feature_request", "complaint", "suggestion", "general", "safety_concern"]).withMessage("Invalid type"),
    feedbackController.getUserFeedback
);

router.get("/:feedbackId",
    authUser,
    param("feedbackId").isMongoId().withMessage("Invalid feedback ID"),
    feedbackController.getFeedbackById
);

router.put("/:feedbackId",
    authUser,
    param("feedbackId").isMongoId().withMessage("Invalid feedback ID"),
    body("subject").optional().isString().isLength({ min: 5, max: 200 }).withMessage("Subject must be between 5 and 200 characters"),
    body("description").optional().isString().isLength({ min: 10, max: 2000 }).withMessage("Description must be between 10 and 2000 characters"),
    body("type").optional().isIn(["bug_report", "feature_request", "complaint", "suggestion", "general", "safety_concern"]).withMessage("Invalid feedback type"),
    body("category").optional().isIn(["app_issue", "driver_issue", "payment_issue", "ride_issue", "account_issue", "technical_issue", "safety_issue", "other"]).withMessage("Invalid category"),
    body("priority").optional().isIn(["low", "medium", "high", "urgent"]).withMessage("Invalid priority"),
    feedbackController.updateFeedback
);

router.post("/:feedbackId/rate",
    authUser,
    param("feedbackId").isMongoId().withMessage("Invalid feedback ID"),
    body("userSatisfaction").isInt({ min: 1, max: 5 }).withMessage("User satisfaction must be between 1 and 5"),
    feedbackController.rateFeedbackResponse
);

// Admin routes
router.get("/admin/all",
    authAdmin,
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("status").optional().isIn(["open", "in_progress", "resolved", "closed", "duplicate"]).withMessage("Invalid status"),
    query("type").optional().isIn(["bug_report", "feature_request", "complaint", "suggestion", "general", "safety_concern"]).withMessage("Invalid type"),
    query("category").optional().isIn(["app_issue", "driver_issue", "payment_issue", "ride_issue", "account_issue", "technical_issue", "safety_issue", "other"]).withMessage("Invalid category"),
    query("priority").optional().isIn(["low", "medium", "high", "urgent"]).withMessage("Invalid priority"),
    query("assignedTo").optional().isMongoId().withMessage("Invalid assigned to ID"),
    query("search").optional().isString().withMessage("Search must be a string"),
    feedbackController.getAllFeedback
);

router.get("/admin/stats",
    authAdmin,
    query("dateFrom").optional().isISO8601().withMessage("Invalid date format"),
    query("dateTo").optional().isISO8601().withMessage("Invalid date format"),
    feedbackController.getFeedbackStats
);

router.patch("/admin/:feedbackId/status",
    authAdmin,
    param("feedbackId").isMongoId().withMessage("Invalid feedback ID"),
    body("status").isIn(["open", "in_progress", "resolved", "closed", "duplicate"]).withMessage("Invalid status"),
    body("adminResponse").optional().isString().isLength({ max: 1000 }).withMessage("Admin response must be less than 1000 characters"),
    body("resolution").optional().isString().isLength({ max: 1000 }).withMessage("Resolution must be less than 1000 characters"),
    body("internalNotes").optional().isString().isLength({ max: 1000 }).withMessage("Internal notes must be less than 1000 characters"),
    feedbackController.updateFeedbackStatus
);

router.patch("/admin/:feedbackId/assign",
    authAdmin,
    param("feedbackId").isMongoId().withMessage("Invalid feedback ID"),
    body("assignedTo").isMongoId().withMessage("Invalid assigned to ID"),
    feedbackController.assignFeedback
);

module.exports = router;
