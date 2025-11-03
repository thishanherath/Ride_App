import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Smartphone,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  Shield
} from 'lucide-react';
import { Card, Button, Input } from './ui';
import axios from 'axios';

const PaymentMethodSelector = ({
  rideDetails,
  onPaymentSelect,
  onPaymentComplete,
  className = ''
}) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCardForm, setShowCardForm] = useState(false);

  // Load payment methods on component mount
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/payment/methods`
      );
      
      if (response.data.success) {
        setPaymentMethods(response.data.paymentMethods);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setError('');
    
    if (method.id === 'card') {
      setShowCardForm(true);
    } else {
      setShowCardForm(false);
    }
    
    if (onPaymentSelect) {
      onPaymentSelect(method);
    }
  };

  const processPayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    try {
      setProcessing(true);
      setError('');

      const token = localStorage.getItem('token');
      const paymentData = {
        rideId: rideDetails._id,
        paymentMethod: selectedMethod.id
      };

      // Add method-specific data
      if (selectedMethod.id === 'card') {
        // For card payments, we'll handle Stripe integration
        await processCardPayment(paymentData);
      } else if (['frimi', 'ezcash', 'mcash'].includes(selectedMethod.id)) {
        // For mobile payments, add phone number
        if (!phoneNumber) {
          setError('Phone number is required for mobile payments');
          return;
        }
        paymentData.paymentData = { phoneNumber };
        await processRegularPayment(paymentData);
      } else {
        // For cash and other methods
        await processRegularPayment(paymentData);
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      setError(error.response?.data?.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const processCardPayment = async (paymentData) => {
    // For card payments, we'll defer the actual payment until ride completion
    // Just confirm the payment method selection
    console.log('💳 Card payment method selected - payment will be processed after ride completion');
    
    if (onPaymentComplete) {
      onPaymentComplete({
        success: true,
        method: 'card',
        paymentId: `deferred_card_${Date.now()}`,
        message: 'Card payment method selected - you will be charged after the ride'
      });
    }
  };

  const processRegularPayment = async (paymentData) => {
    const token = localStorage.getItem('token');
    
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/payment/process`,
      paymentData,
      {
        headers: { token }
      }
    );

    if (response.data.success) {
      if (onPaymentComplete) {
        onPaymentComplete({
          success: true,
          method: selectedMethod.id,
          paymentId: response.data.payment.paymentId,
          message: response.data.message,
          instructions: response.data.payment.instructions
        });
      }
    } else {
      throw new Error(response.data.message);
    }
  };

  const getMethodIcon = (method) => {
    const icons = {
      cash: DollarSign,
      card: CreditCard,
      paypal: CreditCard,
      frimi: Smartphone,
      ezcash: Smartphone,
      mcash: Smartphone
    };
    
    const IconComponent = icons[method.id] || CreditCard;
    return <IconComponent className="w-6 h-6" />;
  };

  const getMethodColor = (method) => {
    const colors = {
      cash: 'green',
      card: 'blue',
      paypal: 'indigo',
      frimi: 'purple',
      ezcash: 'orange',
      mcash: 'red'
    };
    
    return colors[method.id] || 'gray';
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading payment methods...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose Payment Method
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield className="w-4 h-4" />
          <span>Secure payment processing</span>
        </div>
      </div>

      {/* Payment Amount */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total Amount:</span>
          <span className="text-2xl font-bold text-gray-900">
            LKR {rideDetails.fare?.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-3 mb-6">
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod?.id === method.id;
          const color = getMethodColor(method);
          
          return (
            <motion.div
              key={method.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`
                  border-2 rounded-lg p-4 cursor-pointer transition-all
                  ${isSelected 
                    ? `border-${color}-500 bg-${color}-50` 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => handleMethodSelect(method)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${isSelected ? `bg-${color}-100` : 'bg-gray-100'}
                    `}>
                      {getMethodIcon(method)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {method.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {method.type === 'offline' ? 'Pay on delivery' : 'Pay now online'}
                      </p>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <CheckCircle className={`w-5 h-5 text-${color}-600`} />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile Payment Phone Number */}
      <AnimatePresence>
        {selectedMethod && ['frimi', 'ezcash', 'mcash'].includes(selectedMethod.id) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <Input
              type="tel"
              placeholder="Enter your mobile number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Payment Form */}
      <AnimatePresence>
        {showCardForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Secure Card Payment
                </span>
              </div>
              <p className="text-sm text-blue-700">
                Your card details are processed securely through Stripe.
                No card information is stored on our servers.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={processPayment}
          disabled={!selectedMethod || processing}
          className="flex-1"
          loading={processing}
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            `Pay LKR ${rideDetails.fare?.toFixed(2)}`
          )}
        </Button>
      </div>

      {/* Payment Security Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          🔒 Your payment is secured with 256-bit SSL encryption
        </p>
      </div>
    </Card>
  );
};

export default PaymentMethodSelector;