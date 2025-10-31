import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import RideStatusProgress from '../RideStatusProgress';
import { RideStatus } from '../../../types/driver.types';

// Mock the UI components
vi.mock('../../ui/Card', () => ({
  default: function MockCard({ children, className, ...props }) {
    return <div className={`mock-card ${className || ''}`} {...props}>{children}</div>;
  }
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  CheckCircle: ({ className }) => <div className={`mock-icon check-circle ${className || ''}`} data-testid="check-circle-icon" />,
  Clock: ({ className }) => <div className={`mock-icon clock ${className || ''}`} data-testid="clock-icon" />,
  Car: ({ className }) => <div className={`mock-icon car ${className || ''}`} data-testid="car-icon" />,
  MapPin: ({ className }) => <div className={`mock-icon map-pin ${className || ''}`} data-testid="map-pin-icon" />,
  Play: ({ className }) => <div className={`mock-icon play ${className || ''}`} data-testid="play-icon" />,
  CheckSquare: ({ className }) => <div className={`mock-icon check-square ${className || ''}`} data-testid="check-square-icon" />,
  XCircle: ({ className }) => <div className={`mock-icon x-circle ${className || ''}`} data-testid="x-circle-icon" />
}));

describe('RideStatusProgress', () => {
  const mockStatusHistory = [
    {
      status: RideStatus.BOOKING_CONFIRMED,
      timestamp: new Date('2024-01-01T10:00:00Z')
    },
    {
      status: RideStatus.DRIVER_ASSIGNED,
      timestamp: new Date('2024-01-01T10:05:00Z')
    }
  ];

  const defaultProps = {
    currentStatus: RideStatus.DRIVER_ASSIGNED,
    statusHistory: mockStatusHistory,
    showProgress: true
  };

  beforeEach(() => {
    // Mock toLocaleTimeString to return consistent results
    vi.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('10:05 AM');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(<RideStatusProgress {...defaultProps} />);
      expect(screen.getByText('Driver Assigned')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <RideStatusProgress {...defaultProps} className="custom-class" />
      );
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('renders with minimal props', () => {
      render(<RideStatusProgress currentStatus={RideStatus.DRIVER_ASSIGNED} />);
      expect(screen.getByText('Driver Assigned')).toBeInTheDocument();
    });
  });

  describe('Current Status Display', () => {
    it('displays current status with correct icon and text', () => {
      render(<RideStatusProgress {...defaultProps} />);
      
      expect(screen.getByText('Driver Assigned')).toBeInTheDocument();
      expect(screen.getByText('A driver has been assigned to your ride')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });

    it('displays timestamp for current status when available in history', () => {
      render(<RideStatusProgress {...defaultProps} />);
      expect(screen.getByText('10:05 AM')).toBeInTheDocument();
    });

    it('handles unknown status gracefully', () => {
      render(<RideStatusProgress currentStatus="unknown_status" />);
      expect(screen.getByText('Unknown Status')).toBeInTheDocument();
      expect(screen.getByText('Status update in progress')).toBeInTheDocument();
    });
  });

  describe('Status Icons', () => {
    it('renders correct icon for BOOKING_CONFIRMED status', () => {
      render(<RideStatusProgress currentStatus={RideStatus.BOOKING_CONFIRMED} />);
      expect(screen.getByTestId('check-square-icon')).toBeInTheDocument();
    });

    it('renders correct icon for DRIVER_EN_ROUTE status', () => {
      render(<RideStatusProgress currentStatus={RideStatus.DRIVER_EN_ROUTE} />);
      expect(screen.getByTestId('car-icon')).toBeInTheDocument();
    });

    it('renders correct icon for DRIVER_ARRIVED status', () => {
      render(<RideStatusProgress currentStatus={RideStatus.DRIVER_ARRIVED} />);
      expect(screen.getByTestId('map-pin-icon')).toBeInTheDocument();
    });

    it('renders correct icon for RIDE_STARTED status', () => {
      render(<RideStatusProgress currentStatus={RideStatus.RIDE_STARTED} />);
      expect(screen.getByTestId('play-icon')).toBeInTheDocument();
    });

    it('renders correct icon for RIDE_CANCELLED status', () => {
      render(<RideStatusProgress currentStatus={RideStatus.RIDE_CANCELLED} />);
      expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument();
    });
  });

  describe('Progress Timeline', () => {
    it('shows progress timeline when showProgress is true', () => {
      render(<RideStatusProgress {...defaultProps} showProgress={true} />);
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    it('hides progress timeline when showProgress is false', () => {
      render(<RideStatusProgress {...defaultProps} showProgress={false} />);
      expect(screen.queryByText('Progress')).not.toBeInTheDocument();
    });

    it('displays all status steps in correct order', () => {
      render(<RideStatusProgress {...defaultProps} />);
      
      const steps = [
        'Booking Confirmed',
        'Driver Assigned',
        'Driver En Route',
        'Driver Arrived',
        'Ride Started',
        'Ride Completed'
      ];

      steps.forEach(step => {
        expect(screen.getByText(step)).toBeInTheDocument();
      });
    });

    it('marks completed steps correctly', () => {
      const { container } = render(<RideStatusProgress {...defaultProps} />);
      
      // Should have completed steps for statuses with lower order
      const completedSteps = container.querySelectorAll('.ride-status-progress__step--completed');
      expect(completedSteps.length).toBeGreaterThan(0);
    });

    it('marks current step correctly', () => {
      const { container } = render(<RideStatusProgress {...defaultProps} />);
      
      const currentSteps = container.querySelectorAll('.ride-status-progress__step--current');
      expect(currentSteps).toHaveLength(1);
    });

    it('displays timestamps for completed steps', () => {
      render(<RideStatusProgress {...defaultProps} />);
      
      // Should show timestamps for steps in history
      const timestamps = screen.getAllByText('10:05 AM');
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });

  describe('Next Step Preview', () => {
    it('displays custom next step when provided', () => {
      const customNextStep = 'Custom next step description';
      render(
        <RideStatusProgress 
          {...defaultProps} 
          nextStep={customNextStep}
        />
      );
      
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText(customNextStep)).toBeInTheDocument();
    });

    it('displays automatic next step when not provided', () => {
      render(<RideStatusProgress {...defaultProps} />);
      
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Your driver is on the way to pick you up')).toBeInTheDocument();
    });

    it('hides next step for completed rides', () => {
      render(
        <RideStatusProgress 
          currentStatus={RideStatus.RIDE_COMPLETED}
          statusHistory={mockStatusHistory}
        />
      );
      
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });

    it('hides next step for cancelled rides', () => {
      render(
        <RideStatusProgress 
          currentStatus={RideStatus.RIDE_CANCELLED}
          statusHistory={mockStatusHistory}
        />
      );
      
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });
  });

  describe('Cancelled Status Handling', () => {
    it('displays special cancelled status layout', () => {
      render(
        <RideStatusProgress 
          currentStatus={RideStatus.RIDE_CANCELLED}
          statusHistory={mockStatusHistory}
        />
      );
      
      expect(screen.getByText('Ride Cancelled')).toBeInTheDocument();
      expect(screen.getByText('Your ride has been cancelled. You can book a new ride anytime.')).toBeInTheDocument();
    });

    it('hides progress timeline for cancelled rides', () => {
      render(
        <RideStatusProgress 
          currentStatus={RideStatus.RIDE_CANCELLED}
          statusHistory={mockStatusHistory}
          showProgress={true}
        />
      );
      
      expect(screen.queryByText('Progress')).not.toBeInTheDocument();
    });

    it('shows cancelled icon in special display', () => {
      render(
        <RideStatusProgress 
          currentStatus={RideStatus.RIDE_CANCELLED}
          statusHistory={mockStatusHistory}
        />
      );
      
      const cancelledIcons = screen.getAllByTestId('x-circle-icon');
      expect(cancelledIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Status Progression Logic', () => {
    it('correctly identifies completed statuses', () => {
      const { container } = render(
        <RideStatusProgress 
          currentStatus={RideStatus.DRIVER_EN_ROUTE}
          statusHistory={mockStatusHistory}
        />
      );
      
      // Booking confirmed and driver assigned should be completed
      const completedSteps = container.querySelectorAll('.ride-status-progress__step--completed');
      expect(completedSteps.length).toBe(2);
    });

    it('handles status progression correctly for different current statuses', () => {
      const statuses = [
        RideStatus.BOOKING_CONFIRMED,
        RideStatus.DRIVER_ASSIGNED,
        RideStatus.DRIVER_EN_ROUTE,
        RideStatus.DRIVER_ARRIVED,
        RideStatus.RIDE_STARTED,
        RideStatus.RIDE_COMPLETED
      ];

      statuses.forEach(status => {
        const { container } = render(
          <RideStatusProgress 
            currentStatus={status}
            statusHistory={mockStatusHistory}
          />
        );
        
        const currentSteps = container.querySelectorAll('.ride-status-progress__step--current');
        expect(currentSteps).toHaveLength(1);
      });
    });
  });

  describe('Timestamp Formatting', () => {
    it('formats timestamps correctly', () => {
      const testDate = new Date('2024-01-01T14:30:00Z');
      Date.prototype.toLocaleTimeString.mockReturnValue('2:30 PM');
      
      render(
        <RideStatusProgress 
          currentStatus={RideStatus.DRIVER_ASSIGNED}
          statusHistory={[
            {
              status: RideStatus.DRIVER_ASSIGNED,
              timestamp: testDate
            }
          ]}
        />
      );
      
      expect(screen.getByText('2:30 PM')).toBeInTheDocument();
    });

    it('handles missing timestamps gracefully', () => {
      render(
        <RideStatusProgress 
          currentStatus={RideStatus.DRIVER_ASSIGNED}
          statusHistory={[
            {
              status: RideStatus.DRIVER_ASSIGNED,
              timestamp: null
            }
          ]}
        />
      );
      
      // Should not crash and should still render the component
      expect(screen.getByText('Driver Assigned')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<RideStatusProgress {...defaultProps} />);
      
      // Check for headings
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
    });

    it('provides meaningful text content for screen readers', () => {
      render(<RideStatusProgress {...defaultProps} />);
      
      expect(screen.getByText('Driver Assigned')).toBeInTheDocument();
      expect(screen.getByText('A driver has been assigned to your ride')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty status history', () => {
      render(
        <RideStatusProgress 
          currentStatus={RideStatus.DRIVER_ASSIGNED}
          statusHistory={[]}
        />
      );
      
      expect(screen.getByRole('heading', { level: 3, name: 'Driver Assigned' })).toBeInTheDocument();
    });

    it('handles undefined status history', () => {
      render(
        <RideStatusProgress 
          currentStatus={RideStatus.DRIVER_ASSIGNED}
          statusHistory={undefined}
        />
      );
      
      expect(screen.getByRole('heading', { level: 3, name: 'Driver Assigned' })).toBeInTheDocument();
    });

    it('handles invalid status in history', () => {
      render(
        <RideStatusProgress 
          currentStatus={RideStatus.DRIVER_ASSIGNED}
          statusHistory={[
            {
              status: 'invalid_status',
              timestamp: new Date()
            }
          ]}
        />
      );
      
      expect(screen.getByRole('heading', { level: 3, name: 'Driver Assigned' })).toBeInTheDocument();
    });
  });
});