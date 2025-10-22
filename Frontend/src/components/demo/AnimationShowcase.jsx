import { useState } from 'react';
import { Button, Input, Card } from '../ui';

const AnimationShowcase = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const { showSuccess, showError, showWarning, showInfo, ToastContainer } = useAnimatedToast();
  const { elementRef, addBounce, addShake, addPulse, addGlow } = useMicroInteractions();
  const { visibleItems, triggerStaggered, resetAnimation } = useStaggeredAnimation([1, 2, 3, 4, 5]);

  const handleShowToasts = () => {
    showSuccess('Success! Animation completed');
    setTimeout(() => showInfo('Info: This is an information message'), 500);
    setTimeout(() => showWarning('Warning: Please check your input'), 1000);
    setTimeout(() => showError('Error: Something went wrong'), 1500);
  };

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  const microInteractionButtons = [
    { label: 'Bounce', action: addBounce, color: 'bg-blue-500' },
    { label: 'Shake', action: addShake, color: 'bg-red-500' },
    { label: 'Pulse', action: addPulse, color: 'bg-green-500' },
    { label: 'Glow', action: () => addGlow('orange'), color: 'bg-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in-down">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Animation Showcase</h1>
          <p className="text-gray-600">Demonstrating modern animations and micro-interactions</p>
        </div>

        {/* Page Transitions Demo */}
        <Card className="p-6 animate-fade-in-up animate-delay-100">
          <h2 className="text-2xl font-semibold mb-4">Page Transitions</h2>
          <p className="text-gray-600 mb-4">
            Page transitions are automatically applied when navigating between routes.
            Try navigating to different pages to see smooth slide, fade, and scale transitions.
          </p>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="text-sm text-gray-500">
              Current implementation: Slide transition with 300ms duration
            </div>
          </div>
        </Card>

        {/* Micro-interactions Demo */}
        <Card className="p-6 animate-fade-in-up animate-delay-200">
          <h2 className="text-2xl font-semibold mb-4">Micro-interactions</h2>
          <p className="text-gray-600 mb-4">
            Click the buttons below to see different micro-interaction effects:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {microInteractionButtons.map((btn, index) => (
              <Button
                key={btn.label}
                onClick={btn.action}
                className={`${btn.color} hover:${btn.color.replace('500', '600')} animate-fade-in-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {btn.label}
              </Button>
            ))}
          </div>
          <div 
            ref={elementRef}
            className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-lg shadow-lg"
          >
            Demo
          </div>
        </Card>

        {/* Form Animations Demo */}
        <Card className="p-6 animate-fade-in-up animate-delay-300">
          <h2 className="text-2xl font-semibold mb-4">Form Interactions</h2>
          <p className="text-gray-600 mb-4">
            Enhanced form inputs with focus animations, validation states, and micro-interactions:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              animate={true}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              animate={true}
            />
            <Input
              label="Success State"
              placeholder="This field is valid"
              success="Email is valid!"
              animate={true}
            />
            <Input
              label="Error State"
              placeholder="This field has an error"
              error="Please enter a valid email"
              animate={true}
            />
          </div>
        </Card>

        {/* Panel Animations Demo */}
        <Card className="p-6 animate-fade-in-up animate-delay-400">
          <h2 className="text-2xl font-semibold mb-4">Panel Slide Animations</h2>
          <p className="text-gray-600 mb-4">
            Smooth panel transitions for ride booking flow with multi-step animations:
          </p>
          <Button
            onClick={() => setShowPanel(true)}
            className="w-full md:w-auto"
          >
            Show Ride Booking Panel
          </Button>
        </Card>

        {/* Loading Animations Demo */}
        <Card className="p-6 animate-fade-in-up animate-delay-500">
          <h2 className="text-2xl font-semibold mb-4">Loading Animations</h2>
          <p className="text-gray-600 mb-4">
            Various loading states with skeleton screens and animated indicators:
          </p>
          <div className="space-y-4">
            <Button onClick={handleLoadingDemo}>
              Trigger Loading Demo
            </Button>
            
            {loading ? (
              <div className="space-y-6">
                <AnimatedLoading 
                  isLoading={true} 
                  type="spinner" 
                  message="Loading content..." 
                />
                <AnimatedSkeleton lines={3} avatar={true} />
                <AnimatedCardSkeleton />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <AnimatedLoading isLoading={false} type="spinner">
                    <div className="p-4 bg-green-100 rounded-lg text-center">
                      <div className="text-green-600 font-medium">Content Loaded!</div>
                    </div>
                  </AnimatedLoading>
                  <AnimatedLoading isLoading={false} type="dots">
                    <div className="p-4 bg-blue-100 rounded-lg text-center">
                      <div className="text-blue-600 font-medium">Dots Demo</div>
                    </div>
                  </AnimatedLoading>
                  <AnimatedLoading isLoading={false} type="wave">
                    <div className="p-4 bg-purple-100 rounded-lg text-center">
                      <div className="text-purple-600 font-medium">Wave Demo</div>
                    </div>
                  </AnimatedLoading>
                  <AnimatedLoading isLoading={false} type="ripple">
                    <div className="p-4 bg-orange-100 rounded-lg text-center">
                      <div className="text-orange-600 font-medium">Ripple Demo</div>
                    </div>
                  </AnimatedLoading>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Toast Notifications Demo */}
        <Card className="p-6 animate-fade-in-up animate-delay-600">
          <h2 className="text-2xl font-semibold mb-4">Toast Notifications</h2>
          <p className="text-gray-600 mb-4">
            Modern toast notifications with progress bars, hover pause, and smooth animations:
          </p>
          <Button onClick={handleShowToasts}>
            Show All Toast Types
          </Button>
        </Card>

        {/* Staggered Animations Demo */}
        <Card className="p-6 animate-fade-in-up animate-delay-700">
          <h2 className="text-2xl font-semibold mb-4">Staggered Animations</h2>
          <p className="text-gray-600 mb-4">
            Sequential animations for lists and grids:
          </p>
          <div className="flex gap-4 mb-4">
            <Button onClick={triggerStaggered}>
              Trigger Staggered
            </Button>
            <Button onClick={resetAnimation} variant="outline">
              Reset
            </Button>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={`h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold transition-all duration-500 ${
                  visibleItems.has(index) 
                    ? 'opacity-100 transform translate-y-0' 
                    : 'opacity-0 transform translate-y-4'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Animated Ride Panel */}
      <AnimatedRidePanel
        isVisible={showPanel}
        onClose={() => setShowPanel(false)}
        onBookRide={() => {
          showSuccess('Ride booked successfully!');
          setShowPanel(false);
        }}
        pickupLocation={pickupLocation}
        setPickupLocation={setPickupLocation}
        destinationLocation={destinationLocation}
        setDestinationLocation={setDestinationLocation}
      />

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default AnimationShowcase;