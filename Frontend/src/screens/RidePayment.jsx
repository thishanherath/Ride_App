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

  // Get ride ID from navigation state (this is the most reliable data)
  const rideData = location.state?.rideData || {};
  const rideId = rideData.rideId;

  // Use real ride data from database, fallback to socket data
  const currentRide = rideDetails || rideData;
  const {
    fare: rawFare,
    pickup,
    destination,
    vehicle: vehicleType,
    captain,
    duration
  } = currentRide;

  // Validate and ensure fare is a valid number
  const fare = parseFloat(rawFare) || 0;
  const serviceFee = Math.round(fare * 0.029 + 5);
  const totalAmount = Math.round(fare + serviceFee);

  console.log('🔍 RidePayment initialized:', {
    rideId,
    rawFare,
    fare,
    serviceFee,
    totalAmount,
    hasRideDetails: !!rideDetails
  });

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
        return response.data.ride;
      } else {
        console.error('❌ Failed to fetch ride details:', response.data.message);
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching ride details:', error);
      return null;
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
      fare,
      hasData: !!(rideId && fare),
      rideData
    });

    if (rideId) {
      console.log('✅ Ride ID found, fetching real data from database');
      setIsInitialized(true);

      // Fetch real ride data and payment data from database
      Promise.all([
        fetchRideDetails(rideId),
        fetchPaymentData(rideId)
      ]).then(([realRideData]) => {
        if (realRideData && realRideData.fare > 0) {
          console.log('✅ Real ride data loaded, initializing payment');
          initializePayment();
        } else if (fare > 0) {
          console.log('⚠️ Using socket data as fallback');
          initializePayment();
        } else {
          console.log('❌ No valid ride data available');
          setError('Unable to load ride information. Please try again.');
        }
      });
    } else {
      console.log('❌ No ride ID provided');
      setError('No ride information provided. Please try again.');
      setIsInitialized(true);
    }
  }, [rideId, fare, isInitialized]);

  const initializePayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/payment/create-intent`,
        {
          rideId,
          amount: fare,
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
    try {
      setLoading(true);
      setPaymentStatus('processing');
      const token = localStorage.getItem('token');

      console.log('💳 Processing payment:', {
        rideId,
        amount: totalAmount,
        paymentMethod: 'card',
        existingPayment: existingPayment?.id
      });

      // Simulate payment processing (in real app, this would integrate with Stripe Elements)
      await new Promise(resolve => setTimeout(resolve, 3000));

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/payment/process`,
        {
          rideId,
          paymentMethod: 'card',
          amount: totalAmount, // Use total amount including service fee
          paymentData: {
            paymentIntentId: paymentDetails?.paymentIntentId,
            paymentId: existingPayment?.id,
            serviceFee: serviceFee,
            baseFare: fare
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
              <p className="text-gray-600 mb-8 text-lg">
                Your payment of <span className="font-bold text-green-600">LKR {totalAmount.toFixed(2)}</span> has been processed successfully.
              </p>

              {/* Enhanced Receipt */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-8 border border-gray-200">
                <div className="flex items-center justify-center mb-4">
                  <Receipt className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="font-semibold text-gray-800">Payment Receipt</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ride ID:</span>
                    <span className="font-mono text-gray-900 bg-white px-2 py-1 rounded">{rideId}</span>
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
                      <span className="text-gray-900">Card Payment</span>
                    </div>
                  </div>
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
                  <p className="text-sm font-semibold text-gray-900 capitalize">{vehicleType || 'Car'}</p>
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

            {/* Enhanced Card Details */}
            <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
              {/* Card Display */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-10 rounded-full -ml-8 -mb-8"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-8 h-6 bg-white bg-opacity-20 rounded"></div>
                    <div className="text-xs font-medium opacity-80">VISA</div>
                  </div>

                  <div className="mb-4">
                    <p className="text-lg font-mono tracking-wider">**** **** **** 4242</p>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs opacity-70 mb-1">CARD HOLDER</p>
                      <p className="text-sm font-medium">JOHN DOE</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-70 mb-1">EXPIRES</p>
                      <p className="text-sm font-medium">12/25</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="grid grid-cols-2 gap-3">
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