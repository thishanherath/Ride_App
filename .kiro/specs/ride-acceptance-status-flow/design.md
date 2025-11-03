# Design Document

## Overview

This design document outlines the technical approach for implementing a robust ride acceptance and status flow system in the QuickRide application. The system will provide real-time updates, proper error handling, and seamless user experience from ride confirmation to completion.

## Architecture

### System Flow Diagram

```
User Side:                    Backend:                     Driver Side:
┌─────────────┐              ┌─────────────┐              ┌─────────────┐
│ Confirm Ride│─────────────▶│ Create Ride │              │             │
│             │              │ Status:     │              │             │
│ Status:     │              │ "pending"   │              │             │
│ "searching" │              │             │              │             │
└─────────────┘              └─────────────┘              └─────────────┘
       │                            │                             │
       │                            ▼                             │
       │                     ┌─────────────┐                     │
       │                     │ Notify      │────────────────────▶│
       │                     │ Nearby      │                     │
       │                     │ Drivers     │                     │
       │                     └─────────────┘                     │
       │                                                         │
       │                                                         ▼
       │                                                  ┌─────────────┐
       │                                                  │ View        │
       │                                                  │ Available   │
       │                                                  │ Rides       │
       │                                                  └─────────────┘
       │                                                         │
       │                                                         ▼
       │                     ┌─────────────┐                     │
       │◀────────────────────│ Update Ride │◀────────────────────│
       │                     │ Status:     │                     │
       │                     │ "accepted"  │                     │
       │                     └─────────────┘                     │
       ▼                            │                             ▼
┌─────────────┐                     ▼                      ┌─────────────┐
│ Show Driver │              ┌─────────────┐               │ Start Ride  │
│ Details &   │              │ Auto Start  │               │ Navigation  │
│ ETA         │              │ Ride        │               │             │
└─────────────┘              │ Status:     │               └─────────────┘
                             │ "ongoing"   │
                             └─────────────┘
```

### Component Architecture

#### Frontend Components

1. **RideStatusManager** - Central state management for ride status
2. **RideProgressIndicator** - Visual progress bar component
3. **DriverAcceptanceNotification** - Real-time driver assignment alerts
4. **RideStatusNotification** - Status update display component
5. **SocketEventHandler** - Manages real-time socket communications

#### Backend Services

1. **RideService** - Core ride business logic
2. **SocketService** - Real-time event management
3. **NotificationService** - Push notification handling
4. **LocationService** - Driver-ride matching and distance calculations

## Components and Interfaces

### Frontend State Management

```typescript
interface RideState {
  rideId: string | null;
  status: 'idle' | 'searching' | 'accepted' | 'ongoing' | 'completed' | 'cancelled';
  rideDetails: RideDetails | null;
  driverInfo: DriverInfo | null;
  estimatedArrival: number | null;
  progress: number;
  error: string | null;
}

interface RideActions {
  createRide: (rideData: CreateRideRequest) => Promise<void>;
  updateRideStatus: (status: RideStatus) => void;
  setDriverInfo: (driver: DriverInfo) => void;
  setError: (error: string) => void;
  resetRide: () => void;
}
```

### Socket Event Interface

```typescript
interface SocketEvents {
  // User events
  'ride-confirmed': (data: RideConfirmedData) => void;
  'ride-started': (data: RideStartedData) => void;
  'ride-ended': (data: RideEndedData) => void;
  'captain-location-update': (data: LocationUpdate) => void;
  
  // Driver events
  'new-ride': (data: NewRideData) => void;
  'ride-cancelled': (data: RideCancelledData) => void;
  
  // Common events
  'error': (data: ErrorData) => void;
  'reconnect': () => void;
}
```

### API Endpoints

```typescript
// Ride Management
POST /ride/create          // Create new ride
POST /ride/confirm         // Driver accepts ride
POST /ride/start-direct    // Auto-start ride without OTP
POST /ride/end             // Complete ride
GET  /ride/cancel          // Cancel ride

// Real-time Updates
GET  /ride/available       // Get available rides for drivers
GET  /ride/status/:rideId  // Get current ride status
POST /ride/update-location // Update driver location
```

## Data Models

### Enhanced Ride Model

