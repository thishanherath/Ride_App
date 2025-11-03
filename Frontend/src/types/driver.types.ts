/**
 * Driver-related TypeScript interfaces and types
 * Used for driver acceptance progress feature
 */

export interface Driver {
  id: string;
  name: string;
  photo: string;
  rating: number;
  totalRides: number;
  phoneNumber: string;
  isOnline: boolean;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  color: string;
  licensePlate: string;
  type: 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'wagon';
  year: number;
  capacity: number;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface RideAcceptance {
  rideId: string;
  driverId: string;
  acceptedAt: Date;
  estimatedArrival: number; // in minutes
  status: RideStatus;
  vehicle: Vehicle;
  driver: Driver;
  pickupLocation: Location;
  destinationLocation: Location;
}

export enum RideStatus {
  BOOKING_CONFIRMED = 'booking_confirmed',
  DRIVER_ASSIGNED = 'driver_assigned',
  DRIVER_EN_ROUTE = 'driver_en_route',
  DRIVER_ARRIVED = 'driver_arrived',
  RIDE_STARTED = 'ride_started',
  RIDE_COMPLETED = 'ride_completed',
  RIDE_CANCELLED = 'ride_cancelled'
}

// State management types for driver acceptance flow
export interface DriverAcceptanceState {
  isLoading: boolean;
  error: string | null;
  rideAcceptance: RideAcceptance | null;
  estimatedArrival: number | null;
  lastUpdated: Date | null;
  isUpdatingArrival: boolean;
}

export interface DriverAcceptanceActions {
  setDriverAcceptance: (acceptance: RideAcceptance) => void;
  updateEstimatedArrival: (minutes: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearDriverAcceptance: () => void;
  refreshArrivalTime: () => Promise<void>;
}

// Component prop types
export interface DriverAcceptedStatusProps {
  driverName: string;
  acceptedAt: Date;
  showAnimation?: boolean;
  onAnimationComplete?: () => void;
}

export interface DriverVehicleDetailsProps {
  vehicle: Vehicle;
  compact?: boolean;
}

export interface DriverProfileCardProps {
  driver: Driver;
  onCall?: () => void;
  onMessage?: () => void;
}

export interface ArrivalTimeEstimateProps {
  estimatedArrival: number; // minutes
  isUpdating: boolean;
  lastUpdated: Date;
  onRefresh?: () => void;
}

export interface RideStatusProgressProps {
  currentStatus: RideStatus;
  statusHistory: Array<{
    status: RideStatus;
    timestamp: Date;
  }>;
  nextStep?: string;
  showProgress?: boolean;
}

export interface RideActionPanelProps {
  rideId: string;
  driverId: string;
  canCancel: boolean;
  cancellationFee?: number;
  onCancel: () => void;
  onCall: () => void;
  onMessage: () => void;
}