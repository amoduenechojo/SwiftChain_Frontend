import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/** Cargo categories a driver can filter the marketplace by. */
export type CargoType =
  | 'general'
  | 'fragile'
  | 'perishable'
  | 'hazardous'
  | 'oversized'
  | 'refrigerated';

export const CARGO_TYPES: CargoType[] = [
  'general',
  'fragile',
  'perishable',
  'hazardous',
  'oversized',
  'refrigerated',
];

export interface DeliveryJob {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  packageDescription: string;
  estimatedDistance: number; // km
  estimatedEarnings: number; // XLM
  region: string;
  /** Optional until the backend backfills historical jobs. */
  cargoType?: CargoType;
  createdAt: string;
  status: 'unassigned' | 'assigned' | 'in_progress' | 'delivered';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * driverJobService — responsible for all driver job-related API communication.
 * Follows the Strict Layered Architecture: Component -> Hook -> Service.
 */
export const driverJobService = {
  /**
   * Fetch all unassigned deliveries available in the driver's region.
   */
  async getAvailableJobs(region?: string): Promise<ApiResponse<DeliveryJob[]>> {
    const params = region ? { region } : {};
    const { data } = await axios.get<ApiResponse<DeliveryJob[]>>(
      `${API_BASE_URL}/api/driver/jobs`,
      { params }
    );
    return data;
  },

  /**
   * Accept a delivery job — assigns it to the authenticated driver.
   */
  async acceptJob(jobId: string): Promise<ApiResponse<DeliveryJob>> {
    const { data } = await axios.post<ApiResponse<DeliveryJob>>(
      `${API_BASE_URL}/api/driver/jobs/${jobId}/accept`
    );
    return data;
  },
};