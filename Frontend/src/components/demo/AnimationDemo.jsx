import React, { useState } from 'react';
import { Button, Card, Input, Toast, Modal } from '../ui';
import { RideBookingPanel } from '../transitions/PanelTransition';
import { useAnimations, useToastAnimation, usePanelTransition } from '../../hooks/useAnimations';
import { SkeletonVehicleCard, SkeletonLocationSuggestion, SkeletonRidePanel } from '../ui/Skeleton';
import { RideLoadingSpinner, PanelLoadingSpinner } from '../ui/LoadingSpinner';

const AnimationDemo = () => {
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const { elementRef, triggerAnimation } = useAnimations();
  const { toasts, addToast } = useToastAnimation();
  const { isOpen: isPanelOpen, togglePanel } = usePanelTransition();

  const handleMicroInteraction = (type) => {
    switch (type) {
      case 'bounce':
        triggerAnimation('micro-bounce', 150);
        break;
      case 'lift':
        triggerAnimation('micro-lift', 200);
        break;
      case 'scale':
        triggerAnimation('micro-scale', 200);
        break;
      case 'wiggle':
        triggerAnimation('animate-wiggle', 1000);
        break;
      case 'heartbeat':
        triggerAnimation('animate-heartbeat', 1500);
        break;
      default:
        break;
    }
  };

  const showToastDemo = (type) => {
    addToast(
      `This is a ${type} toast notification with enhanced animations!`,
      type,
      4000
    );
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 animate-fade-in">
          Modern Animation System Demo
        </h1>
        <p className="text-gray-600 animate-fade-in animate-delay-200">
          Showcasing smooth animations, micro-interactions, and loading states
        </p>
      </div>

      {/* Page Transitions */}
      <Card className="p-6 animate-slide-in-up">
        <h2 className="text-xl font-semibold mb-4">Page Transitions</h2>
        <p className="text-gray-600 mb-4">
          Smooth page transitions are automatically applied when navigating between routes.
        </p>
        <div className="bg-gray-50 p-4 rounded-xl">
          <code className="text-sm">
            Pages fade in/out with smooth transitions using the PageTransition component
          </code>
        </div>
      </Card>

      {/* Micro-interactions */}
      <Card className="p-6 animate-slide-in-up animate-delay-100">
        <h2 className="text-xl font-semibold mb-4">Micro-interactions</h2>
        <p className="text-gray-600 mb-4">
          Enhanced button interactions with ripple effects and hover animations.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Button 
            ref={elementRef}
            onClick={() => handleMicroInteraction('bounce')}
            className="micro-bounce"
          >
            Bounce Effect
          </Button>
          <Button 
            variant="secondary"
            onClick={() => handleMicroInteraction('lift')}
            className="micro-lift"
          >
            Lift Effect
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleMicroInteraction('scale')}
            className="micro-scale"
          >
            Scale Effect
          </Button>
          <Button 
            onClick={() => handleMicroInteraction('wiggle')}
            className="animate-wiggle"
          >
            Wiggle
          </Button>
          <Button 
            variant="secondary"
            onClick={() => handleMicroInteraction('heartbeat')}
            className="animate-heartbeat"
          >
            Heartbeat
          </Button>
          <Button 
            variant="outline"
            className="animate-float"
          >
            Float
          </Button>
        </div>
      </Card>

      {/* Form Animations */}
      <Card className="p-6 animate-slide-in-up animate-delay-200">
        <h2 className="text-xl font-semibold mb-4">Form Interactions</h2>
        <p className="text-gray-600 mb-4">
          Enhanced form inputs with focus animations and validation feedback.
        </p>
        <div className="space-y-4">
          <Input 
            label="Email Address"
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
            label="Error Example"
            placeholder="This field has an error"
            error="This field is required"
            animate={true}
          />
        </div>
      </Card>

      {/* Panel Transitions */}
      <Card className="p-6 animate-slide-in-up animate-delay-300">
        <h2 className="text-xl font-semibold mb-4">Panel Transitions</h2>
        <p className="text-gray-600 mb-4">
          Smooth slide-up animations for ride booking panels and modals.
        </p>
        <div className="space-x-4">
          <Button onClick={togglePanel}>
            {isPanelOpen ? 'Close' : 'Open'} Ride Panel
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(true)}>
            Show Modal
          </Button>
        </div>
      </Card>

      {/* Toast Notifications */}
      <Card className="p-6 animate-slide-in-up animate-delay-400">
        <h2 className="text-xl font-semibold mb-4">Toast Notifications</h2>
        <p className="text-gray-600 mb-4">
          Modern toast notifications with slide animations and progress bars.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button onClick={() => showToastDemo('success')} variant="outline">
            Success Toast
          </Button>
          <Button onClick={() => showToastDemo('error')} variant="outline">
            Error Toast
          </Button>
          <Button onClick={() => showToastDemo('warning')} variant="outline">
            Warning Toast
          </Button>
          <Button onClick={() => showToastDemo('info')} variant="outline">
            Info Toast
          </Button>
        </div>
      </Card>

      {/* Loading States */}
      <Card className="p-6 animate-slide-in-up animate-delay-500">
        <h2 className="text-xl font-semibold mb-4">Loading Animations</h2>
        <p className="text-gray-600 mb-4">
          Various loading states with smooth animations and skeleton screens.
        </p>
        <div className="space-y-6">
          <div>
            <Button 
              onClick={() => setShowSkeleton(!showSkeleton)}
              className="mb-4"
            >
              {showSkeleton ? 'Hide' : 'Show'} Skeleton Loading
            </Button>
            {showSkeleton && (
              <div className="space-y-4">
                <SkeletonVehicleCard />
                <SkeletonLocationSuggestion items={3} />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Ride Loading</h3>
              <RideLoadingSpinner text="Finding available rides" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Panel Loading</h3>
              <PanelLoadingSpinner text="Loading ride details" />
            </div>
          </div>
        </div>
      </Card>

      {/* Staggered Animations */}
      <Card className="p-6 animate-slide-in-up animate-delay-600">
        <h2 className="text-xl font-semibold mb-4">Staggered Animations</h2>
        <p className="text-gray-600 mb-4">
          Elements animate in sequence for a polished feel.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item, index) => (
            <div 
              key={item}
              className={`p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl animate-fade-in animate-delay-${index * 100}`}
            >
              <h3 className="font-semibold">Item {item}</h3>
              <p className="text-sm text-gray-600">Animated with delay</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Panel Demo */}
      <RideBookingPanel
        isVisible={isPanelOpen}
        onClose={togglePanel}
        title="Ride Booking Demo"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This panel slides up smoothly from the bottom with a backdrop blur effect.
          </p>
          <Input placeholder="Pickup location" />
          <Input placeholder="Destination" />
          <Button className="w-full">Find Rides</Button>
        </div>
      </RideBookingPanel>

      {/* Modal Demo */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Animation Demo Modal"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This modal appears with a smooth scale animation and backdrop blur.
          </p>
          <Button onClick={() => setShowModal(false)} className="w-full">
            Close Modal
          </Button>
        </div>
      </Modal>

      {/* Toast Container */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => {}}
        />
      ))}
    </div>
  );
};

export default AnimationDemo;