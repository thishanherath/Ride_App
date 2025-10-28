import { Clock, Users, Zap, Shield, Star, ChevronRight, Navigation, ChevronUp, ChevronDown } from "lucide-react";
import { Card, Badge } from "./ui";
import { useState, useRef, useEffect } from "react";
import { formatCurrency } from "../utils/currency";

const vehicles = [
  {
    id: 1,
    name: "QuickCar",
    description: "Comfortable rides for 1-4 people",
    type: "car",
    image: "car.png",
    price: 969,    // ~193.8 INR = 969 LKR
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
    price: 1274,   // ~254.7 INR = 1274 LKR
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
    price: 1000,   // ~200 INR = 1000 LKR
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
  fareBreakdown,
  onFareRecalculate,
}) {
  const [panelHeight, setPanelHeight] = useState('partial'); // 'collapsed', 'partial', 'full'
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const panelRef = useRef(null);

  // Height configurations
  const heights = {
    collapsed: '20vh',
    partial: '50vh', 
    full: '85vh'
  };

  // Handle drag start
  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
    setStartY(clientY);
    setCurrentY(clientY);
  };

  // Handle drag move
  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
    setCurrentY(clientY);
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    const deltaY = currentY - startY;
    const threshold = 80;
    const velocity = Math.abs(deltaY);

    // Add momentum-based threshold adjustment
    const adjustedThreshold = velocity > 100 ? threshold * 0.6 : threshold;

    if (deltaY > adjustedThreshold) {
      // Dragged down
      if (panelHeight === 'full') {
        setPanelHeight('partial');
      } else if (panelHeight === 'partial') {
        setPanelHeight('collapsed');
      } else {
        // If already collapsed, close the panel
        setShowPanel(false);
        showPreviousPanel(true);
      }
    } else if (deltaY < -adjustedThreshold) {
      // Dragged up
      if (panelHeight === 'collapsed') {
        setPanelHeight('partial');
      } else if (panelHeight === 'partial') {
        setPanelHeight('full');
      }
    }
  };

  // Add event listeners
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e) => handleDragMove(e);
      const handleMouseUp = () => handleDragEnd();
      const handleTouchMove = (e) => handleDragMove(e);
      const handleTouchEnd = () => handleDragEnd();

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, currentY, startY]);

  // Calculate dynamic transform based on drag
  const getDynamicTransform = () => {
    if (!isDragging) return '';
    const deltaY = currentY - startY;
    // Add resistance when dragging beyond limits
    const resistance = 0.3;
    const maxDrag = window.innerHeight * 0.3;
    
    if (deltaY > 0) {
      // Dragging down - add resistance
      return `translateY(${Math.min(deltaY * resistance, maxDrag)}px)`;
    } else {
      // Dragging up - add resistance
      return `translateY(${Math.max(deltaY * resistance, -maxDrag)}px)`;
    }
  };

  // Add visual feedback for drag zones
  const getDragFeedback = () => {
    if (!isDragging) return '';
    const deltaY = currentY - startY;
    const threshold = 80;
    
    if (Math.abs(deltaY) > threshold) {
      return 'ring-2 ring-orange-300 ring-opacity-50';
    }
    return '';
  };

  return (
    <div
      className={`${
        showPanel ? "bottom-0 translate-y-0 opacity-100" : "bottom-0 translate-y-full opacity-0"
      } transition-all duration-700 ease-out absolute w-full z-20`}
      style={{
        transform: isDragging ? getDynamicTransform() : undefined
      }}
    >
      <Card 
        ref={panelRef}
        className={`bg-white rounded-t-3xl shadow-2xl border-0 overflow-hidden transition-all duration-500 ease-out ${
          isDragging ? 'panel-dragging shadow-3xl' : 'panel-snapping'
        } ${getDragFeedback()}`}
        style={{ 
          height: heights[panelHeight],
          maxHeight: '85vh'
        }}
      >
        {/* Enhanced Panel Handle */}
        <div
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          className="flex flex-col items-center py-3 cursor-grab active:cursor-grabbing group select-none"
          style={{ touchAction: 'none' }}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full group-hover:bg-gray-400 transition-colors duration-200 mb-2" />
          
          {/* Height indicator and quick actions */}
          <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
            {/* Quick collapse button */}
            {panelHeight !== 'collapsed' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPanelHeight('collapsed');
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>
            )}
            
            {/* Height indicator */}
            <div className="flex items-center gap-1">
              {panelHeight === 'collapsed' && <ChevronUp className="w-4 h-4 text-gray-500" />}
              {panelHeight === 'partial' && (
                <>
                  <ChevronUp className="w-3 h-3 text-gray-400" />
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </>
              )}
              {panelHeight === 'full' && <ChevronDown className="w-4 h-4 text-gray-500" />}
            </div>

            {/* Quick expand button */}
            {panelHeight !== 'full' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPanelHeight('full');
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <ChevronUp className="w-3 h-3 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 pb-6 h-full overflow-hidden flex flex-col">
          {/* Close button - only show in collapsed mode */}
          {panelHeight === 'collapsed' && (
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Choose your ride</h3>
              <button
                onClick={() => {
                  setShowPanel(false);
                  showPreviousPanel(true);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                ✕
              </button>
            </div>
          )}
          
          {/* Header - only show in partial/full mode */}
          {panelHeight !== 'collapsed' && (
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Choose your ride</h2>
                <p className="text-sm text-gray-600">Select the best option for your trip</p>
              </div>
              <div className="text-right flex items-center gap-3">
                <Badge variant="outline" color="primary" size="sm">
                  {vehicles.length} options
                </Badge>
                <button
                  onClick={() => {
                    setShowPanel(false);
                    showPreviousPanel(true);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          {/* Vehicle List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className={`space-y-4 ${panelHeight === 'collapsed' ? 'space-y-2' : 'space-y-4'}`}>
              {vehicles.map((vehicle, index) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  fare={fare}
                  selectedVehicle={selectedVehicle}
                  setShowPanel={setShowPanel}
                  showNextPanel={showNextPanel}
                  index={index}
                  isCompact={panelHeight === 'collapsed'}
                />
              ))}
            </div>
          </div>
          
          {/* Footer Info - only show in full mode */}
          {panelHeight === 'full' && (
            <div className="mt-6 pt-6 border-t border-gray-100 flex-shrink-0">
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
          )}
        </div>
      </Card>
    </div>
  );
}

const VehicleCard = ({
  vehicle,
  selectedVehicle,
  fare,
  fareBreakdown,
  setShowPanel,
  showNextPanel,
  index,
  isCompact = false,
}) => {
  const handleVehicleSelect = () => {
    selectedVehicle(vehicle.type);
    setShowPanel(false);
    showNextPanel(true);
  };

  return (
    <div
      onClick={handleVehicleSelect}
      className={`cursor-pointer relative bg-white border-2 border-gray-100 rounded-3xl hover:border-orange-200 hover:shadow-xl transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98] ${
        isCompact ? 'p-3' : 'p-6'
      }`}
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
      
      <div className={`flex items-center ${isCompact ? 'gap-3' : 'gap-5'}`}>
        {/* Vehicle Image */}
        <div className={`flex-shrink-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-3xl flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-2 border border-gray-100 ${
          isCompact ? 'w-16 h-16' : 'w-24 h-24'
        }`}>
          <img
            src={`/${vehicle.image}`}
            className={`object-contain filter group-hover:brightness-110 transition-all duration-300 ${
              isCompact ? 'w-12 h-8' : 'w-20 h-14'
            }`}
            alt={vehicle.name}
            loading="lazy"
          />
        </div>
        
        {/* Vehicle Details */}
        <div className="flex-1 min-w-0">
          <div className={`flex items-center gap-3 ${isCompact ? 'mb-1' : 'mb-2'}`}>
            <h3 className={`font-bold text-gray-900 group-hover:text-orange-900 transition-colors duration-300 ${
              isCompact ? 'text-lg' : 'text-xl'
            }`}>
              {vehicle.name}
            </h3>
            {!isCompact && (
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-semibold text-yellow-700">{vehicle.rating}</span>
              </div>
            )}
          </div>
          
          {!isCompact && (
            <p className="text-sm text-gray-600 mb-3 group-hover:text-gray-700 transition-colors duration-300">
              {vehicle.description}
            </p>
          )}
          
          {/* Vehicle Meta Info */}
          <div className={`flex items-center gap-4 ${isCompact ? 'mb-1' : 'mb-3'}`}>
            <div className={`flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 group-hover:bg-orange-50 rounded-full transition-all duration-300 ${
              isCompact ? 'px-2 py-1' : 'px-3 py-1.5'
            }`}>
              <Users className="w-3 h-3" />
              <span className="font-medium">{vehicle.capacity}</span>
            </div>
            <div className={`flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 group-hover:bg-orange-50 rounded-full transition-all duration-300 ${
              isCompact ? 'px-2 py-1' : 'px-3 py-1.5'
            }`}>
              <Clock className="w-3 h-3" />
              <span className="font-medium">{vehicle.eta} away</span>
            </div>
            {isCompact && (
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-xs font-semibold text-yellow-700">{vehicle.rating}</span>
              </div>
            )}
          </div>
          
          {/* Features - only show in non-compact mode */}
          {!isCompact && (
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
          )}
        </div>
        
        {/* Price and Action */}
        <div className={`flex flex-col items-end ${isCompact ? 'gap-2' : 'gap-3'}`}>
          <div className="text-right">
            <div className={`bg-gradient-to-r from-orange-50 to-orange-100 group-hover:from-orange-100 group-hover:to-orange-200 rounded-2xl transition-all duration-300 ${
              isCompact ? 'px-3 py-1.5' : 'px-4 py-2'
            }`}>
              <p className={`font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300 ${
                isCompact ? 'text-lg' : 'text-2xl'
              }`}>
                {formatCurrency(fare[vehicle.type])}
              </p>
              {!isCompact && (
                <p className="text-xs text-gray-500 group-hover:text-orange-600 transition-colors duration-300 font-medium">
                  Est. total
                </p>
              )}
            </div>
          </div>
          
          {/* Select Button */}
          <div className={`opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 ${
            isCompact ? 'scale-90' : ''
          }`}>
            <div className={`bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 ${
              isCompact ? 'p-2' : 'p-3'
            }`}>
              <ChevronRight className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
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
