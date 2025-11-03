import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DriverVehicleDetails from '../DriverVehicleDetails';

// Mock vehicle data for testing
const mockVehicle = {
  id: 'vehicle-123',
  make: 'Toyota',
  model: 'Camry',
  color: 'Blue',
  licensePlate: 'ABC123',
  type: 'sedan',
  year: 2022,
  capacity: 4
};

const mockVehicleMinimal = {
  id: 'vehicle-456',
  make: 'Honda',
  model: 'Civic',
  color: 'Red',
  licensePlate: 'XYZ789',
  type: 'hatchback'
};

describe('DriverVehicleDetails Component', () => {
  describe('Rendering with complete vehicle data', () => {
    test('renders vehicle information correctly', () => {
      render(<DriverVehicleDetails vehicle={mockVehicle} />);
      
      // Check title
      expect(screen.getByText('Your Vehicle')).toBeInTheDocument();
      
      // Check license plate
      expect(screen.getByText('ABC123')).toBeInTheDocument();
      expect(screen.getByText('License Plate')).toBeInTheDocument();
      
      // Check vehicle details
      expect(screen.getByText('2022 Toyota Camry')).toBeInTheDocument();
      expect(screen.getByText('Blue')).toBeInTheDocument();
      expect(screen.getByText('4 passengers')).toBeInTheDocument();
    });

    test('displays vehicle type badge', () => {
      render(<DriverVehicleDetails vehicle={mockVehicle} />);
      
      // Check for vehicle type badge (sedan should show sedan text since it's not mapped to "car")
      expect(screen.getByText('sedan')).toBeInTheDocument();
    });

    test('shows helper text for identification', () => {
      render(<DriverVehicleDetails vehicle={mockVehicle} />);
      
      expect(screen.getByText('Look for this license plate to identify your ride')).toBeInTheDocument();
    });

    test('displays color dot with correct styling', () => {
      render(<DriverVehicleDetails vehicle={mockVehicle} />);
      
      const colorDot = document.querySelector('.driver-vehicle-details__color-dot');
      expect(colorDot).toBeInTheDocument();
      expect(colorDot).toHaveStyle('background-color: rgb(0, 0, 255)');
    });
  });

  describe('Rendering with minimal vehicle data', () => {
    test('renders without optional fields', () => {
      render(<DriverVehicleDetails vehicle={mockVehicleMinimal} />);
      
      // Should show basic info
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
      expect(screen.getByText('XYZ789')).toBeInTheDocument();
      expect(screen.getByText('Red')).toBeInTheDocument();
      
      // Should not show capacity since it's not provided
      expect(screen.queryByText(/passengers/)).not.toBeInTheDocument();
    });

    test('handles missing year in vehicle name formatting', () => {
      render(<DriverVehicleDetails vehicle={mockVehicleMinimal} />);
      
      // Should show make and model without year
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
    });
  });

  describe('Vehicle type handling', () => {
    test('displays correct icon for sedan', () => {
      render(<DriverVehicleDetails vehicle={{ ...mockVehicle, type: 'sedan' }} />);
      
      const vehicleIcon = screen.getByRole('img', { name: /sedan vehicle/ });
      expect(vehicleIcon).toBeInTheDocument();
    });

    test('displays correct icon for SUV', () => {
      render(<DriverVehicleDetails vehicle={{ ...mockVehicle, type: 'suv' }} />);
      
      const vehicleIcon = screen.getByRole('img', { name: /suv vehicle/ });
      expect(vehicleIcon).toBeInTheDocument();
    });

    test('falls back to default icon for unknown type', () => {
      render(<DriverVehicleDetails vehicle={{ ...mockVehicle, type: 'unknown' }} />);
      
      const vehicleIcon = screen.getByRole('img', { name: /unknown vehicle/ });
      expect(vehicleIcon).toBeInTheDocument();
    });
  });

  describe('Compact variant', () => {
    test('applies compact styling when compact prop is true', () => {
      render(<DriverVehicleDetails vehicle={mockVehicle} compact />);
      
      const component = document.querySelector('.driver-vehicle-details');
      expect(component).toHaveClass('driver-vehicle-details--compact');
    });

    test('does not apply compact styling by default', () => {
      render(<DriverVehicleDetails vehicle={mockVehicle} />);
      
      const component = document.querySelector('.driver-vehicle-details');
      expect(component).not.toHaveClass('driver-vehicle-details--compact');
    });
  });

  describe('Loading state', () => {
    test('renders loading placeholders when vehicle is null', () => {
      render(<DriverVehicleDetails vehicle={null} />);
      
      const component = document.querySelector('.driver-vehicle-details');
      expect(component).toHaveClass('driver-vehicle-details--loading');
      
      // Check for placeholder elements
      expect(document.querySelector('.driver-vehicle-details__icon-placeholder')).toBeInTheDocument();
      expect(document.querySelector('.driver-vehicle-details__title-placeholder')).toBeInTheDocument();
      expect(document.querySelector('.driver-vehicle-details__license-placeholder')).toBeInTheDocument();
      expect(document.querySelector('.driver-vehicle-details__info-placeholder')).toBeInTheDocument();
    });

    test('renders loading placeholders when vehicle is undefined', () => {
      render(<DriverVehicleDetails />);
      
      const component = document.querySelector('.driver-vehicle-details');
      expect(component).toHaveClass('driver-vehicle-details--loading');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels for license plate', () => {
      render(<DriverVehicleDetails vehicle={mockVehicle} />);
      
      const licensePlate = screen.getByRole('text', { name: 'License plate ABC123' });
      expect(licensePlate).toBeInTheDocument();
    });

    test('has proper alt text for vehicle icon', () => {
      render(<DriverVehicleDetails vehicle={mockVehicle} />);
      
      const vehicleIcon = screen.getByRole('img', { name: 'sedan vehicle' });
      expect(vehicleIcon).toBeInTheDocument();
    });

    test('has proper structure for screen readers', () => {
      render(<DriverVehicleDetails vehicle={mockVehicle} />);
      
      // Check for proper heading structure
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveTextContent('Your Vehicle');
    });
  });

  describe('Custom props and styling', () => {
    test('applies custom className', () => {
      render(<DriverVehicleDetails vehicle={mockVehicle} className="custom-class" />);
      
      const component = document.querySelector('.driver-vehicle-details');
      expect(component).toHaveClass('custom-class');
    });

    test('forwards additional props to Card component', () => {
      render(<DriverVehicleDetails vehicle={mockVehicle} data-testid="vehicle-details" />);
      
      expect(screen.getByTestId('vehicle-details')).toBeInTheDocument();
    });
  });

  describe('Data formatting', () => {
    test('formats vehicle name with year, make, and model', () => {
      render(<DriverVehicleDetails vehicle={mockVehicle} />);
      
      expect(screen.getByText('2022 Toyota Camry')).toBeInTheDocument();
    });

    test('formats vehicle name without year when not provided', () => {
      const vehicleWithoutYear = { ...mockVehicle, year: undefined };
      render(<DriverVehicleDetails vehicle={vehicleWithoutYear} />);
      
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    });

    test('handles empty vehicle name parts gracefully', () => {
      const minimalVehicle = {
        ...mockVehicle,
        make: '',
        model: 'Model Only',
        year: undefined
      };
      render(<DriverVehicleDetails vehicle={minimalVehicle} />);
      
      expect(screen.getByText('Model Only')).toBeInTheDocument();
    });

    test('formats license plate in uppercase', () => {
      const vehicleWithLowercase = { ...mockVehicle, licensePlate: 'abc123' };
      render(<DriverVehicleDetails vehicle={vehicleWithLowercase} />);
      
      // License plate should be displayed in uppercase
      expect(screen.getByText('ABC123')).toBeInTheDocument();
    });

    test('displays capacity correctly when provided', () => {
      render(<DriverVehicleDetails vehicle={mockVehicle} />);
      
      expect(screen.getByText('4 passengers')).toBeInTheDocument();
    });

    test('does not display capacity when not provided', () => {
      const vehicleWithoutCapacity = { ...mockVehicle, capacity: undefined };
      render(<DriverVehicleDetails vehicle={vehicleWithoutCapacity} />);
      
      expect(screen.queryByText(/passengers/)).not.toBeInTheDocument();
    });
  });

  describe('Color handling', () => {
    test('displays color name correctly', () => {
      render(<DriverVehicleDetails vehicle={mockVehicle} />);
      
      expect(screen.getByText('Blue')).toBeInTheDocument();
    });

    test('applies color to color dot', () => {
      render(<DriverVehicleDetails vehicle={mockVehicle} />);
      
      const colorDot = document.querySelector('.driver-vehicle-details__color-dot');
      expect(colorDot).toHaveStyle('background-color: rgb(0, 0, 255)');
    });

    test('handles different color formats', () => {
      const vehicleWithHexColor = { ...mockVehicle, color: '#FF0000' };
      render(<DriverVehicleDetails vehicle={vehicleWithHexColor} />);
      
      expect(screen.getByText('#FF0000')).toBeInTheDocument();
      
      const colorDot = document.querySelector('.driver-vehicle-details__color-dot');
      expect(colorDot).toHaveStyle('background-color: #FF0000');
    });
  });
});