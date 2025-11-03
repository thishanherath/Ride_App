import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Wallet,
  Smartphone,
  DollarSign,
  Plus,
  Check,
  ChevronRight,
  Shield,
  Zap
} from 'lucide-react';
import { Card, Button } from './ui';
import { formatCurrency } from '../utils/currency';

const PaymentMethodSelector = ({ 
  selectedMethod, 
  onMethodSelect, 
  amount = 0,
  showAddMethod = true,
  onAddMethod,
  className = ''
}) => {
  console.log('PaymentMethodSelector props:', { selectedMethod, amount, showAddMethod });
  const [paymentMethods] = useState([
    {
      id: 'cash',
      type: 'cash',
      name: 'Cash Payment',
      description: 'Pay with cash to driver',
      icon: DollarSign,
      color: 'green',
      available: true,
      isDefault: true
    },
    {
      id: 'card_4242',
      type: 'card',
      name: 'Visa ending in 4242',
      description: 'Default payment method',
      icon: CreditCard,
      color: 'blue',
      available: true,
      isDefault: false,
      brand: 'visa'
    },
    {
      id: 'card_8888',
      type: 'card',
      name: 'Mastercard ending in 8888',
      description: 'Backup payment method',
      icon: CreditCard,
      color: 'red',
      available: true,
      isDefault: false,
      brand: 'mastercard'
    },
    {
      id: 'wallet',
      type: 'wallet',
      name: 'Digital Wallet',
      description: 'PayPal, Google Pay',
      icon: Wallet,
      color: 'purple',
      available: false,
      isDefault: false
    },
    {
      id: 'mobile',
      type: 'mobile',
      name: 'Mobile Payment',
      description: 'Apple Pay, Samsung Pay',
      icon: Smartphone,
      color: 'gray',
      available: false,
      isDefault: false
    }
  ]);

  const getColorClasses = (color, isSelected) => {
    const colors = {
      green: isSelected 
        ? 'border-green-500 bg-green-50 text-green-700' 
        : 'border-gray-200 hover:border-green-300',
      blue: isSelected 
        ? 'border-blue-500 bg-blue-50 text-blue-700' 
        : 'border-gray-200 hover:border-blue-300',
      red: isSelected 
        ? 'border-red-500 bg-red-50 text-red-700' 
        : 'border-gray-200 hover:border-red-300',
      purple: isSelected 
        ? 'border-purple-500 bg-purple-50 text-purple-700' 
        : 'border-gray-200 hover:border-purple-300',
      gray: isSelected 
        ? 'border-gray-500 bg-gray-50 text-gray-700' 
        : 'border-gray-200 hover:border-gray-300'
    };
    return colors[color] || colors.gray;
  };

  const getIconColor = (color) => {
    const colors = {
      green: 'text-green-600',
      blue: 'text-blue-600',
      red: 'text-red-600',
      purple: 'text-purple-600',
      gray: 'text-gray-600'
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
          {amount > 0 && (
            <p className="text-sm text-gray-600">
              Total: <span className="font-medium">{formatCurrency(amount)}</span>
            </p>
          )}
        </div>
        
        {/* Security Badge */}
        <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <Shield className="w-3 h-3" />
          <span>Secure</span>
        </div>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod?.id === method.id;
          const isAvailable = method.available;

          return (
            <motion.div
              key={method.id}
              whileHover={isAvailable ? { scale: 1.02 } : {}}
              whileTap={isAvailable ? { scale: 0.98 } : {}}
            >
              <button
                onClick={() => isAvailable && onMethodSelect(method)}
                disabled={!isAvailable}
                className={`
                  w-full p-4 rounded-xl border-2 transition-all duration-200 text-left
                  ${getColorClasses(method.color, isSelected)}
                  ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${isSelected ? 'ring-2 ring-offset-2 ring-opacity-50' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-100'}
                    `}>
                      <Icon className={`w-6 h-6 ${getIconColor(method.color)}`} />
                    </div>

                    {/* Method Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{method.name}</h4>
                        {method.isDefault && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                            Default
                          </span>
                        )}
                        {!isAvailable && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                    {isAvailable && !isSelected && (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                </div>

                {/* Additional Info for Selected Method */}
                <AnimatePresence>
                  {isSelected && method.type === 'cash' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-gray-200"
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Zap className="w-4 h-4 text-green-500" />
                        <span>Pay directly to your driver upon arrival</span>
                      </div>
                    </motion.div>
                  )}
                  
                  {isSelected && method.type === 'card' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-gray-200"
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span>Secure payment processed automatically</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Add Payment Method */}
      {showAddMethod && (
        <button
          onClick={onAddMethod}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 group"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gray-100 group-hover:bg-orange-100 rounded-full flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-gray-900 group-hover:text-orange-900">
                Add Payment Method
              </h4>
              <p className="text-sm text-gray-600 group-hover:text-orange-700">
                Credit card, debit card, or digital wallet
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
          </div>
        </button>
      )}

      {/* Payment Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Secure Payment</h4>
            <p className="text-xs text-blue-700 mt-1">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;