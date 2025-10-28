# Google Maps Integration for Distance and Time Calculation

This document explains the Google Maps API integration for calculating accurate distance and travel time between pickup and destination locations.

## Overview

The ride confirmation interface now uses real Google Maps API data to:
- Calculate accurate distance between locations
- Estimate travel time based on current traffic conditions
- Display formatted distance and duration
- Show estimated arrival times
- Provide fallback values when API is unavailable

## Implementation

### Backend Integration

The backend already has Google Maps integration through:
- `Backend/services/map.service.js` - Google Maps API service
- `Backend/controllers/map.controller.js` - API endpoints
- `Backend/routes/maps.routes.js` - Route definitions

**Available Endpoints:**
```
GET /map/get-distance-time?origin=pickup&destination=destination
GET /map/get-coordinates?address=location
GET /map/get-suggestions?input=search_term
```

### Frontend Integration

#### 1. Map Service (`Frontend/src/services/mapService.js`)
Provides methods for:
- `getDistanceAndDuration(pickup, destination)` - Get distance/time data
- `getFareWithDistanceTime(pickup, destination)` - Get fare with distance/time
- `getLocationSuggestions(input)` - Get autocomplete suggestions
- `getCoordinates(address)` - Get lat/lng for address
- `formatDistance(meters)` - Format distance for display
- `formatDuration(seconds)` - Format duration for display

#### 2. Custom Hook (`Frontend/src/hooks/useDistanceTime.js`)
React hooks for managing distance/time state:
- `useDistance(pickup, destination)` - Simple distance/time hook
- `useDistanceTime(pickup, destination, options)` - Full-featured hook
- `useFareCalculation(pickup, destination)` - Hook with fare calculation

#### 3. Component Integration (`Frontend/src/components/RideDetails.jsx`)
The RideDetails component now:
- Uses `useDistance` hook for real-time calculations
- Shows loading states during API calls
- Displays formatted distance and duration
- Shows estimated arrival times
- Handles errors gracefully with fallbacks

## Usage Examples

### Basic Distance Calculation
```jsx
import { useDistance } from '../hooks/useDistanceTime';

const MyComponent = () => {
  const { distance, duration, loading, display, isReady } = useDistance(
    'Colombo Fort Railway Station',
    'Bandaranaike International Airport'
  );

  if (loading) return <div>Calculating...</div>;
  if (!isReady) return <div>Enter locations</div>;

  return (
    <div>
      <p>Distance: {display.distance}</p>
      <p>Duration: {display.duration}</p>
      <p>ETA: {display.eta}</p>
    </div>
  );
};
```

### Manual Service Call
```jsx
import mapService from '../services/mapService';

const calculateRoute = async () => {
  try {
    const result = await mapService.getDistanceAndDuration(
      'Pickup Location',
      'Destination Location'
    );
    
    console.log('Distance:', result.distance.text);
    console.log('Duration:', result.duration.text);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

## Data Format

### Distance Object
```javascript
{
  text: "5.2 km",        // Formatted text
  value: 5200,           // Value in meters
  km: 5.2               // Value in kilometers
}
```

### Duration Object
```javascript
{
  text: "15 mins",       // Formatted text
  value: 900,            // Value in seconds
  minutes: 15            // Value in minutes
}
```

### Display Object
```javascript
{
  distance: "5.2 km",    // Formatted distance
  duration: "15 mins",   // Formatted duration
  eta: "2:45 PM",        // Estimated arrival time
  distanceKm: 5.2,       // Distance in km
  durationMinutes: 15    // Duration in minutes
}
```

## Features

### 1. Real-time Calculation
- Automatically calculates when pickup/destination changes
- Debounced API calls to prevent excessive requests
- Loading states during calculation

### 2. Error Handling
- Graceful fallback to estimated values
- Error messages for failed calculations
- Retry mechanisms

### 3. Formatting
- Human-readable distance (5.2 km, 500 m)
- Human-readable duration (15 mins, 1 hr 30 mins)
- Estimated arrival times (2:45 PM)

### 4. Performance
- Debounced API calls (500ms default)
- Caching of results
- Minimal re-renders with React.memo

### 5. Accessibility
- Loading indicators
- Error states
- Screen reader friendly

## Configuration

### Environment Variables
```env
# Backend (.env)
GOOGLE_MAPS_API=your_google_maps_api_key

# Frontend (.env)
VITE_SERVER_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Required Google Maps APIs
1. **Distance Matrix API** - For distance/time calculations
2. **Geocoding API** - For address to coordinates conversion
3. **Places API** - For autocomplete suggestions

## Testing

### Test Component
Use `Frontend/src/components/__tests__/DistanceTimeTest.jsx` to test the integration:

```jsx
import DistanceTimeTest from './components/__tests__/DistanceTimeTest';

// Add to your app for testing
<DistanceTimeTest />
```

### Manual Testing
1. Enter pickup and destination locations
2. Verify distance and time calculations
3. Check loading states
4. Test error handling with invalid locations

## Fallback Behavior

When Google Maps API is unavailable:
- Uses fallback values (5km, 15 minutes)
- Shows "Calculating..." or "Estimated" labels
- Continues to function without breaking

### Fallback Values
```javascript
{
  distance: { text: '5.0 km', value: 5000, km: 5.0 },
  duration: { text: '15 mins', value: 900, minutes: 15 }
}
```

## Integration with Existing Features

### 1. Fare Calculation
- Distance and time are used in fare calculation
- Real-time updates when locations change
- Accurate pricing based on actual route

### 2. Ride Booking
- Distance/time stored in ride records
- Used for driver matching algorithms
- ETA calculations for users

### 3. UI Updates
- Trip summary shows real data
- Route overview with accurate timing
- Loading states during calculation

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Check Google Cloud Console
   - Verify API is enabled
   - Check billing account

2. **CORS Errors**
   - Ensure backend proxy is working
   - Check server configuration

3. **Authentication Errors**
   - Verify user token is valid
   - Check middleware configuration

4. **No Results**
   - Check location spelling
   - Verify locations exist in Google Maps
   - Check API quotas

### Debug Mode
Enable debug logging:
```javascript
// In mapService.js
console.log('Distance API Response:', response.data);
```

## Performance Considerations

1. **API Quotas** - Monitor Google Maps API usage
2. **Caching** - Results are cached for repeated requests
3. **Debouncing** - Prevents excessive API calls
4. **Fallbacks** - Ensures app continues working

## Future Enhancements

1. **Route Visualization** - Show route on map
2. **Traffic Conditions** - Real-time traffic updates
3. **Alternative Routes** - Multiple route options
4. **Offline Support** - Cached distance calculations
5. **Route Optimization** - Best route suggestions