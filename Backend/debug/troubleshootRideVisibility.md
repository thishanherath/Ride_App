# Troubleshooting: Driver Cannot See User's Booked Rides

## Problem Description
When a user books a ride and then you log out and log in as a driver, the driver cannot see the booked rides.

## Possible Causes & Solutions

### 1. **Authentication Issues**
**Problem**: Driver token is invalid or expired
**Check**: 
```bash
# Check if token exists in localStorage
console.log('Token:', localStorage.getItem('token'));
```
**Solution**: 
- Ensure driver is properly logged in
- Check token expiration (24h by default)
- Clear localStorage and re-login if needed

### 2. **Vehicle Type Mismatch**
**Problem**: Ride vehicle type doesn't match driver's vehicle type
**Check**: 
- User books ride for 'car' but driver has 'bike' vehicle
- Database has inconsistent vehicle type values

**Solution**:
```javascript
// Check driver's vehicle type
const captain = await captainModel.findById(captainId);
console.log('Driver vehicle type:', captain.vehicle.type);

// Check ride vehicle types
const rides = await rideModel.find({ status: 'pending' });
rides.forEach(ride => {
  console.log(`Ride ${ride._id}: vehicle=${ride.vehicle}`);
});
```

### 3. **Ride Status Issues**
**Problem**: Rides are not in 'pending' status
**Check**:
```javascript
// Check ride statuses
const allRides = await rideModel.find({});
console.log('All rides:', allRides.map(r => ({ id: r._id, status: r.status, vehicle: r.vehicle })));
```

**Solution**: Ensure rides are created with status 'pending'

### 4. **Database Connection Issues**
**Problem**: Driver and user are connecting to different databases
**Check**: 
- Verify MONGODB_URI in environment variables
- Check if both user and driver apps use same database

### 5. **Real-time Updates Not Working**
**Problem**: Socket.io events not properly emitted
**Check**:
```javascript
// In createRide function, verify this code runs:
captainsInRadius.map((captain) => {
  sendMessageToSocketId(captain.socketId, {
    event: "new-ride",
    data: rideWithUser,
  });
});
```

## Step-by-Step Debugging Process

### Step 1: Check Database State
```bash
# Run the debug script
node Backend/debug/testAvailableRides.js
```

### Step 2: Check Frontend Console
1. Open browser developer tools
2. Go to Console tab
3. Look for debug messages when fetching available rides
4. Check for any error messages

### Step 3: Check Backend Logs
1. Look at server console for debug messages
2. Check for any database connection errors
3. Verify authentication middleware is working

### Step 4: Manual Database Check
```javascript
// Connect to MongoDB and run these queries:

// 1. Check pending rides
db.rides.find({ status: "pending" })

// 2. Check captains
db.captains.find({}, { fullname: 1, "vehicle.type": 1, status: 1 })

// 3. Check users
db.users.find({}, { fullname: 1, rides: 1 })
```

### Step 5: Test API Endpoints Manually
```bash
# Test available rides endpoint
curl -X GET "http://localhost:3000/ride/available-rides" \
  -H "token: YOUR_CAPTAIN_TOKEN"

# Test create ride endpoint
curl -X POST "http://localhost:3000/ride/create" \
  -H "Content-Type: application/json" \
  -H "token: YOUR_USER_TOKEN" \
  -d '{
    "pickup": "Test Pickup Location",
    "destination": "Test Destination",
    "vehicleType": "car"
  }'
```

## Common Fixes

### Fix 1: Clear All Data and Start Fresh
```javascript
// Clear localStorage
localStorage.clear();

// In MongoDB, clear test data
db.rides.deleteMany({ status: "pending" });
```

### Fix 2: Ensure Proper Vehicle Type Matching
```javascript
// In ride creation, ensure vehicle type is consistent
const validVehicleTypes = ['car', 'bike', 'auto'];
if (!validVehicleTypes.includes(vehicleType)) {
  throw new Error('Invalid vehicle type');
}
```

### Fix 3: Add Fallback for Map Service
```javascript
// In getAvailableRides, handle map service errors gracefully
try {
  const pickupCoordinates = await mapService.getAddressCoordinate(ride.pickup);
  // ... distance calculation
} catch (mapError) {
  console.warn('Map service unavailable, using fallback');
  // Return ride without distance calculation
}
```

### Fix 4: Improve Error Handling
```javascript
// Add better error responses
if (!captain.vehicle || !captain.vehicle.type) {
  return res.status(400).json({ 
    message: "Captain vehicle type not defined",
    rides: [],
    total: 0 
  });
}
```

## Testing Checklist

- [ ] User can create rides successfully
- [ ] Rides appear in database with status 'pending'
- [ ] Driver can authenticate successfully
- [ ] Driver's vehicle type is properly set
- [ ] Available rides API returns correct data
- [ ] Frontend displays rides correctly
- [ ] Real-time updates work via socket.io
- [ ] Distance calculation works (or has fallback)
- [ ] Error handling works properly

## Environment Variables to Check

```bash
# Backend .env
MONGODB_URI=mongodb://localhost:27017/quickride
JWT_SECRET=your-secret-key
GOOGLE_MAPS_API_KEY=your-api-key (optional)

# Frontend .env
VITE_SERVER_URL=http://localhost:3000
```

## Quick Test Script

Create a test user and captain, then test the flow:

```javascript
// 1. Create test user and book ride
// 2. Create test captain with matching vehicle type
// 3. Login as captain and check available rides
// 4. Verify ride appears in captain's available rides list
```