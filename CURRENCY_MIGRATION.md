# 🇱🇰 Currency Migration: Indian Rupees → Sri Lankan Rupees

## Overview
This document outlines the complete migration of the QuickRide application from Indian Rupees (₹ INR) to Sri Lankan Rupees (Rs. LKR).

## Changes Made

### 🔄 **Conversion Rate Applied**
- **Rate Used**: 1 INR ≈ 5 LKR (approximate market rate)
- **Rationale**: Provides realistic pricing for the Sri Lankan market

### 💰 **Fare Structure Updates**

#### Backend (API) Changes
**File**: `Backend/services/ride.service.js`

| Vehicle Type | Old Base Fare (INR) | New Base Fare (LKR) |
|--------------|-------------------|-------------------|
| Auto         | ₹30               | Rs. 150           |
| Car          | ₹50               | Rs. 250           |
| Bike         | ₹20               | Rs. 100           |

| Vehicle Type | Old Per KM (INR) | New Per KM (LKR) |
|--------------|------------------|------------------|
| Auto         | ₹10              | Rs. 50           |
| Car          | ₹15              | Rs. 75           |
| Bike         | ₹8               | Rs. 40           |

| Vehicle Type | Old Per Min (INR) | New Per Min (LKR) |
|--------------|-------------------|-------------------|
| Auto         | ₹2                | Rs. 10            |
| Car          | ₹3                | Rs. 15            |
| Bike         | ₹1.5              | Rs. 7.5           |

#### Frontend (UI) Changes
**Files Updated**:
- `Frontend/src/components/SelectVehicle.jsx`
- `Frontend/src/screens/RideHistory.jsx`
- `Frontend/src/screens/AdminDashboard.jsx`
- `Frontend/src/components/RatingModal.jsx`

**Sample Vehicle Prices**:
| Vehicle | Old Price (INR) | New Price (LKR) |
|---------|----------------|----------------|
| QuickCar| ₹193.8         | Rs. 969        |
| QuickBike| ₹254.7        | Rs. 1,274      |
| QuickAuto| ₹200          | Rs. 1,000      |

### 🛠️ **New Utility Functions**

#### Currency Formatting
**File**: `Frontend/src/utils/currency.js`

```javascript
import { formatCurrency } from '../utils/currency';

// Usage examples:
formatCurrency(1500)           // "Rs. 1,500"
formatCurrency(1500.50, { showDecimals: true }) // "Rs. 1,500.50"
formatCurrency(1500, { showSymbol: false })     // "1,500"
```

#### Currency Configuration
**File**: `Frontend/src/config/currency.js`

- Centralized currency settings
- Fare structure definitions
- Conversion rates
- Common fare amounts

### 📱 **UI Symbol Changes**

| Component | Old Display | New Display |
|-----------|-------------|-------------|
| Fare Amount | ₹500 | Rs. 500 |
| Ride History | ₹1,200 | Rs. 1,200 |
| Admin Dashboard | ₹2,500 | Rs. 2,500 |
| Rating Modal | ₹800 | Rs. 800 |

### 🔧 **Technical Implementation**

#### 1. **Consistent Formatting**
All currency displays now use the `formatCurrency()` utility function for consistency.

#### 2. **Thousand Separators**
Large amounts are formatted with commas (e.g., Rs. 10,000).

#### 3. **Configurable Display**
- Symbol display can be toggled
- Decimal places can be controlled
- Locale-specific formatting

#### 4. **Conversion Utilities**
- `convertINRtoLKR()` for legacy data
- `convertUSDtoLKR()` for international rates

### 🧪 **Testing**

**Test File**: `Frontend/src/utils/__tests__/currency.test.js`

Tests cover:
- Basic formatting
- Decimal handling
- Invalid input handling
- Large number formatting
- Conversion functions
- Real-world usage scenarios

### 📊 **Sample Fare Calculations**

#### Short Ride (2 km, 5 minutes)
| Vehicle | Calculation | Total (LKR) |
|---------|-------------|-------------|
| Auto | 150 + (2×50) + (5×10) = | Rs. 300 |
| Car | 250 + (2×75) + (5×15) = | Rs. 475 |
| Bike | 100 + (2×40) + (5×7.5) = | Rs. 218 |

#### Medium Ride (10 km, 20 minutes)
| Vehicle | Calculation | Total (LKR) |
|---------|-------------|-------------|
| Auto | 150 + (10×50) + (20×10) = | Rs. 850 |
| Car | 250 + (10×75) + (20×15) = | Rs. 1,300 |
| Bike | 100 + (10×40) + (20×7.5) = | Rs. 650 |

### 🌍 **Localization Ready**

The currency system is designed to be easily adaptable for other markets:

```javascript
// Easy to change for other countries
export const CURRENCY_CONFIG = {
  code: 'LKR',        // Change to 'USD', 'EUR', etc.
  symbol: 'Rs.',      // Change to '$', '€', etc.
  locale: 'en-LK',    // Change to 'en-US', 'de-DE', etc.
  // ... other settings
};
```

### 🔄 **Migration Checklist**

- ✅ Backend fare calculations updated
- ✅ Frontend currency symbols changed
- ✅ Utility functions created
- ✅ Configuration system implemented
- ✅ Test suite added
- ✅ Documentation updated
- ✅ All components use consistent formatting
- ✅ Large number formatting with separators
- ✅ Conversion utilities for legacy data

### 🚀 **Future Enhancements**

1. **Dynamic Currency Rates**: Integrate with live exchange rate APIs
2. **Multi-Currency Support**: Allow users to view fares in different currencies
3. **Regional Pricing**: Different fare structures for different cities
4. **Surge Pricing**: Implement dynamic pricing based on demand
5. **Payment Gateway Integration**: Connect with Sri Lankan payment providers

### 📞 **Support**

For any issues related to currency display or calculations:
1. Check the `formatCurrency()` function usage
2. Verify the fare structure in `Backend/services/ride.service.js`
3. Review the currency configuration in `Frontend/src/config/currency.js`
4. Run the currency tests to ensure functionality

---

**Migration Completed**: ✅ All currency references successfully updated from INR to LKR
**Market Ready**: ✅ Pricing structure optimized for Sri Lankan market
**Maintainable**: ✅ Centralized configuration for easy future updates