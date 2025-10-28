/**
 * Tests for currency utility functions
 */
import { formatCurrency, convertINRtoLKR, CURRENCY } from '../currency';

describe('Currency Utilities', () => {
  describe('formatCurrency', () => {
    test('formats basic amounts correctly', () => {
      expect(formatCurrency(100)).toBe('Rs. 100');
      expect(formatCurrency(1000)).toBe('Rs. 1,000');
      expect(formatCurrency(10000)).toBe('Rs. 10,000');
    });

    test('handles decimal amounts', () => {
      expect(formatCurrency(100.50, { showDecimals: true })).toBe('Rs. 100.50');
      expect(formatCurrency(1000.75, { showDecimals: true })).toBe('Rs. 1,000.75');
    });

    test('handles amounts without symbol', () => {
      expect(formatCurrency(100, { showSymbol: false })).toBe('100');
      expect(formatCurrency(1000, { showSymbol: false })).toBe('1,000');
    });

    test('handles invalid inputs', () => {
      expect(formatCurrency(null)).toBe('Rs. 0');
      expect(formatCurrency(undefined)).toBe('Rs. 0');
      expect(formatCurrency('invalid')).toBe('Rs. 0');
    });

    test('formats large amounts with thousand separators', () => {
      expect(formatCurrency(100000)).toBe('Rs. 100,000');
      expect(formatCurrency(1000000)).toBe('Rs. 1,000,000');
    });
  });

  describe('convertINRtoLKR', () => {
    test('converts INR to LKR correctly', () => {
      expect(convertINRtoLKR(100)).toBe(500); // 100 INR = 500 LKR
      expect(convertINRtoLKR(50)).toBe(250);  // 50 INR = 250 LKR
      expect(convertINRtoLKR(200)).toBe(1000); // 200 INR = 1000 LKR
    });
  });

  describe('CURRENCY constants', () => {
    test('has correct currency constants', () => {
      expect(CURRENCY.CODE).toBe('LKR');
      expect(CURRENCY.SYMBOL).toBe('Rs.');
      expect(CURRENCY.NAME).toBe('Sri Lankan Rupee');
    });
  });
});

// Example usage tests
describe('Real-world usage examples', () => {
  test('formats typical ride fares', () => {
    expect(formatCurrency(250)).toBe('Rs. 250');   // Auto base fare
    expect(formatCurrency(500)).toBe('Rs. 500');   // Short ride
    expect(formatCurrency(1500)).toBe('Rs. 1,500'); // Medium ride
    expect(formatCurrency(3000)).toBe('Rs. 3,000'); // Long ride
  });

  test('converts typical INR fares to LKR', () => {
    expect(convertINRtoLKR(50)).toBe(250);   // ₹50 → Rs. 250
    expect(convertINRtoLKR(100)).toBe(500);  // ₹100 → Rs. 500
    expect(convertINRtoLKR(300)).toBe(1500); // ₹300 → Rs. 1500
  });
});