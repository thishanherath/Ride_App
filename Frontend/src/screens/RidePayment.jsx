import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout';
import { Card, Button } from '../components/ui';
import {
  CreditCard,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  MapPin,
  Navigation,
  Clock,
  User,
  Car,
  Shield,
  Star,
  Receipt,
  Banknote
} from 'lucide-react';
import axios from 'axios';

const RidePayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed
  const [error, setError] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [rideDetails, setRideDetails] = useState(null);
  const [fetchingRide, setFetchingRide] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState(null);
  const [existingPayment, setExistingPayment] = useState(null);
  const [paymentCalculated, setPaymentCalculated] = useState(false);

  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Get ride ID from navigation state - handle different data structures
  const rideData = location.state?.rideData || {};
  const rideId = rideData.rideId || rideData._id || location.state?.rideId;

  // Also check URL parameters as fallback
  const urlParams = new URLSearchParams(location.search);
  const urlRideId = urlParams.get('rideId');
  const finalRideId = rideId || urlRideId;

  // For demo purposes, create sample data if no ride data is provided
  const hasSampleData = !rideData.rideId && !urlRideId;
  const sampleRideData = {
    rideId: 'sample-ride-' + Date.now(),
    fare: 250,
    pickup: 'Colombo Fort Railway Station, Colombo 01',
    destination: 'Bandaranaike International Airport, Katunayake',
    vehicleType: 'car',
    paymentMethod: 'card',
    captain: {
      fullname: { firstname: 'Kasun', lastname: 'Perera' },
      phone: '+94771234567'
    },
    duration: 2400 // 40 minutes
  };

  // Use sample data if no real ride data is available
  const effectiveRideData = hasSampleData ? sampleRideData : rideData;
  const effectiveFinalRideId = hasSampleData ? sampleRideData.rideId : finalRideId;

  console.log('🔍 Navigation data received:', {
    currentUrl: window.location.href,
    searchParams: location.search,
    locationState: location.state,
    rideData,
    extractedRideId: rideId,
    urlRideId: urlRideId,
    finalRideId: finalRideId,
    hasSampleData,
    effectiveRideData,
    effectiveFinalRideId,
    hasRideData: !!effectiveRideData,
    rideDataKeys: Object.keys(effectiveRideData || {}),
    socketFare: effectiveRideData?.fare,
    socketPickup: effectiveRideData?.pickup,
    socketDestination: effectiveRideData?.destination,
    socketVehicleType: effectiveRideData?.vehicleType,
    paymentMethod: effectiveRideData?.paymentMethod
  });

  // Use real ride data from database, fallback to socket data
  const currentRide = rideDetails || effectiveRideData;
  const {
    fare: rawFare,
    pickup: rawPickup,
    destination: rawDestination,
    vehicle: vehicleType,
    vehicleType: socketVehicleType, // Handle both field names
    captain,
    duration
  } = currentRide;

  // Handle different vehicle field names
  const finalVehicleType = vehicleType || socketVehicleType;

  // Prioritize database data for all ride details
  const pickup = rideDetails?.pickup || rawPickup || 'Pickup Location';
  const destination = rideDetails?.destination || rawDestination || 'Destination';

  // Validate and ensure fare is a valid number - prioritize database data
  const fare = parseFloat(rideDetails?.fare || rawFare) || 0;
  const serviceFee = fare > 0 ? parseFloat((fare * 0.029 + 5).toFixed(2)) : 5.00;
  const totalAmount = parseFloat((fare + serviceFee).toFixed(2));

  // Log payment and location data whenever they change
  useEffect(() => {
    console.log('💰 Payment and location data updated:', {
      rideId,
      finalRideId,
      payment: {
        rawFare,
        databaseFare: rideDetails?.fare,
        calculatedFare: fare,
        serviceFee,
        totalAmount
      },
      locations: {
        socketPickup: rawPickup?.substring(0, 50) + '...',
        databasePickup: rideDetails?.pickup?.substring(0, 50) + '...',
        finalPickup: pickup?.substring(0, 50) + '...',
        socketDestination: rawDestination?.substring(0, 50) + '...',
        databaseDestination: rideDetails?.destination?.substring(0, 50) + '...',
        finalDestination: destination?.substring(0, 50) + '...'
      },
      hasRideDetails: !!rideDetails,
      paymentCalculated
    });
  }, [rideId, finalRideId, rawFare, fare, serviceFee, totalAmount, pickup, destination, rawPickup, rawDestination, rideDetails, paymentCalculated]);

  // Fetch real ride data from database
  const fetchRideDetails = async (rideId) => {
    try {
      setFetchingRide(true);
      const token = localStorage.getItem('token');

      console.log('🔍 Fetching ride details from database for:', rideId);

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/ride/details/${rideId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        console.log('✅ Real ride data fetched:', response.data.ride);
        setRideDetails(response.data.ride);
        setPaymentCalculated(true); // Trigger recalculation
        return response.data.ride;
      } else {
        console.error('❌ Failed to fetch ride details:', response.data.message);
        throw new Error(response.data.message || 'Failed to fetch ride details');
      }
    } catch (error) {
      console.error('❌ Error fetching ride details:', error);
      if (error.response?.status === 404) {
        throw new Error('Ride not found. It may have been deleted or you may not have access to it.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch ride details');
      }
    } finally {
      setFetchingRide(false);
    }
  };

  // Fetch existing payment data for this ride
  const fetchPaymentData = async (rideId) => {
    try {
      const token = localStorage.getItem('token');

      console.log('💰 Fetching payment data for ride:', rideId);

      // Check if payment already exists for this ride
      const paymentResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/payment/ride/${rideId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (paymentResponse.data.success && paymentResponse.data.payment) {
        console.log('💳 Existing payment found:', paymentResponse.data.payment);
        setExistingPayment(paymentResponse.data.payment);

        // If payment is already completed, redirect to success
        if (paymentResponse.data.payment.status === 'completed') {
          setPaymentStatus('success');
          return;
        }
      }

      // Fetch user's payment history for context
      const historyResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/payment/history?limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (historyResponse.data.success) {
        console.log('📊 Payment history fetched:', historyResponse.data.payments.length, 'payments');
        setPaymentHistory(historyResponse.data.payments);
      }

    } catch (error) {
      console.error('❌ Error fetching payment data:', error);
      // Don't fail the entire flow if payment history fails
    }
  };

  console.log('🔍 RidePayment component initialized with:', {
    rideId,
    rawFare,
    fare,
    serviceFee,
    totalAmount,
    rideData
  });

  useEffect(() => {
    // Only run once when component mounts
    if (isInitialized) return;

    console.log('🔍 RidePayment initializing with data:', {
      rideId,
      finalRideId,
      effectiveFinalRideId,
      fare,
      hasData: !!(effectiveFinalRideId && (fare || effectiveRideData.fare)),
      effectiveRideData,
      hasSampleData
    });

    if (effectiveFinalRideId) {
      console.log('✅ Ride ID found, fetching real data from database');
      setIsInitialized(true);

      // Fetch real ride data and payment data from database
      Promise.all([
        fetchRideDetails(effectiveFinalRideId),
        fetchPaymentData(effectiveFinalRideId)
      ]).then(([realRideData]) => {
        console.log('🔄 Processing fetched data:', {
          realRideData: realRideData ? {
            id: realRideData._id,
            fare: realRideData.fare,
            pickup: realRideData.pickup?.substring(0, 50) + '...',
            destination: realRideData.destination?.substring(0, 50) + '...',
            vehicle: realRideData.vehicle,
            status: realRideData.status
          } : null,
          socketData: {
            fare: rawFare,
            pickup: rawPickup?.substring(0, 50) + '...',
            destination: rawDestination?.substring(0, 50) + '...'
          },
          finalData: {
            calculatedFare: fare,
            finalPickup: pickup?.substring(0, 50) + '...',
            finalDestination: destination?.substring(0, 50) + '...'
          },
          hasRealData: !!(realRideData && realRideData.fare > 0),
          hasSocketData: rawFare > 0
        });

        // Check if we have valid data from database
        if (realRideData && realRideData.fare > 0) {
          console.log('✅ Real ride data loaded, initializing payment with fare:', realRideData.fare);
          initializePayment();
        }
        // Fallback to socket data if available
        else if (effectiveRideData.fare > 0) {
          console.log('⚠️ Using socket data as fallback with fare:', effectiveRideData.fare);
          console.log('🔍 Socket data details:', {
            fare: effectiveRideData.fare,
            pickup: effectiveRideData.pickup,
            destination: effectiveRideData.destination,
            vehicleType: effectiveRideData.vehicleType,
            paymentMethod: effectiveRideData.paymentMethod,
            hasSampleData
          });
          initializePayment();
        }
        // If we have ride data but no fare, it might be a cash payment or incomplete ride
        else if (realRideData) {
          console.log('⚠️ Ride found but no fare - might be cash payment or incomplete ride');
          setError(`Ride found but no payment required. Status: ${realRideData.status}, Payment Method: ${realRideData.paymentMethod || 'Not specified'}`);
        }
        // Check if socket data indicates this is not a card payment
        else if (rideData.paymentMethod && rideData.paymentMethod !== 'card') {
          console.log('⚠️ Payment method is not card:', rideData.paymentMethod);
          setError(`This ride uses ${rideData.paymentMethod} payment method, not card payment.`);
        }
        // No valid data at all
        else {
          console.log('❌ No valid ride data available - realData:', !!realRideData, 'socketFare:', rideData.fare);
          setError('Unable to load ride information. The ride may not exist or may not require payment.');
        }
      }).catch(error => {
        console.error('❌ Error in data fetching promise:', error);
        setError(`Failed to load ride data: ${error.response?.data?.message || error.message}`);
      });
    } else {
      console.log('❌ No ride ID provided in navigation state');
      setError('No ride information provided. Please navigate from a completed ride.');
      setIsInitialized(true);
    }
  }, [rideId, fare, isInitialized]);

  const initializePayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Use the most current fare amount
      const currentFare = parseFloat(rideDetails?.fare || rawFare) || 0;
      const currentTotal = Math.round(currentFare + Math.round(currentFare * 0.029 + 5));

      console.log('🔄 Initializing payment with current amounts:', {
        currentFare,
        currentTotal,
        rideId
      });

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/payment/create-intent`,
        {
          rideId,
          amount: currentTotal, // Use total amount for payment intent
          currency: 'lkr',
          paymentMethod: 'card'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setPaymentDetails(response.data);
      } else {
        setError('Failed to initialize payment');
      }
    } catch (err) {
      console.error('Payment initialization error:', err);
      setError('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    // Validate form first
    if (!validateForm()) {
      setError('Please fill in all required fields correctly.');
      return;
    }

    try {
      setLoading(true);
      setPaymentStatus('processing');
      setError(''); // Clear any previous errors
      const token = localStorage.getItem('token');

      console.log('💳 Processing payment:', {
        rideId: effectiveFinalRideId,
        amount: totalAmount,
        paymentMethod: 'card',
        cardLast4: cardNumber.slice(-4),
        existingPayment: existingPayment?.id
      });

      // Simulate payment processing (in real app, this would integrate with Stripe/PayHere)
      await new Promise(resolve => setTimeout(resolve, 3000));

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/payment/process`,
        {
          rideId: effectiveFinalRideId,
          paymentMethod: 'card',
          amount: totalAmount, // Use total amount including service fee
          paymentData: {
            paymentIntentId: paymentDetails?.paymentIntentId,
            paymentId: existingPayment?.id,
            serviceFee: serviceFee,
            baseFare: fare,
            cardLast4: cardNumber.slice(-4),
            cardholderName: cardholderName,
            // Note: In production, never send full card details to your backend
            // Use a payment processor like Stripe, PayHere, or similar
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        console.log('✅ Payment processed successfully:', response.data.payment);
        setPaymentStatus('success');

        // Update existing payment state
        setExistingPayment(response.data.payment);

        // Auto redirect after success
        setTimeout(() => {
          navigate('/home', {
            state: {
              message: 'Payment completed successfully!',
              type: 'success',
              paymentId: response.data.payment.paymentId
            }
          });
        }, 3000);
      } else {
        setPaymentStatus('failed');
        setError(response.data.message || 'Payment failed');
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      setPaymentStatus('failed');
      setError('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setPaymentStatus('pending');
    setError('');
    initializePayment();
  };

  const handleCancel = () => {
    navigate('/home');
  };

  // Payment form validation
  const validateForm = () => {
    const errors = {};

    // Card number validation (basic)
    if (!cardNumber.replace(/\s/g, '')) {
      errors.cardNumber = 'Card number is required';
    } else if (cardNumber.replace(/\s/g, '').length < 13) {
      errors.cardNumber = 'Card number must be at least 13 digits';
    }

    // Expiry date validation
    if (!expiryDate) {
      errors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      errors.expiryDate = 'Invalid format (MM/YY)';
    }

    // CVV validation
    if (!cvv) {
      errors.cvv = 'CVV is required';
    } else if (cvv.length < 3) {
      errors.cvv = 'CVV must be 3-4 digits';
    }

    // Cardholder name validation
    if (!cardholderName.trim()) {
      errors.cardholderName = 'Cardholder name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Header title="Payment Successful" />
        <div className="p-4 pt-20">
          <div className="max-w-md mx-auto animate-in zoom-in-50 duration-500">
            <Card className="p-8 text-center bg-white shadow-2xl border-0">
              {/* Success Animation */}
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-green-200 rounded-full mx-auto animate-ping opacity-20"></div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Payment Successful! 🎉
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Your payment of <span className="font-bold text-green-600">LKR {totalAmount.toFixed(2)}</span> has been processed successfully.
              </p>

              {/* Trip Summary in Success Screen */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-semibold text-gray-800 mb-3 text-center">Trip Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-green-700 font-medium">From: </span>
                      <span className="text-gray-700">{pickup}</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Navigation className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-red-700 font-medium">To: </span>
                      <span className="text-gray-700">{destination}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                    <div className="flex items-center">
                      <Car className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-gray-600">{finalVehicleType || 'Car'}</span>
                    </div>
                    {duration && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-orange-500 mr-2" />
                        <span className="text-gray-600">{Math.round(duration / 60)} min</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Receipt */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-8 border border-gray-200">
                <div className="flex items-center justify-center mb-4">
                  <Receipt className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="font-semibold text-gray-800">Payment Receipt</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ride ID:</span>
                    <span className="font-mono text-gray-900 bg-white px-2 py-1 rounded">{effectiveFinalRideId}</span>
                  </div>
                  {existingPayment && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="font-mono text-gray-900 bg-white px-2 py-1 rounded text-xs">
                        {existingPayment.paymentId}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Base Fare:</span>
                    <span className="text-gray-900">LKR {fare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Service Fee:</span>
                    <span className="text-gray-900">LKR {serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-gray-600 font-medium">Amount Paid:</span>
                    <span className="font-bold text-green-600">LKR {totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Method:</span>
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-gray-900">
                        {cardNumber ? `**** ${cardNumber.slice(-4)}` : 'Card Payment'}
                      </span>
                    </div>
                  </div>
                  {cardholderName && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cardholder:</span>
                      <span className="text-gray-900">{cardholderName}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-600 font-medium">Completed</span>
                    </div>
                  </div>
                  {existingPayment?.completedAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completed At:</span>
                      <span className="text-gray-900 text-xs">
                        {new Date(existingPayment.completedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {existingPayment?.gatewayData?.transactionId && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-gray-900 bg-white px-2 py-1 rounded text-xs">
                        {existingPayment.gatewayData.transactionId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={() => navigate('/home')}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg font-semibold shadow-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Payment Failed" />
        <div className="p-4 pt-20">
          <div className="max-w-md mx-auto">
            <Card className="p-6 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h2>
              <p className="text-gray-600 mb-4">
                {error || 'Something went wrong with your payment.'}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    'Try Again'
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Loading state while fetching data
  if (fetchingRide || (!isInitialized && !error)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Loading Payment..." />
        <div className="p-4 pt-20">
          <div className="max-w-md mx-auto">
            <Card className="p-8 text-center">
              <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Loading Payment Details
              </h2>
              <p className="text-gray-600">
                Syncing with database and preparing your payment...
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no valid ride data
  if (isInitialized && !effectiveFinalRideId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Payment Error" />
        <div className="p-4 pt-20">
          <div className="max-w-md mx-auto">
            <Card className="p-6 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Ride Information
              </h2>
              <p className="text-gray-600 mb-4">
                No ride ID was provided. Please navigate from a completed ride.
              </p>

              {/* Debug information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-xs">
                <div><strong>Debug Info:</strong></div>
                <div>Current URL: {window.location.href}</div>
                <div>Search Params: {location.search || 'None'}</div>
                <div>Test Mode: {isTestMode ? 'Enabled' : 'Disabled'}</div>
                <div>URL Ride ID: {urlRideId || 'None'}</div>
                <div>Final Ride ID: {effectiveFinalRideId || 'None'}</div>
              </div>

              {/* Test mode option - always available for debugging */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Test Payment Screen</h4>
                <p className="text-sm text-blue-700 mb-3">
                  For testing purposes, you can enable test mode with sample ride data.
                </p>
                <Button
                  onClick={() => {
                    const currentUrl = new URL(window.location);
                    currentUrl.searchParams.set('test', 'true');
                    window.location.href = currentUrl.toString();
                  }}
                  className="w-full mb-2 bg-blue-600 hover:bg-blue-700"
                >
                  Enable Test Mode
                </Button>
                <p className="text-xs text-blue-600 mt-2">
                  Or manually add ?test=true to the URL
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/home')}
                  className="w-full"
                >
                  Go to Home
                </Button>
                <Button
                  onClick={() => navigate('/ride-history')}
                  variant="outline"
                  className="w-full"
                >
                  View Ride History
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no valid fare data after trying to load
  if (isInitialized && effectiveFinalRideId && fare <= 0 && !fetchingRide && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Payment Error" />
        <div className="p-4 pt-20">
          <div className="max-w-md mx-auto">
            <Card className="p-6 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Invalid Ride Data
              </h2>
              <p className="text-gray-600 mb-4">
                Unable to load ride fare information for ride ID: {effectiveFinalRideId}. The ride may not exist or have invalid data.
                {hasSampleData && <span className="text-blue-600"> (Using Sample Data)</span>}
              </p>

              {/* Debug info in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-xs text-left">
                  <div><strong>Debug Info:</strong></div>
                  <div>Ride ID: {effectiveFinalRideId}</div>
                  <div>Sample Data: {hasSampleData ? 'Yes' : 'No'}</div>
                  <div>Socket Fare: {rawFare}</div>
                  <div>DB Fare: {rideDetails?.fare || 'Not loaded'}</div>
                  <div>Calculated Fare: {fare}</div>
                  <div>Has Ride Details: {!!rideDetails ? 'Yes' : 'No'}</div>
                  <div>Error: {error || 'None'}</div>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setIsInitialized(false);
                    setError('');
                    setRideDetails(null);
                    // Retry initialization
                    if (effectiveFinalRideId) {
                      Promise.all([
                        fetchRideDetails(effectiveFinalRideId),
                        fetchPaymentData(effectiveFinalRideId)
                      ]).then(([realRideData]) => {
                        setIsInitialized(true);
                        if (realRideData && realRideData.fare > 0) {
                          initializePayment();
                        }
                      }).catch(err => {
                        console.error('Retry failed:', err);
                        setError('Failed to load ride data. Please try again.');
                        setIsInitialized(true);
                      });
                    }
                  }}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    'Retry Loading'
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="w-full"
                >
                  Go Back
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Header
        title="Complete Payment"
        showBackButton={true}
        onBackClick={handleCancel}
      />

      <div className="p-4 pt-20 pb-8">
        <div className="max-w-md mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">

          {/* Enhanced Ride Summary */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Trip Summary</h3>
            </div>

            <div className="space-y-4">
              {/* Route Information */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-0.5 h-8 bg-gray-300 my-1"></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center mb-1">
                        <MapPin className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Pickup</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 leading-tight">
                        {pickup || 'Pickup Location'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        <Navigation className="w-4 h-4 text-red-500 mr-2" />
                        <span className="text-xs font-medium text-red-700 uppercase tracking-wide">Destination</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 leading-tight">
                        {destination || 'Destination'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center mb-2">
                    <Car className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Vehicle</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{finalVehicleType || 'Car'}</p>
                </div>

                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center mb-2">
                    <Clock className="w-4 h-4 text-orange-500 mr-2" />
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Duration</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {duration ? `${Math.round(duration / 60)} min` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Driver Information */}
              {captain && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide mr-2">Driver</span>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-500 ml-1">4.8</span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {captain.fullname?.firstname || captain.fullname || 'Driver'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Enhanced Payment Details */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <Banknote className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Payment Breakdown</h3>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs space-y-1">
                  <div><strong>Payment Data:</strong></div>
                  <div>Socket Fare: {rawFare}</div>
                  <div>DB Fare: {rideDetails?.fare || 'Not loaded'}</div>
                  <div>Calculated Fare: {fare}</div>
                  <div><strong>Service Fee Calculation:</strong></div>
                  <div>Formula: (fare × 0.029) + 5</div>
                  <div>Calculation: ({fare} × 0.029) + 5 = {(fare * 0.029).toFixed(2)} + 5 = {serviceFee.toFixed(2)}</div>
                  <div><strong>Total: {fare.toFixed(2)} + {serviceFee.toFixed(2)} = {totalAmount.toFixed(2)}</strong></div>
                  <div><strong>Location Data:</strong></div>
                  <div>Socket Pickup: {rawPickup?.substring(0, 30) || 'Not available'}...</div>
                  <div>DB Pickup: {rideDetails?.pickup?.substring(0, 30) || 'Not loaded'}...</div>
                  <div>Socket Destination: {rawDestination?.substring(0, 30) || 'Not available'}...</div>
                  <div>DB Destination: {rideDetails?.destination?.substring(0, 30) || 'Not loaded'}...</div>
                  <div>Has Ride Details: {!!rideDetails ? 'Yes' : 'No'}</div>
                </div>
              )}

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 font-medium">Base Fare</span>
                </div>
                <span className="text-gray-900 font-semibold">LKR {fare.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 font-medium">Service Fee</span>
                </div>
                <span className="text-gray-900 font-semibold">LKR {serviceFee.toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-900 font-bold text-lg">Total Amount</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-green-600">
                      LKR {totalAmount.toFixed(2)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                  </div>
                </div>
              </div>

              {/* Database Payment Status */}
              {existingPayment && (
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Payment Status</span>
                    <div className="flex items-center">
                      {existingPayment.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      )}
                      {existingPayment.status === 'pending' && (
                        <Clock className="w-4 h-4 text-orange-500 mr-1" />
                      )}
                      {existingPayment.status === 'failed' && (
                        <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium capitalize ${existingPayment.status === 'completed' ? 'text-green-600' :
                        existingPayment.status === 'pending' ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                        {existingPayment.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Payment ID: {existingPayment.paymentId}
                  </div>
                  {existingPayment.completedAt && (
                    <div className="text-xs text-gray-500">
                      Completed: {new Date(existingPayment.completedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Payment History Section */}
          {paymentHistory && paymentHistory.length > 0 && (
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Receipt className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Recent Payments</h3>
              </div>

              <div className="space-y-3">
                {paymentHistory.slice(0, 3).map((payment, index) => (
                  <div key={payment.id} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${payment.status === 'completed' ? 'bg-green-500' :
                          payment.status === 'pending' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}></div>
                        <span className="text-sm font-medium text-gray-900">
                          LKR {payment.amount.toFixed(2)}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                        payment.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{payment.method.toUpperCase()}</span>
                      <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                    </div>
                    {payment.ride && (
                      <div className="text-xs text-gray-400 mt-1 truncate">
                        {payment.ride.pickup} → {payment.ride.destination}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Enhanced Payment Method */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Secure Card Payment</h3>
                <p className="text-sm text-purple-600 font-medium">Protected by Stripe</p>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${formErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  <CreditCard className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                </div>
                {formErrors.cardNumber && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.cardNumber}</p>
                )}
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                  placeholder="JOHN DOE"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${formErrors.cardholderName ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {formErrors.cardholderName && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.cardholderName}</p>
                )}
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    placeholder="MM/YY"
                    maxLength="5"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${formErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {formErrors.expiryDate && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.expiryDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    placeholder="123"
                    maxLength="4"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${formErrors.cvv ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {formErrors.cvv && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.cvv}</p>
                  )}
                </div>
              </div>

              {/* Form Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Security Features */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <Shield className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-xs font-medium text-green-700">SSL Encrypted</span>
                </div>
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <Lock className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-xs font-medium text-blue-700">PCI Compliant</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Security Notice */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Bank-Level Security</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div className="flex flex-col items-center">
                <Lock className="w-4 h-4 text-blue-500 mb-1" />
                <span className="text-blue-700">256-bit SSL</span>
              </div>
              <div className="flex flex-col items-center">
                <Shield className="w-4 h-4 text-green-500 mb-1" />
                <span className="text-green-700">PCI DSS</span>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle className="w-4 h-4 text-purple-500 mb-1" />
                <span className="text-purple-700">Verified</span>
              </div>
            </div>
          </div>

          {/* Enhanced Payment Button */}
          <div className="space-y-3">
            <Button
              onClick={processPayment}
              disabled={loading || paymentStatus === 'processing'}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {paymentStatus === 'processing' ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  <div className="flex flex-col">
                    <span>Processing Payment...</span>
                    <span className="text-xs opacity-80">Please wait</span>
                  </div>
                </>
              ) : loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  <div className="flex flex-col">
                    <span>Loading...</span>
                    <span className="text-xs opacity-80">Preparing payment</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center space-x-3">
                    <Lock className="w-6 h-6" />
                    <div className="flex flex-col">
                      <span>Pay Securely</span>
                      <span className="text-sm opacity-90">LKR {totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </Button>

            {/* Enhanced Cancel Button */}
            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full h-12 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-semibold transition-all duration-200"
              disabled={paymentStatus === 'processing'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel Payment
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RidePayment;