import { Clock, Users, Zap, Shield, Star, ChevronRight, Navigation } from "lucide-react";
import { Card, Badge } from "./ui";

const vehicles = [
  {
    id: 1,
    name: "QuickCar",
    description: "Comfortable rides for 1-4 people",
    type: "car",
    image: "car.png",
    price: 193.8,
    capacity: "1-4",
    features: ["AC", "GPS Tracking"],
    eta: "2 min",
    rating: 4.8,
    isPopular: false,
  },
  {
    id: 2,
    name: "QuickBike",
    description: "Fast & affordable motorcycle rides",
    type: "bike",
    image: "bike.webp",
    price: 254.7,
    capacity: "1-2",
    features: ["Helmet Provided", "Quick Pickup"],
    eta: "1 min",
    rating: 4.6,
    isPopular: true,
  },
  {
    id: 3,
    name: "QuickAuto",
    description: "Traditional auto-rickshaw experience",
    type: "auto",
    image: "auto.webp",
    price: 200.0,
    capacity: "1-3",
    features: ["Open Air", "Local Experience"],
    eta: "3 min",
    rating: 4.5,
    isPopular: false,
  },
];

function SelectVehicle({
  selectedVehicle,
  showPanel,
  setShowPanel,
  showPreviousPanel,
  showNextPanel,
  fare,
}) {
  return (
    <div
      className={`${
        showPanel ? "bottom-0 translate-y-0 opacity-100" : "bottom-0 translate-y-full opacity-0"
      } transition-all duration-700 ease-out absolute w-full z-20`}
    >
      <Card className="bg-white rounded-t-3xl shadow-2xl border-0 p-6 max-h-[80vh] overflow-hidden">
        {/* Panel Handle */}
        <div
          onClick={() => {
            setShowPanel(false);
            showPreviousPanel(true);
          }}
          className="flex justify-center py-2 pb-4 cursor-pointer group"
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full group-hover:bg-gray-400 transition-colors duration-200" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Choose your ride</h2>
            <p className="text-sm text-gray-600">Select the best option for your trip</p>
          </div>
          <div className="text-right">
            <Badge variant="outline" color="primary" size="sm">
              {vehicles.length} options
            </Badge>
          </div>
        </div>
        
        {/* Vehicle List */}
        <div className="space-y-4 overflow-y-auto max-h-96 scrollbar-hide">
          {vehicles.map((vehicle, index) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              fare={fare}
              selectedVehicle={selectedVehicle}
              setShowPanel={setShowPanel}
              showNextPanel={showNextPanel}
              index={index}
            />
          ))}
        </div>
        
        {/* Footer Info */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-4">
            <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Insured</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-green-600" />
                <span className="font-medium">GPS Tracked</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="font-medium">Rated Drivers</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

const VehicleCard = ({
  vehicle,
  selectedVehicle,
  fare,
  setShowPanel,
  showNextPanel,
  index,
}) => {
  const handleVehicleSelect = () => {
    selectedVehicle(vehicle.type);
    setShowPanel(false);
    showNextPanel(true);
  };

  return (
    <div
      onClick={handleVehicleSelect}
      className="cursor-pointer relative bg-white border-2 border-gray-100 rounded-3xl p-6 hover:border-orange-200 hover:shadow-xl transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98]"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'slideInUp 0.6s ease-out forwards'
      }}
    >
      {/* Popular Badge */}
      {vehicle.isPopular && (
        <div className="absolute -top-3 left-6">
          <Badge variant="solid" color="primary" size="sm" className="shadow-lg">
            <Zap className="w-3 h-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      
      <div className="flex items-center gap-5">
        {/* Vehicle Image */}
        <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-3xl flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-2 border border-gray-100">
          <img
            src={`/${vehicle.image}`}
            className="w-20 h-14 object-contain filter group-hover:brightness-110 transition-all duration-300"
            alt={vehicle.name}
            loading="lazy"
          />
        </div>
        
        {/* Vehicle Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-bold text-gray-900 text-xl group-hover:text-orange-900 transition-colors duration-300">
              {vehicle.name}
            </h3>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-semibold text-yellow-700">{vehicle.rating}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 group-hover:text-gray-700 transition-colors duration-300">
            {vehicle.description}
          </p>
          
          {/* Vehicle Meta Info */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 group-hover:bg-orange-50 px-3 py-1.5 rounded-full transition-all duration-300">
              <Users className="w-3 h-3" />
              <span className="font-medium">{vehicle.capacity}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 group-hover:bg-orange-50 px-3 py-1.5 rounded-full transition-all duration-300">
              <Clock className="w-3 h-3" />
              <span className="font-medium">{vehicle.eta} away</span>
            </div>
          </div>
          
          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {vehicle.features.map((feature, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                color="gray"
                size="xs"
                className="group-hover:border-orange-200 group-hover:text-orange-600 transition-all duration-300"
              >
                {feature}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Price and Action */}
        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 group-hover:from-orange-100 group-hover:to-orange-200 px-4 py-2 rounded-2xl transition-all duration-300">
              <p className="font-bold text-2xl text-gray-900 group-hover:text-orange-700 transition-colors duration-300">
                ₹{fare[vehicle.type]}
              </p>
              <p className="text-xs text-gray-500 group-hover:text-orange-600 transition-colors duration-300 font-medium">
                Est. total
              </p>
            </div>
          </div>
          
          {/* Select Button */}
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
            <div className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-50/0 via-orange-50/30 to-orange-100/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Animated Border */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-3xl border-2 border-orange-200 animate-pulse" />
      </div>
    </div>
  );
};
export default SelectVehicle;
