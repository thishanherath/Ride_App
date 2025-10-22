import React, { useEffect, useState } from 'react';

const PanelTransition = ({ 
  isVisible, 
  children, 
  direction = 'up', 
  duration = 700,
  className = '',
  onEnter,
  onExit,
  backdrop = true
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setAnimationClass(getEnterClass());
        onEnter?.();
      }, 10);
    } else {
      setAnimationClass(getExitClass());
      onExit?.();
      setTimeout(() => {
        setShouldRender(false);
        setAnimationClass('');
      }, duration);
    }
  }, [isVisible, duration, onEnter, onExit]);

  const getEnterClass = () => {
    switch (direction) {
      case 'up':
        return 'animate-slide-up-panel';
      case 'down':
        return 'animate-slide-in-down';
      case 'left':
        return 'animate-slide-in-left';
      case 'right':
        return 'animate-slide-in-right';
      case 'scale':
        return 'animate-scale-in';
      case 'fade':
        return 'animate-fade-in';
      default:
        return 'animate-slide-up-panel';
    }
  };

  const getExitClass = () => {
    switch (direction) {
      case 'up':
        return 'animate-slide-down-panel';
      case 'down':
        return 'transform translate-y-full opacity-0 transition-all duration-700 ease-out';
      case 'left':
        return 'transform -translate-x-full opacity-0 transition-all duration-700 ease-out';
      case 'right':
        return 'transform translate-x-full opacity-0 transition-all duration-700 ease-out';
      case 'scale':
        return 'transform scale-90 opacity-0 transition-all duration-300 ease-out';
      case 'fade':
        return 'opacity-0 transition-opacity duration-300 ease-out';
      default:
        return 'animate-slide-down-panel';
    }
  };

  if (!shouldRender) return null;

  return (
    <>
      {backdrop && (
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      <div className={`${animationClass} ${className}`}>
        {children}
      </div>
    </>
  );
};

// Specialized ride booking panel transition
export const RideBookingPanel = ({ 
  isVisible, 
  children, 
  className = '',
  onClose,
  title,
  showHandle = true
}) => {
  return (
    <PanelTransition
      isVisible={isVisible}
      direction="up"
      className={`absolute bottom-0 left-0 right-0 z-20 ${className}`}
      backdrop={false}
    >
      <div className="bg-white rounded-t-3xl shadow-2xl border-0 p-6 max-h-[85vh] overflow-hidden">
        {/* Panel Handle */}
        {showHandle && (
          <div 
            onClick={onClose}
            className="flex justify-center py-2 pb-4 cursor-pointer group"
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full group-hover:bg-gray-400 transition-colors duration-200" />
          </div>
        )}
        
        {/* Title */}
        {title && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto max-h-full">
          {children}
        </div>
      </div>
    </PanelTransition>
  );
};

// Modal transition wrapper
export const ModalTransition = ({ 
  isVisible, 
  children, 
  className = '',
  onClose,
  closeOnBackdrop = true
}) => {
  return (
    <PanelTransition
      isVisible={isVisible}
      direction="scale"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
      backdrop={true}
    >
      <div 
        className="absolute inset-0"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full">
        {children}
      </div>
    </PanelTransition>
  );
};

export default PanelTransition;