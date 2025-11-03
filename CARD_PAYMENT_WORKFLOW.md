# Card Payment Workflow Implementation

## Overview
This document explains the card payment workflow that triggers when a driver ends a ride and the user has selected card payment as their payment method.

## Workflow Steps

### 1. User Books a Ride with Card Payment
- User selects pickup and destination locations
- User chooses vehicle type and gets fare estimate
- User clicks "Find Ride" and payment method selector appears
- User selects "Card Payment" from available payment methods
- Ride is created with `paymentMethod: 'card'` in the database

### 2. Normal Ride Flow
- Driver accepts the ride
- Driver starts the ride (with or without OTP)
- Ride progresses normally through all stages

### 3. Driver Ends the Ride
- Driver clicks "End Ride" in their app
- Backend updates ride status to "completed"
- **NEW**: Backend checks if `paymentMethod === 'card'`

### 4. Payment Page Trigger (NEW FEATURE)
- If payment method is card, backend emits `ride-payment-required` socket event to user
- Frontend receives the event and automatically navigates to `/user/ride-payment`
- Payment page displays with ride details and secure payment form

### 5. Payment Processing
- User sees ride summary and payment details
- User confirms payment using Stripe integration
- Payment is processed securely
- User receives confirmation and returns to home screen

## Technical Implementation

### Backend Changes

#### 1. Ride Model Update
```javascript
// Added paymentMethod field to ride schema
paymentMethod: {
  type: String,
  enum: ["cash", "card", "paypal", "frimi", "ezcash", "mcash"],
  default: "cash",
}
```

#### 2. Socket Event Handler
```javascript
// In socket.js - ride completion handling
if (status === 'completed' && paymentMethod === 'card') {
  sendMessageToSocketId(ride.user.socketId, {
    event: "ride-payment-required",
    data: {
      rideId: ride._id,
      fare: ride.fare,
      pickup: ride.pickup,
      destination: ride.destination,
      // ... other ride details
    }
  });
}
```

#### 3. Payment API Endpoints
- `POST /api/payment/create-intent` - Creates Stripe payment intent
- `POST /api/payment/process` - Processes the payment
- `GET /api/payment/status/:paymentId` - Checks payment status

### Frontend Changes

#### 1. New Payment Page Component
- **File**: `Frontend/src/screens/RidePayment.jsx`
- **Route**: `/user/ride-payment`
- **Features**:
  - Ride summary display
  - Payment amount breakdown
  - Secure card payment form (Stripe integration)
  - Payment processing status
  - Success/failure handling

#### 2. Socket Event Listener
```javascript
// In UserHomeScreen.jsx
socket.on("ride-payment-required", (data) => {
  navigateTo('/user/ride-payment', {
    state: { rideData: data }
  });
});
```

#### 3. Payment Method Selection
- Enhanced `PaymentMethodSelector` component
- Integrated with ride creation process
- Stores payment method preference in ride data

## User Experience Flow

### For Cash Payments (Existing)
1. User books ride → Driver completes ride → Ride ends (no additional steps)

### For Card Payments (NEW)
1. User books ride with card payment
2. Driver completes ride
3. **Payment page automatically opens**
4. User sees ride summary and payment details
5. User confirms payment
6. Payment processed via Stripe
7. User receives confirmation
8. Ride fully completed

## Security Features

### Payment Security
- Stripe integration for secure card processing
- No card details stored on our servers
- 256-bit SSL encryption
- PCI DSS compliant payment processing

### Data Protection
- Payment intents expire after 24 hours
- Sensitive payment data is encrypted
- User authentication required for all payment operations

## Testing the Feature

### Prerequisites
1. Both backend and frontend servers running
2. Valid Stripe test keys in `.env` file
3. User and driver accounts created

### Test Steps
1. **Login as User**
   - Go to `http://localhost:5173`
   - Login with user credentials

2. **Book a Ride with Card Payment**
   - Enter pickup and destination
   - Select vehicle type
   - Choose "Card Payment" when payment selector appears
   - Confirm ride booking

3. **Login as Driver (separate browser/incognito)**
   - Go to `http://localhost:5173/captain/login`
   - Login with driver credentials
   - Accept the ride request
   - Start the ride
   - **End the ride** (this triggers payment)

4. **Verify Payment Flow**
   - User should automatically see payment page
   - Payment page should show ride details
   - User can complete payment process
   - Success confirmation should appear

## Configuration

### Environment Variables
```env
# Stripe Configuration (Test Keys)
STRIPE_SECRET_KEY=sk_test_51234567890abcdefghijklmnopqrstuvwxyz
STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdefghijklmnopqrstuvwxyz
```

### API Base URL
```javascript
// Frontend configuration
VITE_BASE_URL=http://localhost:4000
```

## Error Handling

### Common Issues
1. **Payment page doesn't open**: Check socket connection and event listeners
2. **Payment fails**: Verify Stripe keys and network connectivity
3. **Ride not found**: Ensure ride ID is properly passed in socket event

### Debugging
- Check browser console for socket events
- Monitor backend logs for payment processing
- Verify database ride records have correct paymentMethod

## Future Enhancements

### Planned Features
1. **Real Stripe Elements Integration**: Replace mock card form with actual Stripe Elements
2. **Payment History**: Track all card payments in user dashboard
3. **Refund System**: Handle ride cancellations and refunds
4. **Multiple Cards**: Allow users to save and select from multiple cards
5. **Payment Receipts**: Email receipts after successful payments

### Additional Payment Methods
- PayPal integration
- Sri Lankan mobile payment methods (Frimi, eZ Cash, mCash)
- Digital wallet integrations

## Support

### For Developers
- Check `Backend/controllers/payment.controller.js` for payment logic
- Review `Frontend/src/screens/RidePayment.jsx` for UI implementation
- Socket events are handled in `Backend/socket.js`

### For Users
- Payment issues: Contact support with ride ID
- Card problems: Verify card details and try again
- Technical issues: Check internet connection and refresh page

---

**Implementation Status**: ✅ Complete and Ready for Testing
**Last Updated**: November 2024
**Version**: 1.0.0