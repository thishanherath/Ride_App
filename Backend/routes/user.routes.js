const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { body } = require("express-validator");
const { authUser } = require("../middlewares/auth.middleware");
const { uploadProfilePicture, handleUploadError } = require("../middleware/upload");

router.post("/register",
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
    body("fullname.firstname").isLength({min:2}).withMessage("First name must be at least 2 characters long"),
    body("phone").isLength({min:10, max:10}).withMessage("Phone number should be of 10 digits only"),
    userController.registerUser
);

router.post("/verify-email", userController.verifyEmail);

router.post("/login", 
    body("email").isEmail().withMessage("Invalid Email"),
    userController.loginUser
);

router.post("/update", authUser,
    uploadProfilePicture,
    handleUploadError,
    body("fullname.firstname").isLength({min:2}).withMessage("First name must be at least 2 characters long"),
    body("fullname.lastname").isLength({min:2}).withMessage("Last name must be at least 2 characters long"),
    body("phone").isLength({min:10, max:10}).withMessage("Phone number should be of 10 digits only"),
    userController.updateUserProfile
);

// Separate endpoint for profile picture upload only
router.post("/upload-profile-picture", authUser,
    uploadProfilePicture,
    handleUploadError,
    userController.uploadProfilePicture
);

router.get("/profile", authUser, userController.userProfile);

router.get("/logout", authUser, userController.logoutUser);

router.post(
    "/reset-password",
    body("token").notEmpty().withMessage("Token is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
    userController.resetPassword
);

module.exports = router;
