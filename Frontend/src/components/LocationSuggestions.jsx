import { MapPin, Clock, Star, Navigation, History, TrendingUp } from "lucide-react";
import Console from "../utils/console";

function LocationSuggestions({
  suggestions = [],
  setSuggestions,
  setPickupLocation,
  setDestinationLocation,
  input,
}) {
  const handleLocationSelect = (suggestion) => {
    Console.log(suggestion);
    if (input === "pickup") {
      setPickupLocation(suggestion);
      setSuggestions([]);
    }
    if (input === "destination") {
      setDestinationLocation(suggestion);
      setSuggestions([]);
    }
  };

  const getLocationIcon = (suggestion, index) => {
    // Add variety to location icons for better visual hierarchy and context
    if (suggestion.toLowerCase().includes('airport') || suggestion.toLowerCase().includes('station')) {
      return <Navigation size={18} />;
    }
    if (suggestion.toLowerCase().includes('mall') || suggestion.toLowerCase().includes('market')) {
      return <Star size={18} />;
    }
    if (index < 2) {
      return <History size={18} />; // Recent locations
    }
    if (index === 2) {
      return <TrendingUp size={18} />; // Popular location
    }
    return <MapPin size={18} />;
  };

  const getLocationMeta = (suggestion, index) => {
    // Add realistic metadata for suggestions
    const distances = ["0.2 km", "0.5 km", "1.2 km", "2.1 km", "3.5 km"];
    const times = ["2 min", "5 min", "8 min", "12 min", "15 min"];
    
    return {
      distance: distances[index % distances.length],
      time: times[index % times.length]
    };
  };

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Suggested Locations</h3>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        <div className="divide-y divide-gray-50">
          {suggestions.map((suggestion, index) => {
            const meta = getLocationMeta(suggestion, index);
            
            return (
              <div
                onClick={() => handleLocationSelect(suggestion)}
                key={index}
                className="cursor-pointer flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-25 transition-all duration-300 group hover:shadow-sm active:scale-[0.98]"
              >
                {/* Location Icon */}
                <div className="bg-gray-100 p-3 rounded-2xl group-hover:bg-orange-100 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm group-hover:shadow-md">
                  <div className="text-gray-600 group-hover:text-orange-600 transition-colors duration-300">
                    {getLocationIcon(suggestion, index)}
                  </div>
                </div>
                
                {/* Location Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-orange-900 transition-colors duration-300 truncate mb-1">
                    {suggestion.split(", ")[0]}
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 truncate mb-2">
                    {suggestion.split(", ").slice(1).join(", ") || "Suggested location"}
                  </p>
                  
                  {/* Distance and Time */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 group-hover:text-orange-600 transition-colors duration-300 bg-gray-50 group-hover:bg-orange-50 px-2 py-1 rounded-full">
                      <Navigation size={12} />
                      <span className="font-medium">{meta.distance}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 group-hover:text-orange-600 transition-colors duration-300 bg-gray-50 group-hover:bg-orange-50 px-2 py-1 rounded-full">
                      <Clock size={12} />
                      <span className="font-medium">{meta.time}</span>
                    </div>
                  </div>
                </div>
                
                {/* Selection Indicator */}
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                  <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm group-hover:shadow-md">
                    <div className="w-full h-full bg-orange-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer with suggestion count */}
      {suggestions.length > 5 && (
        <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500 font-medium">
            Showing {Math.min(suggestions.length, 10)} of {suggestions.length} suggestions
          </p>
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin size={12} />
            <span>Tap to select</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center gap-1 text-gray-500">
            <Star size={12} />
            <span>Recent locations</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationSuggestions;
