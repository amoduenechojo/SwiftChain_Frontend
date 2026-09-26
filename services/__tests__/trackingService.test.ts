/**
 * Tracking Service Tests
 * Unit tests for route tracking API integration
 */

jest.mock('axios');
import axios from 'axios';
import {
  getDeliveryRoute,
  getCurrentLocation,
  calculateRoute,
} from '@/services/trackingService';
import { RouteData } from '@/types/tracking';

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Provide a simple isAxiosError implementation on the mocked axios. The real
// export is a type guard, so the stub is cast back to its declared signature.
(mockedAxios.isAxiosError as unknown as jest.Mock).mockImplementation(
  (error: any) => error && error.isAxiosError === true,
);

describe('trackingService', () => {
  const mockDeliveryId = 'delivery-123';
  const mockCoordinate = { latitude: 6.5244, longitude: 3.3792 };

  const mockRouteData: RouteData = {
    deliveryId: mockDeliveryId,
    origin: { latitude: 6.5244, longitude: 3.3792 },
    destination: { latitude: 6.6263, longitude: 3.2863 },
    waypoints: [
      {
        coordinate: { latitude: 6.5244, longitude: 3.3792 },
        label: 'Pickup',
        type: 'origin',
      },
      {
        coordinate: { latitude: 6.6263, longitude: 3.2863 },
        label: 'Delivery',
        type: 'destination',
      },
    ],
    distance: 12.5,
    estimatedTime: 25,
    currentLocation: { latitude: 6.5500, longitude: 3.3500 },
    status: 'in_transit',
    timestamp: '2026-05-29T10:30:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDeliveryRoute', () => {
    it('should fetch route data successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockRouteData,
        },
      });

      const result = await getDeliveryRoute(mockDeliveryId);

      expect(result).toEqual(mockRouteData);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `http://localhost:3000/api/deliveries/${mockDeliveryId}/route`,
        expect.any(Object)
      );
    });

    it('should throw error for missing delivery ID', async () => {
      await expect(getDeliveryRoute('')).rejects.toThrow('Delivery ID is required');
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should throw error when delivery not found (404)', async () => {
      const error: any = new Error('Not found');
      error.response = { status: 404 };
      error.isAxiosError = true;
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(getDeliveryRoute(mockDeliveryId)).rejects.toThrow(
        `Delivery not found: ${mockDeliveryId}`
      );
    });

    it('should throw error for unauthorized access (403)', async () => {
      const error: any = new Error('Forbidden');
      error.response = { status: 403 };
      error.isAxiosError = true;
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(getDeliveryRoute(mockDeliveryId)).rejects.toThrow(
        'Unauthorized to access this delivery'
      );
    });

    it('should throw error on API failure', async () => {
      const error: any = new Error('Server error');
      error.response = {
        status: 500,
        data: { error: 'Server error' },
      };
      error.isAxiosError = true;
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(getDeliveryRoute(mockDeliveryId)).rejects.toThrow('Server error');
    });

    it('should throw error on request timeout', async () => {
      const error: any = new Error('Request timeout');
      error.code = 'ECONNABORTED';
      error.isAxiosError = true;
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(getDeliveryRoute(mockDeliveryId)).rejects.toThrow(
        'Request timeout - unable to fetch route'
      );
    });

    it('should handle API response with error flag', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: false,
          error: 'Route calculation failed',
        },
      });

      await expect(getDeliveryRoute(mockDeliveryId)).rejects.toThrow(
        'Route calculation failed'
      );
    });

    it('should include proper headers in request', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockRouteData,
        },
      });

      await getDeliveryRoute(mockDeliveryId);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should set request timeout', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockRouteData,
        },
      });

      await getDeliveryRoute(mockDeliveryId);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          timeout: 10000,
        })
      );
    });
  });

  describe('getCurrentLocation', () => {
    it('should fetch current location successfully', async () => {
      const mockLocation = { latitude: 6.5500, longitude: 3.3500 };

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockLocation,
        },
      });

      const result = await getCurrentLocation(mockDeliveryId);

      expect(result).toEqual(mockLocation);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `http://localhost:3000/api/deliveries/${mockDeliveryId}/location`,
        expect.any(Object)
      );
    });

    it('should throw error for missing delivery ID', async () => {
      await expect(getCurrentLocation('')).rejects.toThrow('Delivery ID is required');
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should throw error on API failure', async () => {
      const error: any = new Error('Location error');
      error.response = {
        data: { error: 'Location unavailable' },
      };
      error.isAxiosError = true;
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(getCurrentLocation(mockDeliveryId)).rejects.toThrow(
        'Location unavailable'
      );
    });

    it('should handle network errors gracefully', async () => {
      const error: any = new Error('Network error');
      error.response = {
        data: { error: 'Network error' },
      };
      error.isAxiosError = true;
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(getCurrentLocation(mockDeliveryId)).rejects.toThrow('Network error');
    });

    it('should return valid coordinates', async () => {
      const mockLocation = { latitude: 40.7128, longitude: -74.006 };

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockLocation,
        },
      });

      const result = await getCurrentLocation(mockDeliveryId);

      expect(result.latitude).toBe(40.7128);
      expect(result.longitude).toBe(-74.006);
    });
  });

  describe('calculateRoute', () => {
    const origin = { latitude: 6.5244, longitude: 3.3792 };
    const destination = { latitude: 6.6263, longitude: 3.2863 };

    it('should calculate route successfully', async () => {
      const mockWaypoints = [
        { latitude: 6.5244, longitude: 3.3792 },
        { latitude: 6.5500, longitude: 3.3500 },
        { latitude: 6.6263, longitude: 3.2863 },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: { waypoints: mockWaypoints },
        },
      });

      const result = await calculateRoute(origin, destination);

      expect(result).toEqual(mockWaypoints);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/routes/calculate',
        expect.objectContaining({
          params: {
            origin_lat: origin.latitude,
            origin_lng: origin.longitude,
            dest_lat: destination.latitude,
            dest_lng: destination.longitude,
          },
        })
      );
    });

    it('should throw error when origin is missing', async () => {
      await expect(calculateRoute(null as any, destination)).rejects.toThrow(
        'Origin and destination coordinates are required'
      );
    });

    it('should throw error when destination is missing', async () => {
      await expect(calculateRoute(origin, null as any)).rejects.toThrow(
        'Origin and destination coordinates are required'
      );
    });

    it('should throw error on route calculation failure', async () => {
      const error: any = new Error('Route error');
      error.response = {
        data: { error: 'Route not available' },
      };
      error.isAxiosError = true;
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(calculateRoute(origin, destination)).rejects.toThrow(
        'Route not available'
      );
    });

    it('should handle API response with error flag', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: false,
          error: 'Waypoint calculation failed',
        },
      });

      await expect(calculateRoute(origin, destination)).rejects.toThrow(
        'Waypoint calculation failed'
      );
    });

    it('should return empty array when no waypoints found', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: { waypoints: [] },
        },
      });

      const result = await calculateRoute(origin, destination);

      expect(result).toEqual([]);
    });

    it('should pass correct query parameters', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: { waypoints: [] },
        },
      });

      await calculateRoute(origin, destination);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            origin_lat: 6.5244,
            origin_lng: 3.3792,
            dest_lat: 6.6263,
            dest_lng: 3.2863,
          }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle non-Axios errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Unknown error'));

      await expect(getDeliveryRoute(mockDeliveryId)).rejects.toThrow('Unknown error');
    });

    it('should provide meaningful error messages', async () => {
      const error: any = new Error('Invalid error');
      error.response = {
        status: 400,
        data: { error: 'Invalid delivery ID format' },
      };
      error.isAxiosError = true;
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(getDeliveryRoute(mockDeliveryId)).rejects.toThrow(
        'Invalid delivery ID format'
      );
    });
  });
});
