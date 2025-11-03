/**
 * Payment Service
 * Handles multiple payment gateways for ride payments
 * Supports: Stripe, PayPal, and local Sri Lankan payment methods
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  constructor() {
    this.supportedMethods = {
      cash: { name: 'Cash Payment', enabled: true },
      card: { name: 'Credit/Debit Card', enabled: true, gateway: 'stripe' },
      paypal: { name: 'PayPal', enabled: true, gateway: 'paypal' },
      frimi: { name: 'Frimi', enabled: true, gateway: 'frimi' }, // Sri Lankan mobile payment
      ezcash: { name: 'eZ Cash', enabled: true, gateway: 'ezcash' }, // Sri Lankan mobile payment
      mcash: { name: 'mCash', enabled: true, gateway: 'mcash' } // Sri Lankan mobile payment
    };
  }

  /**
   * Get available payment methods
   */
  getAvailablePaymentMethods() {
    return Object.entries(this.supportedMethods)
      .filter(([key, method]) => method.enabled)
      .map(([key, method]) => ({
        id: key,
        name: method.name,
        type: key === 'cash' ? 'offline' : 'online',
        gateway: method.gateway || null,
        icon: this.getPaymentIcon(key)
      }));
  }

  /**
   * Get payment method icon
   */
  getPaymentIcon(method) {
    const icons = {
      cash: '💵',
      card: '💳',
      paypal: '🅿️',
      frimi: '📱',
      ezcash: '💰',
      mcash: '📲'
    };
    return icons[method] || '💳';
  }

  /**
   * Create payment intent for card payments (Stripe)
   */
  async createCardPaymentIntent(amount, currency = 'lkr', metadata = {}) {
    try {
      console.log(`💳 Creating Stripe payment intent: ${amount} ${currency.toUpperCase()}`);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents/paisa
        currency: currency.toLowerCase(),
        metadata: {
          ...metadata,
          service: 'ride-hailing',
          timestamp: new Date().toISOString()
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log(`✅ Payment intent created: ${paymentIntent.id}`);
      
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: paymentIntent.status
      };

    } catch (error) {
      console.error('❌ Stripe payment intent creation failed:', error.message);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Confirm card payment
   */
  async confirmCardPayment(paymentIntentId) {
    try {
      console.log(`🔄 Confirming payment intent: ${paymentIntentId}`);
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        paid: paymentIntent.status === 'succeeded'
      };

    } catch (error) {
      console.error('❌ Payment confirmation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create PayPal payment
   */
  async createPayPalPayment(amount, currency = 'USD', metadata = {}) {
    try {
      // PayPal integration would go here
      // For now, return a mock response
      console.log(`🅿️ Creating PayPal payment: ${amount} ${currency}`);
      
      return {
        success: true,
        paymentId: `paypal_${Date.now()}`,
        approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=mock_token`,
        amount,
        currency
      };

    } catch (error) {
      console.error('❌ PayPal payment creation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create mobile payment (Sri Lankan methods)
   */
  async createMobilePayment(method, amount, phoneNumber, metadata = {}) {
    try {
      console.log(`📱 Creating ${method} payment: LKR ${amount} to ${phoneNumber}`);
      
      // Mock implementation for Sri Lankan mobile payments
      // In production, integrate with actual APIs
      const paymentId = `${method}_${Date.now()}`;
      
      return {
        success: true,
        paymentId,
        method,
        amount,
        phoneNumber,
        status: 'pending',
        instructions: this.getMobilePaymentInstructions(method, amount, paymentId)
      };

    } catch (error) {
      console.error(`❌ ${method} payment creation failed:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get mobile payment instructions
   */
  getMobilePaymentInstructions(method, amount, paymentId) {
    const instructions = {
      frimi: `Send LKR ${amount} to merchant via Frimi app. Reference: ${paymentId}`,
      ezcash: `Dial #77# and send LKR ${amount} to merchant. Reference: ${paymentId}`,
      mcash: `Use mCash app to send LKR ${amount} to merchant. Reference: ${paymentId}`
    };
    
    return instructions[method] || `Complete payment of LKR ${amount} using ${method}`;
  }

  /**
   * Process ride payment
   */
  async processRidePayment(rideId, paymentMethod, amount, paymentData = {}) {
    try {
      console.log(`💰 Processing ride payment: ${rideId}, Method: ${paymentMethod}, Amount: LKR ${amount}`);
      
      const paymentRecord = {
        rideId,
        method: paymentMethod,
        amount,
        currency: 'LKR',
        status: 'pending',
        createdAt: new Date(),
        metadata: paymentData
      };

      switch (paymentMethod) {
        case 'cash':
          return this.processCashPayment(paymentRecord);
          
        case 'card':
          return this.processCardPayment(paymentRecord, paymentData);
          
        case 'paypal':
          return this.processPayPalPayment(paymentRecord, paymentData);
          
        case 'frimi':
        case 'ezcash':
        case 'mcash':
          return this.processMobilePayment(paymentRecord, paymentData);
          
        default:
          throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }

    } catch (error) {
      console.error('❌ Ride payment processing failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process cash payment
   */
  async processCashPayment(paymentRecord) {
    console.log('💵 Processing cash payment');
    
    return {
      success: true,
      paymentId: `cash_${Date.now()}`,
      method: 'cash',
      status: 'completed',
      message: 'Cash payment will be collected by driver',
      ...paymentRecord
    };
  }

  /**
   * Process card payment
   */
  async processCardPayment(paymentRecord, paymentData) {
    console.log('💳 Processing card payment');
    
    if (paymentData.paymentIntentId) {
      // Confirm existing payment intent
      const result = await this.confirmCardPayment(paymentData.paymentIntentId);
      return {
        ...result,
        paymentId: paymentData.paymentIntentId,
        method: 'card',
        ...paymentRecord
      };
    } else {
      // Create new payment intent
      const result = await this.createCardPaymentIntent(
        paymentRecord.amount,
        'lkr',
        { rideId: paymentRecord.rideId }
      );
      
      return {
        ...result,
        method: 'card',
        requiresAction: true,
        ...paymentRecord
      };
    }
  }

  /**
   * Process PayPal payment
   */
  async processPayPalPayment(paymentRecord, paymentData) {
    console.log('🅿️ Processing PayPal payment');
    
    const result = await this.createPayPalPayment(
      paymentRecord.amount,
      'USD', // PayPal typically uses USD
      { rideId: paymentRecord.rideId }
    );
    
    return {
      ...result,
      method: 'paypal',
      requiresAction: true,
      ...paymentRecord
    };
  }

  /**
   * Process mobile payment
   */
  async processMobilePayment(paymentRecord, paymentData) {
    console.log(`📱 Processing ${paymentRecord.method} payment`);
    
    const result = await this.createMobilePayment(
      paymentRecord.method,
      paymentRecord.amount,
      paymentData.phoneNumber,
      { rideId: paymentRecord.rideId }
    );
    
    return {
      ...result,
      requiresAction: true,
      ...paymentRecord
    };
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId, method) {
    try {
      console.log(`🔍 Checking payment status: ${paymentId} (${method})`);
      
      switch (method) {
        case 'card':
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
          return {
            success: true,
            paymentId,
            status: paymentIntent.status,
            paid: paymentIntent.status === 'succeeded'
          };
          
        case 'cash':
          return {
            success: true,
            paymentId,
            status: 'completed',
            paid: true
          };
          
        default:
          // For other methods, return mock status
          return {
            success: true,
            paymentId,
            status: 'pending',
            paid: false
          };
      }

    } catch (error) {
      console.error('❌ Payment status check failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId, amount, reason = 'Ride cancelled') {
    try {
      console.log(`💸 Processing refund: ${paymentId}, Amount: ${amount}`);
      
      // For Stripe payments
      if (paymentId.startsWith('pi_')) {
        const refund = await stripe.refunds.create({
          payment_intent: paymentId,
          amount: Math.round(amount * 100),
          reason: 'requested_by_customer',
          metadata: {
            reason,
            timestamp: new Date().toISOString()
          }
        });
        
        return {
          success: true,
          refundId: refund.id,
          amount: refund.amount / 100,
          status: refund.status
        };
      }
      
      // For other payment methods, return mock refund
      return {
        success: true,
        refundId: `refund_${Date.now()}`,
        amount,
        status: 'succeeded',
        message: 'Refund will be processed within 3-5 business days'
      };

    } catch (error) {
      console.error('❌ Refund processing failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate payment processing fee
   */
  calculateProcessingFee(amount, method) {
    const fees = {
      cash: 0,
      card: amount * 0.029 + 5, // 2.9% + LKR 5
      paypal: amount * 0.034 + 10, // 3.4% + LKR 10
      frimi: amount * 0.01, // 1%
      ezcash: amount * 0.015, // 1.5%
      mcash: amount * 0.012 // 1.2%
    };
    
    return Math.round((fees[method] || 0) * 100) / 100;
  }
}

module.exports = new PaymentService();