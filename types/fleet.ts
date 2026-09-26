export type DriverStatus = 'active' | 'idle' | 'offline' | 'on_delivery';

export interface DriverLocation {
  lat: number;
  lng: number;
  updatedAt: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehiclePlate: string;
  status: DriverStatus;
  rating: number;
  activeDeliveries: number;
  completedDeliveries: number;
  location: DriverLocation;
  trustScore?: number;
}

export interface FleetSummary {
  totalDrivers: number;
  activeDrivers: number;
  onDelivery: number;
  idle: number;
  offline: number;
}

export interface FleetResponse {
  drivers: Driver[];
  summary: FleetSummary;
}
