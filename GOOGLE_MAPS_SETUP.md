# Google Maps API Setup Guide

## Issue
The map destination routing is not showing because the Google Maps API key is missing from the environment configuration.

## Required APIs
Your Google Maps API key needs to have the following APIs enabled:
1. **Maps JavaScript API** - For displaying maps
2. **Places API** - For location suggestions and autocomplete
3. **Geocoding API** - For converting addresses to coordinates
4. **Distance Matrix API** - For calculating routes and travel time
5. **Directions API** - For showing route paths on the map

## Setup Steps

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the required APIs listed above
4. Create credentials (API Key)
5. Restrict the API key for security:
   - For frontend: Restrict to your domain (localhost:5173 for development)
   - For backend: Restrict to server IP or use application restrictions

### 2. Configure Environment Variables

**Frontend (.env file):**
```
VITE_SERVER_URL=http://localhost:4000
VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

**Backend (.env file):**
```
GOOGLE_MAPS_API=YOUR_ACTUAL_API_KEY_HERE
```

### 3. Replace Placeholder Values
Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` and `YOUR_ACTUAL_API_KEY_HERE` with your actual Google Maps API key.

### 4. Restart Services
After updating the environment files:
1. Restart the backend server
2. Restart the frontend development server

## Testing
Once configured, the following features should work:
- ✅ Location suggestions when typing pickup/destination
- ✅ Route visualization on the map
- ✅ Distance and time calculations
- ✅ Real-time directions between pickup and destination

## Troubleshooting

### Common Issues:
1. **API Key Invalid**: Check if the key is correct and APIs are enabled
2. **Quota Exceeded**: Check your Google Cloud Console for usage limits
3. **Request Denied**: Verify API key restrictions and permissions
4. **CORS Errors**: Ensure domain restrictions are properly configured

### Debug Steps:
1. Check browser console for API errors
2. Verify environment variables are loaded correctly
3. Test API key with a simple request in browser
4. Check Google Cloud Console for API usage and errors

## Security Notes
- Never commit real API keys to version control
- Use environment variables for all API keys
- Set up proper API key restrictions
- Monitor API usage to prevent unexpected charges