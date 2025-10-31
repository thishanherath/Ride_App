import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import DriverProfileCard from '../DriverProfileCard';

// Mock the UI components
vi.mock('../../ui/Card', () => ({
  default: function MockCard({ children, className, ...props }) {
    return <div className={className} {...props}>{children}</div>;
  }
}));

vi.mock('../../ui/Button', () => ({
  default: function MockButton({ children, onClick, icon, className, ...props }) {
    return (
      <button className={className} onClick={onClick} {...props}>
        {icon && <span data-testid="button-icon">{icon}</span>}
        {children}
      </button>
    );
  }
}));

vi.mock('../../ui/Badge', () => ({
  default: function MockBadge({ children, className, ...props }) {
    return <span className={className} {...props}>{children}</span>;
  }
}));

vi.mock('../../RatingDisplay', () => ({
  default: function MockRatingDisplay({ rating, showNumber, size }) {
    return (
      <div data-testid="rating-display">
        Rating: {rating} (size: {size}, showNumber: {showNumber.toString()})
      </div>
    );
  }
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Phone: () => <span data-testid="phone-icon">📞</span>,
  MessageCircle: () => <span data-testid="message-icon">💬</span>,
  User: () => <span data-testid="user-icon">👤</span>
}));

describe('DriverProfileCard', () => {
  const mockDriver = {
    id: 'driver-123',
    name: 'John Doe',
    photo: 'https://example.com/photo.jpg',
    rating: 4.8,
    totalRides: 1250,
    phoneNumber: '+1234567890'
  };

  const mockOnCall = vi.fn();
  const mockOnMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Driver Profile Display', () => {
    it('renders driver profile with photo, name, and rating', () => {
      render(<DriverProfileCard driver={mockDriver} />);

      // Check driver name
      expect(screen.getByText('John Doe')).toBeInTheDocument();

      // Check driver photo
      const photo = screen.getByAltText("John Doe's profile");
      expect(photo).toBeInTheDocument();
      expect(photo).toHaveAttribute('src', 'https://example.com/photo.jpg');

      // Check rating display
      expect(screen.getByTestId('rating-display')).toBeInTheDocument();
      expect(screen.getByText(/Rating: 4.8/)).toBeInTheDocument();
    });

    it('displays total rides completed badge', () => {
      render(<DriverProfileCard driver={mockDriver} />);

      expect(screen.getByText('1,250 rides completed')).toBeInTheDocument();
    });

    it('shows fallback avatar when photo is not provided', () => {
      const driverWithoutPhoto = { ...mockDriver, photo: null };
      render(<DriverProfileCard driver={driverWithoutPhoto} />);

      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
      expect(screen.queryByAltText("John Doe's profile")).not.toBeInTheDocument();
    });

    it('handles missing driver name gracefully', () => {
      const driverWithoutName = { ...mockDriver, name: null };
      render(<DriverProfileCard driver={driverWithoutName} />);

      expect(screen.getByText('Driver')).toBeInTheDocument();
    });

    it('handles zero rating and rides', () => {
      const newDriver = { ...mockDriver, rating: 0, totalRides: 0 };
      render(<DriverProfileCard driver={newDriver} />);

      expect(screen.getByText(/Rating: 0/)).toBeInTheDocument();
      expect(screen.getByText('0 rides completed')).toBeInTheDocument();
    });
  });

  describe('Contact Functionality', () => {
    it('renders call and message buttons when callbacks are provided', () => {
      render(
        <DriverProfileCard 
          driver={mockDriver} 
          onCall={mockOnCall}
          onMessage={mockOnMessage}
        />
      );

      expect(screen.getByText('Call')).toBeInTheDocument();
      expect(screen.getByText('Message')).toBeInTheDocument();
      expect(screen.getByTestId('phone-icon')).toBeInTheDocument();
      expect(screen.getByTestId('message-icon')).toBeInTheDocument();
    });

    it('calls onCall with phone number and driver when call button is clicked', () => {
      render(
        <DriverProfileCard 
          driver={mockDriver} 
          onCall={mockOnCall}
          onMessage={mockOnMessage}
        />
      );

      fireEvent.click(screen.getByText('Call'));
      expect(mockOnCall).toHaveBeenCalledWith('+1234567890', mockDriver);
    });

    it('calls onMessage with driver when message button is clicked', () => {
      render(
        <DriverProfileCard 
          driver={mockDriver} 
          onCall={mockOnCall}
          onMessage={mockOnMessage}
        />
      );

      fireEvent.click(screen.getByText('Message'));
      expect(mockOnMessage).toHaveBeenCalledWith(mockDriver);
    });

    it('does not render contact buttons when callbacks are not provided', () => {
      render(<DriverProfileCard driver={mockDriver} />);

      expect(screen.queryByText('Call')).not.toBeInTheDocument();
      expect(screen.queryByText('Message')).not.toBeInTheDocument();
    });

    it('does not render call button when phone number is missing', () => {
      const driverWithoutPhone = { ...mockDriver, phoneNumber: null };
      render(
        <DriverProfileCard 
          driver={driverWithoutPhone} 
          onCall={mockOnCall}
          onMessage={mockOnMessage}
        />
      );

      expect(screen.queryByText('Call')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Message John Doe')).toBeInTheDocument();
    });

    it('does not call onCall when phone number is missing', () => {
      const driverWithoutPhone = { ...mockDriver, phoneNumber: null };
      render(
        <DriverProfileCard 
          driver={driverWithoutPhone} 
          onCall={mockOnCall}
        />
      );

      // Should not render call button at all
      expect(screen.queryByText('Call')).not.toBeInTheDocument();
      expect(mockOnCall).not.toHaveBeenCalled();
    });
  });

  describe('Compact Mode', () => {
    it('applies compact styling when compact prop is true', () => {
      const { container } = render(
        <DriverProfileCard 
          driver={mockDriver} 
          compact={true}
          onCall={mockOnCall}
          onMessage={mockOnMessage}
        />
      );

      expect(container.firstChild).toHaveClass('driver-profile-card--compact');
    });

    it('renders compact contact actions when compact is true', () => {
      render(
        <DriverProfileCard 
          driver={mockDriver} 
          compact={true}
          onCall={mockOnCall}
          onMessage={mockOnMessage}
        />
      );

      // In compact mode, buttons should have aria-labels but no text
      expect(screen.getByLabelText('Call John Doe')).toBeInTheDocument();
      expect(screen.getByLabelText('Message John Doe')).toBeInTheDocument();
      
      // Should not have text content in compact mode (only icons)
      const callButton = screen.getByLabelText('Call John Doe');
      const messageButton = screen.getByLabelText('Message John Doe');
      
      expect(callButton).not.toHaveTextContent('Call');
      expect(messageButton).not.toHaveTextContent('Message');
    });
  });

  describe('Loading State', () => {
    it('renders loading skeleton when driver is null', () => {
      const { container } = render(<DriverProfileCard driver={null} />);

      expect(container.firstChild).toHaveClass('driver-profile-card--loading');
      expect(container.querySelector('.driver-profile-card__avatar--skeleton')).toBeInTheDocument();
      expect(container.querySelector('.driver-profile-card__name--skeleton')).toBeInTheDocument();
      expect(container.querySelector('.driver-profile-card__rating--skeleton')).toBeInTheDocument();
      expect(container.querySelector('.driver-profile-card__rides--skeleton')).toBeInTheDocument();
    });

    it('renders loading skeleton when driver is undefined', () => {
      const { container } = render(<DriverProfileCard driver={undefined} />);

      expect(container.firstChild).toHaveClass('driver-profile-card--loading');
    });
  });

  describe('Image Error Handling', () => {
    it('shows fallback avatar when image fails to load', async () => {
      render(<DriverProfileCard driver={mockDriver} />);

      const image = screen.getByAltText("John Doe's profile");
      
      // Simulate image load error
      fireEvent.error(image);

      await waitFor(() => {
        expect(image.style.display).toBe('none');
      });

      // Fallback should be visible
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper aria-labels for contact buttons', () => {
      render(
        <DriverProfileCard 
          driver={mockDriver} 
          onCall={mockOnCall}
          onMessage={mockOnMessage}
        />
      );

      expect(screen.getByLabelText('Call John Doe')).toBeInTheDocument();
      expect(screen.getByLabelText('Message John Doe')).toBeInTheDocument();
    });

    it('provides proper alt text for driver photo', () => {
      render(<DriverProfileCard driver={mockDriver} />);

      expect(screen.getByAltText("John Doe's profile")).toBeInTheDocument();
    });

    it('handles missing driver name in aria-labels', () => {
      const driverWithoutName = { ...mockDriver, name: null };
      render(
        <DriverProfileCard 
          driver={driverWithoutName} 
          onCall={mockOnCall}
          onMessage={mockOnMessage}
        />
      );

      expect(screen.getByLabelText('Call Driver')).toBeInTheDocument();
      expect(screen.getByLabelText('Message Driver')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <DriverProfileCard 
          driver={mockDriver} 
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('combines compact and custom classes', () => {
      const { container } = render(
        <DriverProfileCard 
          driver={mockDriver} 
          compact={true}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('driver-profile-card--compact');
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Rating Display Integration', () => {
    it('passes correct props to RatingDisplay component', () => {
      render(<DriverProfileCard driver={mockDriver} />);

      const ratingDisplay = screen.getByTestId('rating-display');
      expect(ratingDisplay).toHaveTextContent('Rating: 4.8 (size: sm, showNumber: true)');
    });

    it('handles zero rating in RatingDisplay', () => {
      const driverWithZeroRating = { ...mockDriver, rating: 0 };
      render(<DriverProfileCard driver={driverWithZeroRating} />);

      const ratingDisplay = screen.getByTestId('rating-display');
      expect(ratingDisplay).toHaveTextContent('Rating: 0');
    });
  });

  describe('Number Formatting', () => {
    it('formats large ride numbers with commas', () => {
      const driverWithManyRides = { ...mockDriver, totalRides: 12345 };
      render(<DriverProfileCard driver={driverWithManyRides} />);

      expect(screen.getByText('12,345 rides completed')).toBeInTheDocument();
    });

    it('handles single digit ride numbers', () => {
      const newDriver = { ...mockDriver, totalRides: 5 };
      render(<DriverProfileCard driver={newDriver} />);

      expect(screen.getByText('5 rides completed')).toBeInTheDocument();
    });
  });
});