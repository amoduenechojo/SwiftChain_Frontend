import axios from 'axios';
import {
  buildCheckoutQuote,
  formatXlm,
  insuranceService,
  toStroopPrecision,
} from '@/services/insuranceService';
import type { InsurancePlan } from '@/types/insurance';

jest.mock('axios');

const mockAxios = axios as jest.Mocked<typeof axios>;

const PLAN: InsurancePlan = {
  id: 'plan-basic',
  name: 'Basic Cover',
  description: 'Covers loss in transit.',
  coverageXlm: 1000,
  premiumXlm: 12.5,
};

describe('insuranceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // axios.isAxiosError is a type guard, not a request method, so it is not
    // auto-mocked into something useful — restore the real behaviour.
    (mockAxios.isAxiosError as unknown as jest.Mock).mockImplementation(
      (error: unknown) => !!(error as { isAxiosError?: boolean })?.isAxiosError
    );
  });

  describe('toStroopPrecision', () => {
    it('rounds to seven decimal places', () => {
      expect(toStroopPrecision(0.1 + 0.2)).toBe(0.3);
      expect(toStroopPrecision(1.123456789)).toBe(1.1234568);
    });

    it('leaves exact amounts untouched', () => {
      expect(toStroopPrecision(250)).toBe(250);
    });
  });

  describe('formatXlm', () => {
    it('appends the asset code and trims trailing zeros', () => {
      expect(formatXlm(250)).toBe('250 XLM');
      expect(formatXlm(12.5)).toBe('12.5 XLM');
      expect(formatXlm(0)).toBe('0 XLM');
    });
  });

  describe('buildCheckoutQuote', () => {
    it('adds the premium of the selected plan to the total', () => {
      expect(buildCheckoutQuote(250, PLAN)).toEqual({
        shipmentXlm: 250,
        premiumXlm: 12.5,
        totalXlm: 262.5,
        plan: PLAN,
      });
    });

    it('charges no premium when coverage is declined', () => {
      expect(buildCheckoutQuote(250, null)).toEqual({
        shipmentXlm: 250,
        premiumXlm: 0,
        totalXlm: 250,
        plan: null,
      });
    });

    it('rounds the total to stroop precision', () => {
      expect(buildCheckoutQuote(0.1, { ...PLAN, premiumXlm: 0.2 }).totalXlm).toBe(0.3);
    });

    it.each([0, -1, NaN, Infinity])('throws for a shipment amount of %p', (amount) => {
      expect(() => buildCheckoutQuote(amount, null)).toThrow(
        'Shipment amount must be a positive number'
      );
    });
  });

  describe('getPlans', () => {
    it('returns the plans available for a shipment', async () => {
      mockAxios.get.mockResolvedValue({ data: { success: true, data: [PLAN] } });

      await expect(insuranceService.getPlans('shipment-1')).resolves.toEqual([PLAN]);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/api/shipments/shipment-1/insurance-plans'
      );
    });

    it('returns an empty list when no coverage is offered', async () => {
      mockAxios.get.mockResolvedValue({ data: { success: true, data: [] } });

      await expect(insuranceService.getPlans('shipment-1')).resolves.toEqual([]);
    });

    it('rejects a missing shipment id without calling the API', async () => {
      await expect(insuranceService.getPlans('')).rejects.toThrow(
        'Shipment ID is required'
      );
      expect(mockAxios.get).not.toHaveBeenCalled();
    });

    it('surfaces an unsuccessful API response', async () => {
      mockAxios.get.mockResolvedValue({
        data: { success: false, error: 'Shipment not insurable' },
      });

      await expect(insuranceService.getPlans('shipment-1')).rejects.toThrow(
        'Shipment not insurable'
      );
    });

    it('surfaces the API error body on a request failure', async () => {
      mockAxios.get.mockRejectedValue({
        isAxiosError: true,
        response: { data: { error: 'Insurance service unavailable' } },
      });

      await expect(insuranceService.getPlans('shipment-1')).rejects.toThrow(
        'Insurance service unavailable'
      );
    });

    it('falls back to a generic message for an unrecognised failure', async () => {
      mockAxios.get.mockRejectedValue({ isAxiosError: true, response: undefined });

      await expect(insuranceService.getPlans('shipment-1')).rejects.toThrow(
        'Failed to load insurance plans'
      );
    });
  });

  describe('payWithEscrow', () => {
    const params = {
      shipmentId: 'shipment-1',
      walletAddress: 'GBWALLET',
      insurancePlanId: 'plan-basic',
      totalXlm: 262.5,
    };

    const receipt = {
      escrowId: 'escrow-1',
      transactionHash: 'hash-1',
      lockedXlm: 262.5,
      insurancePolicyId: 'policy-1',
    };

    it('posts the checkout and returns the receipt', async () => {
      mockAxios.post.mockResolvedValue({ data: { success: true, data: receipt } });

      await expect(insuranceService.payWithEscrow(params)).resolves.toEqual(receipt);
      expect(mockAxios.post).toHaveBeenCalledWith('/api/escrow/checkout', params);
    });

    it('rounds the submitted amount to stroop precision', async () => {
      mockAxios.post.mockResolvedValue({ data: { success: true, data: receipt } });

      await insuranceService.payWithEscrow({ ...params, totalXlm: 0.1 + 0.2 });

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/escrow/checkout',
        expect.objectContaining({ totalXlm: 0.3 })
      );
    });

    it('sends a null plan id when coverage was declined', async () => {
      mockAxios.post.mockResolvedValue({ data: { success: true, data: receipt } });

      await insuranceService.payWithEscrow({ ...params, insurancePlanId: null });

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/escrow/checkout',
        expect.objectContaining({ insurancePlanId: null })
      );
    });

    it.each([
      ['shipment id', { shipmentId: '' }, 'Shipment ID is required'],
      [
        'wallet address',
        { walletAddress: '' },
        'A connected wallet is required to fund the escrow',
      ],
      ['amount', { totalXlm: 0 }, 'Escrow amount must be a positive number'],
    ])('rejects a missing %s without calling the API', async (_label, override, message) => {
      await expect(
        insuranceService.payWithEscrow({ ...params, ...override })
      ).rejects.toThrow(message as string);
      expect(mockAxios.post).not.toHaveBeenCalled();
    });

    it('surfaces an unsuccessful API response', async () => {
      mockAxios.post.mockResolvedValue({
        data: { success: false, error: 'Insufficient XLM balance' },
      });

      await expect(insuranceService.payWithEscrow(params)).rejects.toThrow(
        'Insufficient XLM balance'
      );
    });

    it('surfaces a rejected wallet signature', async () => {
      mockAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: { data: { error: 'User declined the transaction' } },
      });

      await expect(insuranceService.payWithEscrow(params)).rejects.toThrow(
        'User declined the transaction'
      );
    });

    it('falls back to a generic message for a non-axios failure', async () => {
      mockAxios.post.mockRejectedValue('boom');

      await expect(insuranceService.payWithEscrow(params)).rejects.toThrow(
        'Escrow payment failed'
      );
    });
  });
});
