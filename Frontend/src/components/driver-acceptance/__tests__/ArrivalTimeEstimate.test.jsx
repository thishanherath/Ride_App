import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ArrivalTimeEstimate from '../ArrivalTimeEstimate';

// Mock the UI components
vi.mock('../../ui/Card', () => ({
  default: ({ children, className, ...props }) => (
    <div className={`card ${className || ''}`} {...props}>
      {children}
    </div>
  )
}));

vi.mock('../../ui/Button', () => ({
  default: ({ children, onClick, disabled, icon, className, ...props }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`button ${className || ''}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}));

vi.mock('../../ui/LoadingSpinner', () => ({
  default: ({ className, ...props }) => (
    <div className={`spinner ${className || ''}`} {...props} data-testid="loading-spinner">
      Loading...
    </div>
  )
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Clock: ({ className }) => <div className={`clock-icon ${className || ''}`} data-testid="clock-icon" />,
  RefreshCw: ({ className }) => <div className={`refresh-icon ${className || ''}`} data-testid="refresh-icon" />,
  MapPin: ({ className }) => <div className={`map-pin-icon ${className || ''}`} data-testid="map-pin-icon" />
}));

describe('ArrivalTimeEstimate', () => {
  let mockOnRefresh;

  beforeEach(() => {
    mockOnRefresh = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with estimated arrival time', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('Arriving in 5 minutes')).toBeInTheDocument();
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });

    it('renders with singular minute format', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={1}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('Arriving in 1 minute')).toBeInTheDocument();
    });

    it('renders "Arriving now" for zero minutes', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={0}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('Driver has arrived!')).toBeInTheDocument();
      expect(screen.getByText('Look for your driver')).toBeInTheDocument();
      expect(screen.getByTestId('map-pin-icon')).toBeInTheDocument();
    });

    it('renders "Less than 1 minute" for fractional minutes', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={0.5}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('Arriving in Less than 1 minute')).toBeInTheDocument();
    });

    it('renders fallback message for invalid time', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={null}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('Driver is on the way')).toBeInTheDocument();
      expect(screen.getByText('Arrival time will be updated shortly')).toBeInTheDocument();
    });

    it('renders fallback message for negative time', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={-5}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('Driver is on the way')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading state when updating', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          isUpdating={true}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('Calculating...')).toBeInTheDocument();
      expect(screen.getByText('Getting latest arrival time')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('disables refresh button when updating', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          isUpdating={true}
          onRefresh={mockOnRefresh}
        />
      );

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeDisabled();
      expect(screen.getByText('Updating...')).toBeInTheDocument();
    });
  });

  describe('Time Formatting', () => {
    it('rounds minutes to nearest integer', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={5.7}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('Arriving in 6 minutes')).toBeInTheDocument();
    });

    it('handles large arrival times', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={120}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('Arriving in 120 minutes')).toBeInTheDocument();
    });
  });

  describe('Last Updated Display', () => {
    it('shows "Just now" for recent updates', () => {
      const recentTime = new Date();
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          lastUpdated={recentTime}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('Updated Just now')).toBeInTheDocument();
    });

    it('shows minutes ago for older updates', () => {
      const oldTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          lastUpdated={oldTime}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('Updated 5 minutes ago')).toBeInTheDocument();
    });

    it('shows time format for updates over an hour ago', () => {
      const oldTime = new Date(Date.now() - 90 * 60 * 1000); // 90 minutes ago
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          lastUpdated={oldTime}
          onRefresh={mockOnRefresh}
        />
      );

      const timeString = oldTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      expect(screen.getByText(`Updated ${timeString}`)).toBeInTheDocument();
    });

    it('shows last updated in footer when not compact', () => {
      const updateTime = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          lastUpdated={updateTime}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('Last updated: 2 minutes ago')).toBeInTheDocument();
    });

    it('hides last updated footer in compact mode', () => {
      const updateTime = new Date(Date.now() - 2 * 60 * 1000);
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          lastUpdated={updateTime}
          compact={true}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.queryByText('Last updated: 2 minutes ago')).not.toBeInTheDocument();
    });
  });

  describe('Refresh Functionality', () => {
    it('calls onRefresh when refresh button is clicked', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          onRefresh={mockOnRefresh}
        />
      );

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });

    it('does not call onRefresh when updating', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          isUpdating={true}
          onRefresh={mockOnRefresh}
        />
      );

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      expect(mockOnRefresh).not.toHaveBeenCalled();
    });

    it('hides refresh button when onRefresh is not provided', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
        />
      );

      expect(screen.queryByRole('button', { name: /refresh/i })).not.toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('applies compact styling classes', () => {
      const { container } = render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          compact={true}
          onRefresh={mockOnRefresh}
        />
      );

      expect(container.querySelector('.arrival-time-estimate--compact')).toBeInTheDocument();
    });

    it('shows compact refresh button in compact mode', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          compact={true}
          onRefresh={mockOnRefresh}
        />
      );

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toHaveClass('arrival-time-estimate__compact-refresh');
    });
  });

  describe('Countdown Animation', () => {
    it('sets up countdown for reasonable arrival times', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          onRefresh={mockOnRefresh}
        />
      );

      // Initially shows 5 minutes
      expect(screen.getByText('Arriving in 5 minutes')).toBeInTheDocument();
      
      // Should have countdown animation class
      const mainText = screen.getByText('Arriving in 5 minutes');
      expect(mainText).toHaveClass('arrival-time-estimate__main-text--countdown');
    });

    it('shows arrived state for zero minutes', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={0}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('Driver has arrived!')).toBeInTheDocument();
      expect(screen.getByText('Look for your driver')).toBeInTheDocument();
      expect(screen.getByTestId('map-pin-icon')).toBeInTheDocument();
    });

    it('does not start countdown for very long times', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={120}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('Arriving in 120 minutes')).toBeInTheDocument();
      
      // Should not have countdown animation class for long times
      const mainText = screen.getByText('Arriving in 120 minutes');
      expect(mainText).not.toHaveClass('arrival-time-estimate__main-text--countdown');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for refresh button', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          onRefresh={mockOnRefresh}
        />
      );

      const refreshButton = screen.getByRole('button', { name: 'Refresh arrival time' });
      expect(refreshButton).toBeInTheDocument();
    });

    it('has proper ARIA labels for compact refresh button', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          compact={true}
          onRefresh={mockOnRefresh}
        />
      );

      const refreshButton = screen.getByRole('button', { name: 'Refresh arrival time' });
      expect(refreshButton).toBeInTheDocument();
    });

    it('includes loading spinner with proper accessibility attributes', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          isUpdating={true}
          onRefresh={mockOnRefresh}
        />
      );

      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('applies custom className', () => {
      const { container } = render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          className="custom-class"
          onRefresh={mockOnRefresh}
        />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('applies arrived state class when driver has arrived', () => {
      const { container } = render(
        <ArrivalTimeEstimate 
          estimatedArrival={0}
          onRefresh={mockOnRefresh}
        />
      );

      expect(container.querySelector('.arrival-time-estimate--arrived')).toBeInTheDocument();
    });

    it('applies countdown animation class for active countdown', () => {
      const { container } = render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          onRefresh={mockOnRefresh}
        />
      );

      expect(container.querySelector('.arrival-time-estimate__main-text--countdown')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined estimatedArrival', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={undefined}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('Driver is on the way')).toBeInTheDocument();
    });

    it('handles string estimatedArrival', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival="5"
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('Driver is on the way')).toBeInTheDocument();
    });

    it('handles very small positive numbers', () => {
      render(
        <ArrivalTimeEstimate 
          estimatedArrival={0.1}
          onRefresh={mockOnRefresh}
        />
      );

      expect(screen.getByText('Arriving in Less than 1 minute')).toBeInTheDocument();
    });

    it('cleans up intervals on unmount', () => {
      const { unmount } = render(
        <ArrivalTimeEstimate 
          estimatedArrival={5}
          onRefresh={mockOnRefresh}
        />
      );

      // Verify interval is set
      expect(vi.getTimerCount()).toBeGreaterThan(0);

      unmount();

      // Verify intervals are cleaned up
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});