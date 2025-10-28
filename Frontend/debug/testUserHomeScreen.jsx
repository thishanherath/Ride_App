/**
 * Simple Test Version of UserHomeScreen
 * This should definitely work and show the map
 */

import React, { useState, useEffect } from 'react';

function TestUserHomeScreen() {
  const [location, setLocation] = useState(null);
  const [mapUrl, setMapUrl] = useState('https://www.google.com/maps?q=6.9271,79.8612&output=embed');

  useEffect(() => {
    // Test location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(loc);
          setMapUrl(`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}&output=embed`);
          console.log('✅ Location obtained:', loc);
        },
        (error) => {
          console.log('❌ Location error:', error.message);
        }
      );
    }
  }, []);

  return (
    <div className="relative w-full h-screen bg-gray-100">
      {/* Simple Map */}
      <div className="absolute inset-0">
        <iframe
          src={mapUrl}
          className="w-full h-full border-0"
          allowFullScreen={true}
          loading="lazy"
        />
      </div>

      {/* Simple Header */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white rounded-lg p-4 shadow-lg">
          <h1 className="text-xl font-bold">QuickRide Test</h1>
          {location ? (
            <p className="text-sm text-green-600">
              📍 Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </p>
          ) : (
            <p className="text-sm text-gray-600">🔄 Getting location...</p>
          )}
        </div>
      </div>

      {/* Simple Panel */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-white rounded-lg p-4 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Where to?</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Pickup location"
              value={location ? `${location.latitude}, ${location.longitude}` : ''}
              className="w-full p-3 border border-gray-300 rounded-lg"
              readOnly
            />
            <input
              type="text"
              placeholder="Where to?"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <button className="w-full bg-orange-500 text-white p-3 rounded-lg font-semibold">
              Find Ride
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestUserHomeScreen;