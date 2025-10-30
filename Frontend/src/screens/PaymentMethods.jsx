import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  CreditCard,
  Wallet,
  Smartphone,
  Trash2,
  Edit3,
  Check,
  Star,
  Shield,
  Zap,
  DollarSign
} from "lucide-react";
import { Card, Button, Input } from "../components/ui";
import { formatCurrency } from "../utils/currency";

function PaymentMethods() {
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'card',
      name: 'Visa ending in 4242',
      last4: '4242',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
      isExpired: false
    },
    {
      id: 2,
      type: 'card',
      name: 'Mastercard ending in 8888',
      last4: '8888',
      brand: 'mastercard',
      expiryMonth: 8,
      expiryYear: 2024,
      isDefault: false,
      isExpired: false
    }
  ]);
  
  const [showAddCard, setShowAddCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSetDefault = (id) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const handleDeleteMethod = (id) => {
    setPaymentMethods(methods => methods.filter(method => method.id !== id));
  };

  const getCardIcon = (brand) => {
    const icons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳'
    };
    return icons[brand] || '💳';
  };

  const getCardColor = (brand) => {
    const colors = {
      visa: 'from-blue-500 to-blue-600',
      mastercard: 'from-red-500 to-red-600',
      amex: 'from-green-500 to-green-600',
      discover: 'from-orange-500 to-orange-600'
    };
    return colors[brand] || 'from-gray-500 to-gray-600';
  };

  const getBrandFromNumber = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5') || (number.startsWith('2') && number.length >= 2 && parseInt(number.substring(0, 2)) >= 22 && parseInt(number.substring(0, 2)) <= 27)) return 'Mastercard';
    if (number.startsWith('34') || number.startsWith('37')) return 'Amex';
    if (number.startsWith('6011') || number.startsWith('65')) return 'Discover';
    
    return 'Card';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>Payment method added successfully!</span>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Payment Methods</h1>
              <p className="text-sm text-gray-500">Manage your cards and wallets</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddCard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Method</span>
          </button>
        </div>
      </div>

      <div className="px-6 py-6 max-w-2xl mx-auto">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card 
            className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setShowAddCard(true)}
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Add Card</p>
            <p className="text-xs text-gray-500">Credit/Debit</p>
          </Card>
          
          <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer opacity-50">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Digital Wallet</p>
            <p className="text-xs text-gray-500">Coming Soon</p>
          </Card>
          
          <Card className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer opacity-50">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Smartphone className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Mobile Pay</p>
            <p className="text-xs text-gray-500">Coming Soon</p>
          </Card>
        </div>

        {/* Payment Methods List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Payment Methods</h2>
          
          {paymentMethods.map((method) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-0 overflow-hidden hover:shadow-md transition-shadow">
                <div className={`h-2 bg-gradient-to-r ${getCardColor(method.brand)}`} />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getCardIcon(method.brand)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{method.name}</h3>
                          {method.isDefault && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 capitalize">
                          {method.brand} • Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Set as default"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMethod(method.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove method"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Security Info */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Your payments are secure</h3>
              <p className="text-sm text-blue-700 mb-3">
                We use industry-standard encryption to protect your payment information. 
                Your card details are never stored on our servers.
              </p>
              <div className="flex items-center gap-4 text-xs text-blue-600">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>PCI Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment History Link */}
        <Card 
          className="mt-4 p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => {
            const userType = window.location.pathname.includes('/captain/') ? 'captain' : 'user';
            navigate(`/${userType}/payment-history`);
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Payment History</h3>
                <p className="text-sm text-gray-500">View all transactions</p>
              </div>
            </div>
            <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
          </div>
        </Card>
      </div>

      {/* Add Card Modal */}
      <AddCardModal 
        isOpen={showAddCard}
        onClose={() => setShowAddCard(false)}
        onAdd={(cardData) => {
          // Create new payment method object
          const newPaymentMethod = {
            id: Date.now(), // Simple ID generation
            type: 'card',
            name: `${getBrandFromNumber(cardData.cardNumber)} ending in ${cardData.cardNumber.slice(-4)}`,
            last4: cardData.cardNumber.slice(-4),
            brand: getBrandFromNumber(cardData.cardNumber).toLowerCase(),
            expiryMonth: parseInt(cardData.expiryDate.split('/')[0]),
            expiryYear: parseInt('20' + cardData.expiryDate.split('/')[1]),
            isDefault: paymentMethods.length === 0, // Set as default if it's the first card
            isExpired: false
          };
          
          // Add to payment methods list
          setPaymentMethods(prev => [...prev, newPaymentMethod]);
          setShowAddCard(false);
          
          // Show success message
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
        }}
      />
    </div>
  );
}

// Add Card Modal Component
const AddCardModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    saveCard: true
  });
  const [loading, setLoading] = useState(false);

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

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setFormData(prev => ({ ...prev, cardNumber: formatted }));
    }
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) {
      setFormData(prev => ({ ...prev, expiryDate: formatted }));
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length <= 4) {
      setFormData(prev => ({ ...prev, cvv: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.cardNumber.replace(/\s/g, '').length < 13) {
      alert('Please enter a valid card number');
      return;
    }
    
    if (formData.expiryDate.length !== 5) {
      alert('Please enter a valid expiry date (MM/YY)');
      return;
    }
    
    if (formData.cvv.length < 3) {
      alert('Please enter a valid CVV');
      return;
    }
    
    if (!formData.cardholderName.trim()) {
      alert('Please enter the cardholder name');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onAdd(formData);
      setLoading(false);
      setFormData({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        saveCard: true
      });
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add Payment Method</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500 rotate-45" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleExpiryChange}
                required
              />
              <Input
                label="CVV"
                placeholder="123"
                value={formData.cvv}
                onChange={handleCvvChange}
                required
              />
            </div>
            
            <Input
              label="Cardholder Name"
              placeholder="John Doe"
              value={formData.cardholderName}
              onChange={(e) => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
              required
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="saveCard"
                checked={formData.saveCard}
                onChange={(e) => setFormData(prev => ({ ...prev, saveCard: e.target.checked }))}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="saveCard" className="text-sm text-gray-700">
                Save this card for future payments
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                {loading ? 'Adding...' : 'Add Card'}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentMethods;