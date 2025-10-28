/**
 * Currency utilities for Sri Lankan Rupees (LKR)
 */
import { CURRENCY_CONFIG } from '../config/currency';

// Sri Lankan Rupee formatting
export const formatCurrency = (amount, options = {}) => {
  const {
    showSymbol = CURRENCY_CONFIG.showSymbol,
    showDecimals = CURRENCY_CONFIG.showDecimals,
    locale = CURRENCY_CONFIG.locale
  } = options;

  if (typeof amount !== 'number' || isNaN(amount)) {
    return showSymbol ? `${CURRENCY_CONFIG.symbol} 0` : '0';
  }

  const formattedAmount = showDecimals 
    ? amount.toFixed(2)
    : Math.round(amount).toString();

  // Add thousand separators for Sri Lankan format
  const withSeparators = formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, CURRENCY_CONFIG.thousandSeparator);

  return showSymbol ? `${CURRENCY_CONFIG.symbol} ${withSeparators}` : withSeparators;
};

// Convert from INR to LKR
export const convertINRtoLKR = (inrAmount) => {
  const conversionRate = CURRENCY_CONFIG.conversionRates.INR;
  return Math.round(inrAmount * conversionRate);
};

// Convert from USD to LKR
export const convertUSDtoLKR = (usdAmount) => {
  const conversionRate = CURRENCY_CONFIG.conversionRates.USD;
  return Math.round(usdAmount * conversionRate);
};

// Currency constants (for backward compatibility)
export const CURRENCY = {
  CODE: CURRENCY_CONFIG.code,
  SYMBOL: CURRENCY_CONFIG.symbol,
  NAME: CURRENCY_CONFIG.name,
  DECIMAL_PLACES: 2
};

// Fare calculation helpers
export const calculateFare = (baseFare, distance, duration, rates) => {
  const distanceInKm = distance / 1000; // Convert meters to kilometers
  const durationInMinutes = duration / 60; // Convert seconds to minutes
  
  return Math.round(
    baseFare + 
    (distanceInKm * rates.perKm) + 
    (durationInMinutes * rates.perMinute)
  );
};

export default {
  formatCurrency,
  convertINRtoLKR,
  CURRENCY,
  calculateFare
};