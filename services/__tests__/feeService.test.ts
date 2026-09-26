import axios from 'axios';
import { feeService } from '@/services/feeService';
import { FeeEstimate } from '@/types/fee';

// Mock axios
jest.mock('axios');

const mockAxios = axios as jest.Mocked<typeof axios>;

const API_BASE_URL = 'http://localhost:3000';

// Mock environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_API_URL: API_BASE_URL,
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('feeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEstimatedFee', () => {
    it('should fetch fee estimate for transaction', async () => {
      const mockFee: FeeEstimate = {
        estimatedXLMCost: 0.5,
        baseFee: 0.0001,
        networkFee: 0.1,
        platformFee: 0.3889,
        totalAmount: 100.5,
        currency: 'USD',
        timestamp: new Date().toISOString(),
        estimationId: 'est_123',
      };

      mockAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: mockFee,
        },
      });

      const result = await feeService.getEstimatedFee(100, 'USD');

      expect(result).toEqual(mockFee);
      expect(mockAxios.get).toHaveBeenCalled();
    });

    it('should include amount and currency in request', async () => {
      const mockFee: FeeEstimate = {
        estimatedXLMCost: 1.0,
        baseFee: 0.0001,
        networkFee: 0.2,
        platformFee: 0.7899,
        totalAmount: 201.0,
        currency: 'EUR',
        timestamp: new Date().toISOString(),
      };

      mockAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: mockFee,
        },
      });

      await feeService.getEstimatedFee(200, 'EUR');

      const callArgs = mockAxios.get.mock.calls[0]!;
      expect(callArgs[0]).toContain('/api/wallet/fees/estimate');
      expect(callArgs[1]!.params.amount).toBe(200);
      expect(callArgs[1]!.params.currency).toBe('EUR');
    });

    it('should handle different amounts', async () => {
      const mockFee: FeeEstimate = {
        estimatedXLMCost: 0.05,
        baseFee: 0.0001,
        networkFee: 0.01,
        platformFee: 0.0399,
        totalAmount: 10.05,
        currency: 'USD',
        timestamp: new Date().toISOString(),
      };

      mockAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: mockFee,
        },
      });

      const result = await feeService.getEstimatedFee(10, 'USD');

      expect(result.totalAmount).toBe(10.05);
      expect(result.estimatedXLMCost).toBe(0.05);
    });

    it('should handle large amounts', async () => {
      const mockFee: FeeEstimate = {
        estimatedXLMCost: 50.0,
        baseFee: 0.0001,
        networkFee: 10.0,
        platformFee: 39.9899,
        totalAmount: 10050.0,
        currency: 'USD',
        timestamp: new Date().toISOString(),
      };

      mockAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: mockFee,
        },
      });

      const result = await feeService.getEstimatedFee(10000, 'USD');

      expect(result.totalAmount).toBe(10050.0);
    });

    it('should default to USD currency', async () => {
      const mockFee: FeeEstimate = {
        estimatedXLMCost: 0.5,
        baseFee: 0.0001,
        networkFee: 0.1,
        platformFee: 0.3889,
        totalAmount: 100.5,
        currency: 'USD',
        timestamp: new Date().toISOString(),
      };

      mockAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: mockFee,
        },
      });

      await feeService.getEstimatedFee(100);

      const callArgs = mockAxios.get.mock.calls[0]!;
      expect(callArgs[1]!.params.currency).toBe('USD');
    });

    it('should handle multiple currencies', async () => {
      const currencies = ['USD', 'EUR', 'GBP', 'ZAR'];

      for (const currency of currencies) {
        const mockFee: FeeEstimate = {
          estimatedXLMCost: 0.5,
          baseFee: 0.0001,
          networkFee: 0.1,
          platformFee: 0.3889,
          totalAmount: 100.5,
          currency,
          timestamp: new Date().toISOString(),
        };

        mockAxios.get.mockResolvedValueOnce({
          data: {
            success: true,
            data: mockFee,
          },
        });

        const result = await feeService.getEstimatedFee(100, currency);

        expect(result.currency).toBe(currency);
      }

      expect(mockAxios.get).toHaveBeenCalledTimes(4);
    });

    it('should include fee breakdown components', async () => {
      const mockFee: FeeEstimate = {
        estimatedXLMCost: 0.5,
        baseFee: 0.0001,
        networkFee: 0.1,
        platformFee: 0.3889,
        totalAmount: 100.5,
        currency: 'USD',
        timestamp: new Date().toISOString(),
      };

      mockAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: mockFee,
        },
      });

      const result = await feeService.getEstimatedFee(100, 'USD');

      expect(result.baseFee).toBeGreaterThan(0);
      expect(result.networkFee).toBeGreaterThan(0);
      expect(result.platformFee).toBeGreaterThan(0);
      expect(result.estimatedXLMCost).toBeGreaterThan(0);
    });

    it('should throw error on API failure', async () => {
      const errorMessage = 'Failed to estimate fees';
      mockAxios.get.mockResolvedValue({
        data: {
          success: false,
          error: errorMessage,
        },
      });

      await expect(
        feeService.getEstimatedFee(100, 'USD')
      ).rejects.toThrow(errorMessage);
    });

    it('should throw error on network failure', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(
        feeService.getEstimatedFee(100, 'USD')
      ).rejects.toThrow('Network error');
    });

    it('should throw error on 404 response', async () => {
      mockAxios.get.mockRejectedValue({
        response: { status: 404, data: { error: 'Not found' } },
      });

      await expect(
        feeService.getEstimatedFee(100, 'USD')
      ).rejects.toBeDefined();
    });

    it('should throw error on 500 response', async () => {
      mockAxios.get.mockRejectedValue({
        response: { status: 500, data: { error: 'Server error' } },
      });

      await expect(
        feeService.getEstimatedFee(100, 'USD')
      ).rejects.toBeDefined();
    });

    it('should construct correct API endpoint', async () => {
      const mockFee: FeeEstimate = {
        estimatedXLMCost: 0.5,
        baseFee: 0.0001,
        networkFee: 0.1,
        platformFee: 0.3889,
        totalAmount: 100.5,
        currency: 'USD',
        timestamp: new Date().toISOString(),
      };

      mockAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: mockFee,
        },
      });

      await feeService.getEstimatedFee(100, 'USD');

      expect(mockAxios.get).toHaveBeenCalled();
      const callUrl = mockAxios.get.mock.calls[0][0];
      expect(callUrl).toContain('/api/wallet/fees/estimate');
    });

    it('should include optional estimation ID', async () => {
      const mockFee: FeeEstimate = {
        estimatedXLMCost: 0.5,
        baseFee: 0.0001,
        networkFee: 0.1,
        platformFee: 0.3889,
        totalAmount: 100.5,
        currency: 'USD',
        timestamp: new Date().toISOString(),
        estimationId: 'est_abc123xyz',
      };

      mockAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: mockFee,
        },
      });

      const result = await feeService.getEstimatedFee(100, 'USD');

      expect(result.estimationId).toBe('est_abc123xyz');
    });

    it('should handle zero fees gracefully', async () => {
      const mockFee: FeeEstimate = {
        estimatedXLMCost: 0,
        baseFee: 0,
        networkFee: 0,
        platformFee: 0,
        totalAmount: 100,
        currency: 'USD',
        timestamp: new Date().toISOString(),
      };

      mockAxios.get.mockResolvedValue({
        data: {
          success: true,
          data: mockFee,
        },
      });

      const result = await feeService.getEstimatedFee(100, 'USD');

      expect(result.estimatedXLMCost).toBe(0);
      expect(result.totalAmount).toBe(100);
    });
  });
});
