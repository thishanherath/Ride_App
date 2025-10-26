# 🗺️ Map Integration Setup

## Overview
The ride app now includes a full-screen interactive map using Google Maps API. Users can:
- View a full-screen map with real-time location
- Search for locations with auto-complete
- Click on the map to select locations
- See nearby drivers on the map
- Book rides directly from the map

## Setup Instructions

### 1. Google Maps API Key
You need to get a Google Maps API key and add it to your environment variables:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Distance Matrix API
4. Create credentials (API Key)
5. Add the API key to your `.env` file:

```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 2. Environment Variables
Create a `.env` file in the Frontend directory with:

```env
VITE_SERVER_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. Features Available

#### Full-Screen Map (`/map`)
- Interactive Google Maps
- Location search with auto-complete
- Click to select locations
- Nearby drivers display
- Direct ride booking

#### Map Integration in Home Screen
- "Open Full Map" button in location input section
- Seamless navigation to full-screen map
- Location selection returns to home screen

#### Backend Map Services
- Address geocoding (address → coordinates)
- Distance and time calculations
- Auto-complete suggestions
- Nearby driver search

## Usage

### For Users:
1. Go to the home screen
2. Click "Open Full Map" button
3. Search for locations or click on the map
4. Select your desired location
5. Book a ride directly from the map

### For Developers:
The map components are located in:
- `Frontend/src/screens/MapScreen.jsx` - Full-screen map
- `Frontend/src/components/MapView.jsx` - Reusable map modal
- `Backend/routes/maps.routes.js` - Map API endpoints
- `Backend/controllers/map.controller.js` - Map logic
- `Backend/services/map.service.js` - Google Maps integration

## API Endpoints Used:
- `GET /map/get-coordinates` - Convert address to coordinates
- `GET /map/get-distance-time` - Calculate distance and time
- `GET /map/get-suggestions` - Auto-complete suggestions

## Notes:
- The map requires a valid Google Maps API key
- All map functionality uses the existing backend services
- No additional database changes were needed
- The map is fully responsive and mobile-friendly
