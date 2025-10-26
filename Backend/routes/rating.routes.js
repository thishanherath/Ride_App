const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/rating.controller");
const { body, query, param } = require("express-validator");
const { authUser, authCaptain, authAdmin } = require("../middlewares/auth.middleware");

// User routes
router.post("/submit",
    authUser,
    body("rideId").isMongoId().withMessage("Invalid ride ID"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("feedback").optional().isString().isLength({ max: 500 }).withMessage("Feedback must be less than 500 characters"),
    body("categories").optional().isObject().withMessage("Categories must be an object"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("isAnonymous").optional().isBoolean().withMessage("isAnonymous must be a boolean"),
    ratingController.submitRating
);

router.get("/user-history",
    authUser,
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
    ratingController.getUserRatingHistory
);

router.put("/:ratingId",
    authUser,
    param("ratingId").isMongoId().withMessage("Invalid rating ID"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("feedback").optional().isString().isLength({ max: 500 }).withMessage("Feedback must be less than 500 characters"),
    body("categories").optional().isObject().withMessage("Categories must be an object"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    ratingController.updateRating
);

router.delete("/:ratingId",
    authUser,
    param("ratingId").isMongoId().withMessage("Invalid rating ID"),
    ratingController.deleteRating
);

router.post("/:ratingId/report",
    authUser,
    param("ratingId").isMongoId().withMessage("Invalid rating ID"),
    body("reason").isString().isLength({ min: 10, max: 200 }).withMessage("Reason must be between 10 and 200 characters"),
    ratingController.reportRating
);

// Captain routes
router.post("/captain/submit",
    authCaptain,
    body("rideId").isMongoId().withMessage("Invalid ride ID"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("feedback").optional().isString().isLength({ max: 500 }).withMessage("Feedback must be less than 500 characters"),
    body("categories").optional().isObject().withMessage("Categories must be an object"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("isAnonymous").optional().isBoolean().withMessage("isAnonymous must be a boolean"),
    ratingController.submitCaptainRating
);

router.get("/captain/history",
    authCaptain,
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
    ratingController.getCaptainRatingHistory
);

// Public routes (for viewing ratings)
router.get("/:userId/:userType",
    param("userId").isMongoId().withMessage("Invalid user ID"),
    param("userType").isIn(["User", "Captain"]).withMessage("Invalid user type"),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
    ratingController.getRatings
);

module.exports = router;