```javascript
const rideSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  captain: { type: ObjectId, ref: 'Captain' },
  pickup: { type: String, required: true },
  destination: { type: String, required: true },
  fare: { type: Number, required: true },
  vehicle: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Enhanced fields for better tracking
  acceptedAt: { type: Date },
  startedAt: { type: Date },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  
  // Driver assignment tracking
  assignmentTimeout: { type: Date },
  driverSearchRadius: { type: Number, default: 5 }, // km
  
  // Real-time tracking
  estimatedArrival: { type: Number }, // minutes
  actualDuration: { type: Number }, // seconds
  
  // Status history for debugging
  statusHistory: [{
    status: String,
    timestamp: Date,
    updatedBy: String, // 'user', 'captain', 'system'
    _id: false
  }],
  
  // Existing fields...
  duration: Number,
  distance: Number,
  otp: { type: String, select: false },
  messages: [MessageSchema]
}, { 
  timestamps: true,
  // Add indexes for performance
  indexes: [
    { status: 1, vehicle: 1 },
    { captain: 1, status: 1 },
    { user: 1, createdAt: -1 }
  ]
});
```

### Socket Connection Tracking

```javascript
const socketConnectionSchema = new mongoose.Schema({
  userId: { type: ObjectId, required: true },
  userType: { type: String, enum: ['user', 'captain'], required: true },
  socketId: { type: String, required: true },
  connectedAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});
```

## Error Handling

### Frontend Error Handling

```typescript
class RideErrorHandler {
  static handleSocketError(error: SocketError): void {
    switch (error.type) {
      case 'CONNECTION_LOST':
        // Attempt reconnection
        this.attemptReconnection();
        break;
      case 'RIDE_ACCEPTANCE_FAILED':
        // Show user-friendly error
        this.showRideError(error.message);
        break;
      case 'TIMEOUT':
        // Handle timeout scenarios
        this.handleTimeout(error.context);
        break;
    }
  }
  
  static attemptReconnection(): void {
    // Exponential backoff reconnection strategy
  }
  
  static showRideError(message: string): void {
    // Display error notification to user
  }
}
```

### Backend Error Handling

```javascript
class RideServiceError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

const errorCodes = {
  RIDE_NOT_FOUND: 'RIDE_NOT_FOUND',
  RIDE_ALREADY_ACCEPTED: 'RIDE_ALREADY_ACCEPTED',
  DRIVER_NOT_AVAILABLE: 'DRIVER_NOT_AVAILABLE',
  SOCKET_CONNECTION_FAILED: 'SOCKET_CONNECTION_FAILED'
};
```

## Testing Strategy

### Unit Tests

1. **RideService Tests**
   - Ride creation logic
   - Status transition validation
   - Driver assignment algorithm
   - Error handling scenarios

2. **Socket Event Tests**
   - Event emission verification
   - Connection handling
   - Reconnection logic
   - Message delivery confirmation

3. **Component Tests**
   - RideStatusNotification rendering
   - Progress indicator updates
   - Error state handling
   - User interaction flows

### Integration Tests

1. **End-to-End Ride Flow**
   - User creates ride → Driver accepts → Ride starts → Ride completes
   - Real-time status updates verification
   - Socket communication testing
   - Database state consistency

2. **Error Scenarios**
   - Network disconnection handling
   - Concurrent ride acceptance
   - Driver cancellation flows
   - Timeout handling

### Performance Tests

1. **Socket Performance**
   - Multiple concurrent connections
   - Message delivery latency
   - Connection stability under load

2. **Database Performance**
   - Ride query optimization
   - Index effectiveness
   - Concurrent update handling

## Implementation Plan

### Phase 1: Core Infrastructure
- Enhanced ride model with status tracking
- Improved socket event handling
- Basic error handling framework

### Phase 2: Real-time Updates
- RideStatusNotification component
- Progress indicator implementation
- Socket reconnection logic

### Phase 3: User Experience
- Smooth status transitions
- Loading states and animations
- Error recovery mechanisms

### Phase 4: Monitoring & Analytics
- Status change logging
- Performance metrics
- Error tracking and alerting

## Security Considerations

### Authentication & Authorization
- Verify user/driver tokens for all ride operations
- Validate ride ownership before status updates
- Secure socket connections with authentication

### Data Validation
- Sanitize all ride data inputs
- Validate status transition rules
- Prevent unauthorized ride modifications

### Rate Limiting
- Limit ride creation frequency per user
- Throttle status update requests
- Prevent socket event flooding

## Performance Optimizations

### Database Optimizations
- Compound indexes for ride queries
- Connection pooling for high concurrency
- Query optimization for driver matching

### Frontend Optimizations
- Debounced status updates
- Efficient re-rendering with React.memo
- Lazy loading of ride history

### Socket Optimizations
- Connection pooling and reuse
- Message batching for bulk updates
- Automatic cleanup of stale connections

## Monitoring and Logging

### Key Metrics
- Ride acceptance rate
- Average driver response time
- Socket connection stability
- Error rates by category

### Logging Strategy
- Structured logging with correlation IDs
- Real-time error alerting
- Performance monitoring dashboards
- User journey tracking

This design provides a comprehensive foundation for implementing a robust ride acceptance and status flow system that ensures reliable real-time updates and excellent user experience.