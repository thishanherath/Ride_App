const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const rideController = require('../controllers/ride.controller');
const captainRideController = require('../controllers/captain.ride.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/chat-details/:id', rideController.chatDetails)

router.post('/create',
    authMiddleware.authUser,
    body('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    body('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    body('vehicleType').isString().isIn([ 'auto', 'car', 'bike' ]).withMessage('Invalid vehicle type'),
    rideController.createRide
)

router.get('/get-fare',
    authMiddleware.authUser,
    query('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    query('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    rideController.getFare
)

router.post('/confirm',
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.confirmRide
)


router.get('/cancel',
    query('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.cancelRide
)


router.get('/start-ride',
    authMiddleware.authCaptain,
    query('rideId').isMongoId().withMessage('Invalid ride id'),
    query('otp').isString().isLength({ min: 6, max: 6 }).withMessage('Invalid OTP'),
    rideController.startRide
)

router.post('/end-ride',
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.endRide
)

router.post('/start-ride-direct',
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.startRideDirect
)

// Get all available rides for captains
router.get('/available-rides',
    authMiddleware.authCaptain,
    rideController.getAvailableRides
)

// Get rides by status for captains
router.get('/rides-by-status',
    authMiddleware.authCaptain,
    query('status').optional().isIn(['pending', 'accepted', 'ongoing', 'completed', 'cancelled']).withMessage('Invalid status'),
    query('vehicleType').optional().isIn(['auto', 'car', 'bike']).withMessage('Invalid vehicle type'),
    rideController.getRidesByStatus
)

// Enhanced Captain Ride Management Routes (temporarily commented out)
/*
// Accept a ride
router.post('/captain/accept',
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    captainRideController.acceptRide
)

// Cancel a ride (by captain)
router.post('/captain/cancel',
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    body('reason').optional().isString().withMessage('Reason must be a string'),
    captainRideController.cancelRide
)

// Start a ride with OTP
router.post('/captain/start',
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    body('otp').isString().isLength({ min: 4, max: 6 }).withMessage('Invalid OTP'),
    captainRideController.startRide
)

// End/Complete a ride
router.post('/captain/end',
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    captainRideController.endRide
)

// Get captain's current active ride
router.get('/captain/current',
    authMiddleware.authCaptain,
    captainRideController.getCurrentRide
)

// Update captain location during ride
router.post('/captain/location',
    authMiddleware.authCaptain,
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    captainRideController.updateLocation
)

*/

// Get user's ride history
router.get('/user/history',
    authMiddleware.authUser,
    query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Invalid limit'),
    query('status').optional().isIn(['pending', 'accepted', 'ongoing', 'completed', 'cancelled']).withMessage('Invalid status'),
    rideController.getUserRideHistory
);

// Get captain's ride history
router.get('/captain/history',
    authMiddleware.authCaptain,
    query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Invalid limit'),
    query('status').optional().isIn(['pending', 'accepted', 'ongoing', 'completed', 'cancelled']).withMessage('Invalid status'),
    rideController.getCaptainRideHistory
);

module.exports = router;