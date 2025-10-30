const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { body, query } = require("express-validator");
const { authAdmin } = require("../middlewares/auth.middleware");
const { permissions, roles } = require("../middlewares/permission.middleware");

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
    permissions.analytics,
    query("period").optional().isIn(["7d", "30d", "90d", "1y"]).withMessage("Invalid period"),
    adminController.getAnalytics
);

// User Management
router.get("/users",
    permissions.userManagement,
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("search").optional().isString().withMessage("Search must be a string"),
    adminController.getAllUsers
);

router.get("/users/:id", permissions.userManagement, adminController.getUserById);

router.patch("/users/:id/status",
    permissions.userManagement,
    body("isActive").isBoolean().withMessage("isActive must be a boolean"),
    adminController.updateUserStatus
);

// Captain Management
router.get("/captains",
    permissions.driverManagement,
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("search").optional().isString().withMessage("Search must be a string"),
    query("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
    adminController.getAllCaptains
);

router.get("/captains/:id", permissions.driverManagement, adminController.getCaptainById);

router.patch("/captains/:id/status",
    permissions.driverManagement,
    body("status").isIn(["active", "inactive"]).withMessage("Invalid status"),
    adminController.updateCaptainStatus
);

router.patch("/captains/:id/verify",
    permissions.driverManagement,
    body("isVerified").isBoolean().withMessage("isVerified must be a boolean"),
    body("verificationNotes").optional().isString().withMessage("Verification notes must be a string"),
    adminController.verifyCaptain
);

// Ride Management
router.get("/rides",
    permissions.rideManagement,
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("status").optional().isIn(["pending", "accepted", "ongoing", "completed", "cancelled"]).withMessage("Invalid status"),
    query("dateFrom").optional().isISO8601().withMessage("Invalid date format"),
    query("dateTo").optional().isISO8601().withMessage("Invalid date format"),
    query("search").optional().isString().withMessage("Search must be a string"),
    adminController.getAllRides
);

router.get("/rides/:id", permissions.rideManagement, adminController.getRideById);

router.patch("/rides/:id/status",
    permissions.rideManagement,
    body("status").isIn(["pending", "accepted", "ongoing", "completed", "cancelled"]).withMessage("Invalid status"),
    body("adminNotes").optional().isString().withMessage("Admin notes must be a string"),
    adminController.updateRideStatus
);

module.exports = router;
// Admin Profile Management (Single Admin System)
router.get("/admin-info", adminController.getAdminProfile);

router.patch("/admin-info",
    body("fullname.firstname").optional().isLength({ min: 3 }).withMessage("First name must be at least 3 characters"),
    body("fullname.lastname").optional().isLength({ min: 3 }).withMessage("Last name must be at least 3 characters"),
    body("phone").optional().isLength({ min: 10, max: 15 }).withMessage("Invalid phone number"),
    adminController.updateAdmin
);

router.patch("/change-password",
    body("currentPassword").isLength({ min: 8 }).withMessage("Current password is required"),
    body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
    adminController.changePassword
);

// System Health
router.get("/health", adminController.getSystemHealth);