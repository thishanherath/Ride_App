const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { body, query } = require("express-validator");
const { authAdmin } = require("../middlewares/auth.middleware");

// Public routes (no authentication required)
router.post("/login",
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    adminController.loginAdmin
);

// Protected routes (require admin authentication)
router.use(authAdmin);

// Admin profile
router.get("/profile", adminController.getAdminProfile);

// Dashboard
router.get("/dashboard", adminController.getDashboardStats);

// Analytics
router.get("/analytics", 
    query("period").optional().isIn(["7d", "30d", "90d", "1y"]).withMessage("Invalid period"),
    adminController.getAnalytics
);

// User Management
router.get("/users",
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("search").optional().isString().withMessage("Search must be a string"),
    adminController.getAllUsers
);

router.get("/users/:id", adminController.getUserById);

router.patch("/users/:id/status",
    body("isActive").isBoolean().withMessage("isActive must be a boolean"),
    adminController.updateUserStatus
);

// Captain Management
router.get("/captains",
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("search").optional().isString().withMessage("Search must be a string"),
    query("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
    adminController.getAllCaptains
);

router.get("/captains/:id", adminController.getCaptainById);

router.patch("/captains/:id/status",
    body("status").isIn(["active", "inactive"]).withMessage("Invalid status"),
    adminController.updateCaptainStatus
);

router.patch("/captains/:id/verify",
    body("isVerified").isBoolean().withMessage("isVerified must be a boolean"),
    body("verificationNotes").optional().isString().withMessage("Verification notes must be a string"),
    adminController.verifyCaptain
);

// Ride Management
router.get("/rides",
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("status").optional().isIn(["pending", "accepted", "ongoing", "completed", "cancelled"]).withMessage("Invalid status"),
    query("dateFrom").optional().isISO8601().withMessage("Invalid date format"),
    query("dateTo").optional().isISO8601().withMessage("Invalid date format"),
    query("search").optional().isString().withMessage("Search must be a string"),
    adminController.getAllRides
);

router.get("/rides/:id", adminController.getRideById);

router.patch("/rides/:id/status",
    body("status").isIn(["pending", "accepted", "ongoing", "completed", "cancelled"]).withMessage("Invalid status"),
    body("adminNotes").optional().isString().withMessage("Admin notes must be a string"),
    adminController.updateRideStatus
);

module.exports = router;
