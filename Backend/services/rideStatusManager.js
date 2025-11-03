const rideModel = require("../models/ride.model");
const captainModel = require("../models/captain.model");
const userModel = require("../models/user.model");
const { sendMessageToSocketId, sendMessageToUser } = require("../socket");

class RideStatusManager {
  constructor() {
    this.statusTransitions = {
      pending: ['accepted', 'cancelled'],
      accepted: ['ongoing', 'cancelled'],
      ongoing: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    this.timeouts = new Map(); // Store ride timeouts
  }

  /**
   * Validate if status transition is allowed
   */
  isValidTransition(currentStatus, newStatus) {
    const allowedTransitions = this.statusTransitions[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
  }

  /**
   * Handle driver acceptance of ride (Step 2)
   */
  async handleDriverAcceptance(rideId, captainId) {
    console.log('🎯 RideStatusManager: Processing driver acceptance', {
      rideId,
      captainId,
      timestamp: new Date().toISOString()
    });

    try {
      // Find the ride and captain with proper population
      const [ride, captain] = await Promise.all([
        rideModel.findById(rideId).populate('user', 'socketId fullname phone'),
        captainModel.findById(captainId).populate('vehicle')
      ]);

      if (!ride) {
        throw new Error('Ride not found');
      }

      if (!captain) {
        throw new Error('Captain not found');
      }

      // Validate current status
      if (!this.isValidTransition(ride.status, 'accepted')) {
        throw new Error(`Cannot accept ride with status: ${ride.status}`);
      }

      // Check for race conditions - ensure ride is still pending
      const currentRide = await rideModel.findById(rideId);
      if (currentRide.status !== 'pending') {
        throw new Error(`Ride already ${currentRide.status} by another driver`);
      }

      // Update ride status to accepted
      const updatedRide = await rideModel.findByIdAndUpdate(
        rideId,
        {
          status: 'accepted',
          captain: captainId,
          acceptedAt: new Date(),
          $push: {
            statusHistory: {
              status: 'accepted',
              timestamp: new Date(),
              updatedBy: captainId,
              reason: 'Driver accepted the ride'
            }
          }
        },
        { new: true }
      ).populate([
        { path: 'user', select: 'socketId fullname phone' },
        { path: 'captain', select: 'socketId fullname phone vehicle' }
      ]);

      console.log('✅ Ride status updated to accepted:', {
        rideId: updatedRide._id,
        status: updatedRide.status,
        captainName: `${captain.fullname.firstname} ${captain.fullname.lastname}`
      });

      // Clear any existing timeout for this ride
      this.clearRideTimeout(rideId);

      // Notify passenger about driver assignment (Step 2)
      await this.notifyPassengerDriverAssigned(updatedRide);

      // Notify other drivers that ride is taken
      await this.notifyOtherDriversRideTaken(rideId, captainId);

      // Set timeout for driver to start ride (5 minutes)
      this.setDriverArrivalTimeout(rideId, 5 * 60 * 1000);

      // Return enhanced ride data for frontend
      return {
        ...updatedRide.toObject(),
        driverInfo: {
          _id: captain._id,
          fullname: captain.fullname,
          phone: captain.phone,
          vehicle: captain.vehicle,
          socketId: captain.socketId,
          rating: captain.rating || 4.5,
          estimatedArrival: await this.calculateETA(captain, updatedRide.pickup)
        },
        statusUpdate: {
          step: 2,
          title: 'Driver Assigned',
          description: `${captain.fullname.firstname} is on the way to pick you up`,
          timestamp: new Date()
        }
      };

    } catch (error) {
      console.error('❌ RideStatusManager: Error in driver acceptance:', error);
      throw error;
    }
  }

  /**
   * Notify passenger that driver has been assigned (Step 2)
   */
  async notifyPassengerDriverAssigned(ride) {
    if (!ride.user || !ride.user.socketId) {
      console.warn('⚠️ Cannot notify passenger - no socket connection');
      return false;
    }

    const driverInfo = {
      _id: ride.captain._id,
      fullname: ride.captain.fullname,
      phone: ride.captain.phone,
      vehicle: ride.captain.vehicle,
      rating: ride.captain.rating || 4.5,
      estimatedArrival: await this.calculateETA(ride.captain, ride.pickup)
    };

    const notificationData = {
      event: 'ride-accepted',
      data: {
        rideId: ride._id,
        status: 'accepted',
        step: 2,
        title: 'Driver Found!',
        message: `${ride.captain.fullname.firstname} is on the way to pick you up`,
        driverInfo,
        ride: ride.toObject(),
        timestamp: new Date(),
        estimatedPickupTime: driverInfo.estimatedArrival
      }
    };

    console.log('📱 Notifying passenger about driver assignment:', {
      userId: ride.user._id,
      socketId: ride.user.socketId,
      driverName: `${ride.captain.fullname.firstname} ${ride.captain.fullname.lastname}`
    });

    return sendMessageToSocketId(ride.user.socketId, notificationData);
  }

  /**
   * Notify other drivers that ride has been taken
   */
  async notifyOtherDriversRideTaken(rideId, acceptingCaptainId) {
    try {
      // Find all active captains except the one who accepted
      const otherCaptains = await captainModel.find({
        status: 'active',
        socketId: { $exists: true, $ne: null },
        _id: { $ne: acceptingCaptainId }
      });

      console.log(`🗑️ Notifying ${otherCaptains.length} other drivers about ride taken`);

      const notificationPromises = otherCaptains.map(captain => {
        return sendMessageToSocketId(captain.socketId, {
          event: 'ride-taken',
          data: {
            rideId,
            message: 'This ride has been accepted by another driver',
            timestamp: new Date()
          }
        });
      });

      await Promise.all(notificationPromises);
      console.log('✅ All other drivers notified about ride taken');

    } catch (error) {
      console.error('❌ Error notifying other drivers:', error);
    }
  }

  /**
   * Calculate estimated time of arrival
   */
  async calculateETA(captain, pickupAddress) {
    try {
      // Simple calculation - in production, use Google Maps API
      const baseTime = 5; // 5 minutes base time
      const randomFactor = Math.floor(Math.random() * 10); // 0-10 minutes
      return baseTime + randomFactor;
    } catch (error) {
      console.warn('⚠️ ETA calculation failed, using default:', error.message);
      return 8; // Default 8 minutes
    }
  }

  /**
   * Set timeout for driver arrival
   */
  setDriverArrivalTimeout(rideId, timeoutMs) {
    // Clear existing timeout
    this.clearRideTimeout(rideId);

    const timeoutId = setTimeout(async () => {
      try {
        console.log(`⏰ Driver arrival timeout for ride: ${rideId}`);
        
        const ride = await rideModel.findById(rideId).populate([
          { path: 'user', select: 'socketId fullname' },
          { path: 'captain', select: 'socketId fullname' }
        ]);

        if (ride && ride.status === 'accepted') {
          // Notify both parties about delay
          if (ride.user?.socketId) {
            sendMessageToSocketId(ride.user.socketId, {
              event: 'driver-delay-notification',
              data: {
                rideId: ride._id,
                message: 'Your driver is taking longer than expected. We\'re checking on their status.',
                timestamp: new Date()
              }
            });
          }

          if (ride.captain?.socketId) {
            sendMessageToSocketId(ride.captain.socketId, {
              event: 'pickup-reminder',
              data: {
                rideId: ride._id,
                message: 'Please update your status or contact the passenger.',
                timestamp: new Date()
              }
            });
          }
        }
      } catch (error) {
        console.error('❌ Error handling driver arrival timeout:', error);
      }
    }, timeoutMs);

    this.timeouts.set(rideId, timeoutId);
    console.log(`⏱️ Set driver arrival timeout for ride ${rideId}: ${timeoutMs}ms`);
  }

  /**
   * Clear ride timeout
   */
  clearRideTimeout(rideId) {
    const timeoutId = this.timeouts.get(rideId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(rideId);
      console.log(`🗑️ Cleared timeout for ride: ${rideId}`);
    }
  }

  /**
   * Handle ride status transitions with validation
   */
  async updateRideStatus(rideId, newStatus, updatedBy, reason = '') {
    try {
      const ride = await rideModel.findById(rideId);
      if (!ride) {
        throw new Error('Ride not found');
      }

      if (!this.isValidTransition(ride.status, newStatus)) {
        throw new Error(`Invalid status transition from ${ride.status} to ${newStatus}`);
      }

      const updatedRide = await rideModel.findByIdAndUpdate(
        rideId,
        {
          status: newStatus,
          [`${newStatus}At`]: new Date(),
          $push: {
            statusHistory: {
              status: newStatus,
              timestamp: new Date(),
              updatedBy,
              reason
            }
          }
        },
        { new: true }
      ).populate([
        { path: 'user', select: 'socketId fullname phone' },
        { path: 'captain', select: 'socketId fullname phone vehicle' }
      ]);

      // Handle specific status updates
      switch (newStatus) {
        case 'ongoing':
          await this.handleRideStart(updatedRide);
          break;
        case 'completed':
          await this.handleRideCompletion(updatedRide);
          break;
        case 'cancelled':
          await this.handleRideCancellation(updatedRide, reason);
          break;
      }

      return updatedRide;

    } catch (error) {
      console.error('❌ Error updating ride status:', error);
      throw error;
    }
  }

  /**
   * Handle ride start (Step 3)
   */
  async handleRideStart(ride) {
    console.log('🚗 Handling ride start:', ride._id);

    // Clear arrival timeout
    this.clearRideTimeout(ride._id);

    // Notify passenger
    if (ride.user?.socketId) {
      sendMessageToSocketId(ride.user.socketId, {
        event: 'ride-started',
        data: {
          rideId: ride._id,
          status: 'ongoing',
          step: 3,
          title: 'Ride Started',
          message: 'Your ride has started. Enjoy your trip!',
          timestamp: new Date()
        }
      });
    }
  }

  /**
   * Handle ride completion (Step 4)
   */
  async handleRideCompletion(ride) {
    console.log('🏁 Handling ride completion:', ride._id);

    // Clear any timeouts
    this.clearRideTimeout(ride._id);

    // Notify both parties
    const completionData = {
      rideId: ride._id,
      status: 'completed',
      step: 4,
      title: 'Ride Complete',
      message: 'Thank you for riding with us!',
      timestamp: new Date(),
      fare: ride.fare
    };

    if (ride.user?.socketId) {
      sendMessageToSocketId(ride.user.socketId, {
        event: 'ride-completed',
        data: completionData
      });
    }

    if (ride.captain?.socketId) {
      sendMessageToSocketId(ride.captain.socketId, {
        event: 'ride-completed',
        data: completionData
      });
    }
  }

  /**
   * Handle ride cancellation
   */
  async handleRideCancellation(ride, reason) {
    console.log('❌ Handling ride cancellation:', ride._id, reason);

    // Clear any timeouts
    this.clearRideTimeout(ride._id);

    const cancellationData = {
      rideId: ride._id,
      status: 'cancelled',
      step: 5,
      title: 'Ride Cancelled',
      message: reason || 'Your ride has been cancelled',
      timestamp: new Date()
    };

    // Notify both parties
    if (ride.user?.socketId) {
      sendMessageToSocketId(ride.user.socketId, {
        event: 'ride-cancelled',
        data: cancellationData
      });
    }

    if (ride.captain?.socketId) {
      sendMessageToSocketId(ride.captain.socketId, {
        event: 'ride-cancelled',
        data: cancellationData
      });
    }
  }

  /**
   * Get ride status summary for frontend
   */
  async getRideStatusSummary(rideId) {
    try {
      const ride = await rideModel.findById(rideId).populate([
        { path: 'user', select: 'fullname phone' },
        { path: 'captain', select: 'fullname phone vehicle rating' }
      ]);

      if (!ride) {
        throw new Error('Ride not found');
      }

      const stepMapping = {
        pending: 1,
        accepted: 2,
        ongoing: 3,
        completed: 4,
        cancelled: 5
      };

      return {
        rideId: ride._id,
        status: ride.status,
        step: stepMapping[ride.status] || 1,
        statusHistory: ride.statusHistory,
        driverInfo: ride.captain ? {
          _id: ride.captain._id,
          fullname: ride.captain.fullname,
          phone: ride.captain.phone,
          vehicle: ride.captain.vehicle,
          rating: ride.captain.rating || 4.5
        } : null,
        timestamps: {
          created: ride.createdAt,
          accepted: ride.acceptedAt,
          started: ride.startedAt,
          completed: ride.completedAt
        }
      };

    } catch (error) {
      console.error('❌ Error getting ride status summary:', error);
      throw error;
    }
  }

  /**
   * Cleanup method for graceful shutdown
   */
  cleanup() {
    console.log('🧹 Cleaning up RideStatusManager timeouts...');
    for (const [rideId, timeoutId] of this.timeouts.entries()) {
      clearTimeout(timeoutId);
      console.log(`Cleared timeout for ride: ${rideId}`);
    }
    this.timeouts.clear();
  }
}

// Export singleton instance
module.exports = new RideStatusManager();