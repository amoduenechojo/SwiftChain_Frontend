import type { DeliveryStatus } from './filters';

export interface DriverInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  rating?: number;
}

import type { EscrowStatus } from './status';

export interface Delivery {
  id: string;
  trackingNumber: string;
  senderId: string;
  driverId?: string;
  driver?: DriverInfo;
  status: 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  origin: string;
  destination: string;
  landmark?: string | null;
  escrowStatus: EscrowStatus;
  amount: number;
  currency?: string;
  packageDescription?: string;
  weight?: number;
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface StatusEvent {
  id: string;
  deliveryId: string;
  status: DeliveryStatus;
  timestamp: string;
  description?: string;
}

export interface StatusTimeline {
  deliveryId: string;
  events: StatusEvent[];
}
