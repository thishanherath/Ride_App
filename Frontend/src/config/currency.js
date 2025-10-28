/**
 * Currency Configuration for Sri Lankan Rupees (LKR)
 * 
 * This file contains all currency-related configurations and constants
 * for the QuickRide application in Sri Lanka.
 */

// Currency Configuration
export const CURRENCY_CONFIG = {
  // Basic currency info
  code: 'LKR',
  symbol: 'Rs.',
  name: 'Sri Lankan Rupee',
  locale: 'en-LK',
  
  // Display settings
  showSymbol: true,
  showDecimals: false,
  thousandSeparator: ',',
  decimalSeparator: '.',
  
  // Conversion rates (approximate)
  conversionRates: {
    INR: 5.0,  // 1 INR ≈ 5 LKR
    USD: 320,  // 1 USD ≈ 320 LKR
    EUR: 350,  // 1 EUR ≈ 350 LKR
  }
};

// Base fare structure for Sri Lankan market
export const FARE_STRUCTURE = {
  baseFare: {
    auto: 150,    // Base fare for auto-rickshaw
    car: 250,     // Base fare for car
    bike: 100,    // Base fare for bike/motorcycle
  },
  
  perKmRate: {
    auto: 50,     // Per kilometer rate for auto
    car: 75,      // Per kilometer rate for car
    bike: 40,     // Per kilometer rate for bike
  },
  
  perMinuteRate: {
    auto: 10,     // Per minute rate for auto
    car: 15,      // Per minute rate for car
    bike: 7.5,    // Per minute rate for bike
  },
  
  // Surge pricing multipliers
  surgePricing: {
    normal: 1.0,
    moderate: 1.5,
    high: 2.0,
    peak: 2.5,
  },
  
  // Minimum fare amounts
  minimumFare: {
    auto: 200,
    car: 300,
    bike: 150,
  }
};

// Common fare amounts for quick selection
export const COMMON_FARES = [
  200, 300, 500, 750, 1000, 1500, 2000, 2500, 3000
];

// Distance-based fare brackets (for estimation)
export const FARE_BRACKETS = [
  { distance: 2, estimatedFare: { auto: 250, car: 350, bike: 200 } },
  { distance: 5, estimatedFare: { auto: 400, car: 600, bike: 300 } },
  { distance: 10, estimatedFare: { auto: 650, car: 950, bike: 500 } },
  { distance: 15, estimatedFare: { auto: 900, car: 1300, bike: 700 } },
  { distance: 20, estimatedFare: { auto: 1150, car: 1650, bike: 900 } },
];

export default {
  CURRENCY_CONFIG,
  FARE_STRUCTURE,
  COMMON_FARES,
  FARE_BRACKETS
};