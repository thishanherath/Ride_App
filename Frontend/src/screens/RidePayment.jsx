import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Header } from '../components/layout';
import { Card, Button } from '../components/ui';
import {
  CreditCard,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import axios from 'axios';

const RidePayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed
  const [error, setError] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get ride details from navigation state
  const rideData = location.state?.rideData || {};
  const {
    rideId,
    fare,
    pickup,
    destination,
    vehicleType,
    captain,
    distance,
    duration
  } = rideData;

  console.log('🔍 RidePayment component initialized with:', { rideId, fare, rideData });

  useEffect(() => {
    // Only run once when component mounts
    if (isInitialized) return;

    console.log('🔍 RidePayment initializing with data:', {
      rideId,
      fare,
      hasData: !!(rideId && fare),
      rideData
    });

    if (rideId && fare) {
      console.log('✅ Valid ride data found, initializing payment');
      setIsInitialized(true);
      initializePayment();
    } else {
      console.log('⚠️ Missing ride data, showing error');
      setError('No ride data received. Please try again.');
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

      // Simulate payment processing (in real app, this would integrate with Stripe Elements)
      await new Promise(resolve => setTimeout(resolve, 3000));

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/payment/process`,
        {
          rideId,
          paymentMethod: 'card',
          amount: fare,
          paymentIntentId: paymentDetails?.paymentIntentId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setPaymentStatus('success');
        // Auto redirect after success
        setTimeout(() => {
          navigate('/home', {
            state: {
              message: 'Payment completed successfully!',
              type: 'success'
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
      <div className="min-h-screen bg-gray-50">
        <Header title="Payment Successful" />
        <div className="p-4 pt-20">
          <div className="max-w-md mx-auto">
            <Card className="p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Your payment of LKR {fare} has been processed successfully.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600">
                  <p><strong>Ride ID:</strong> {rideId}</p>
                  <p><strong>Amount:</strong> LKR {fare}</p>
                  <p><strong>Payment Method:</strong> Card Payment</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/home')}
                className="w-full"
              >
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Complete Payment"
        showBackButton={true}
        onBackClick={handleCancel}
      />

      <div className="p-4 pt-20">
        <div className="max-w-md mx-auto space-y-4">

          {/* Ride Summary */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Ride Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="text-gray-900 text-right flex-1 ml-2">
                  {pickup?.address || 'Pickup Location'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="text-gray-900 text-right flex-1 ml-2">
                  {destination?.address || 'Destination'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vehicle:</span>
                <span className="text-gray-900">{vehicleType || 'Car'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distance:</span>
                <span className="text-gray-900">{distance || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="text-gray-900">{duration || 'N/A'}</span>
              </div>
              {captain && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Driver:</span>
                  <span className="text-gray-900">{captain.fullname}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Details */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Ride Fare</span>
                <span className="text-gray-900">LKR {fare}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Processing Fee</span>
                <span className="text-gray-900">LKR {Math.round(fare * 0.029 + 5)}</span>
              </div>
              <hr />
              <div className="flex items-center justify-between font-semibold">
                <span className="text-gray-900">Total Amount</span>
                <span className="text-gray-900 text-lg">
                  LKR {Math.round(fare + (fare * 0.029 + 5))}
                </span>
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Card Payment</h3>
                <p className="text-sm text-gray-600">Secure payment via Stripe</p>
              </div>
            </div>

            {/* Mock Card Details (In real app, use Stripe Elements) */}
            <div className="space-y-3">
              <div className="p-3 border rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Card Number</p>
                <p className="font-mono">**** **** **** 4242</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600 mb-1">Expiry</p>
                  <p className="font-mono">12/25</p>
                </div>
                <div className="p-3 border rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600 mb-1">CVC</p>
                  <p className="font-mono">***</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Security Notice */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>Your payment is secured with 256-bit SSL encryption</span>
          </div>

          {/* Payment Button */}
          <Button
            onClick={processPayment}
            disabled={loading || paymentStatus === 'processing'}
            className="w-full h-12 text-lg font-semibold"
          >
            {paymentStatus === 'processing' ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Pay LKR {Math.round(fare + (fare * 0.029 + 5))}
              </>
            )}
          </Button>

          {/* Cancel Button */}
          <Button
            onClick={handleCancel}
            variant="outline"
            className="w-full"
            disabled={paymentStatus === 'processing'}
          >
            Cancel Payment
          </Button>

        </div>
      </div>
    </div>
  );
};

export default RidePayment;