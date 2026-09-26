import { renderHook, act, waitFor } from '@testing-library/react';
import axios from 'axios';
import { useTrustBar } from '@/hooks/useTrustBar';
import { trustBarService } from '@/services/trustBarService';
import type { TrustBarResponse } from '@/types/trustBar';

jest.mock('@/services/trustBarService', () => ({
  trustBarService: {
    getTrustBarData: jest.fn(),
  },
}));

const mockTrustBarData: TrustBarResponse = {
  header: 'Securing transactions',
  networks: [
    { id: 'ethereum', name: 'Ethereum', logoSvg: '<svg></svg>' },
    { id: 'solana', name: 'Solana', logoSvg: '<svg></svg>' },
    { id: 'polygon', name: 'Polygon', logoSvg: '<svg></svg>' },
    { id: 'arbitrum', name: 'Arbitrum', logoSvg: '<svg></svg>' },
    { id: 'optimism', name: 'Optimism', logoSvg: '<svg></svg>' },
  ],
  stats: [
    { id: 'tps', label: 'Network Speed', value: '10,000+ TPS', subtext: 'Sub-second finality' },
  ],
};

describe('useTrustBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads trust bar data from service successfully', async () => {
    (trustBarService.getTrustBarData as jest.Mock).mockResolvedValueOnce(
      mockTrustBarData,
    );

    const { result } = renderHook(() => useTrustBar());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(trustBarService.getTrustBarData).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockTrustBarData);
    expect(result.current.error).toBeNull();
  });

  it('handles service failure and sets error message', async () => {
    (trustBarService.getTrustBarData as jest.Mock).mockRejectedValueOnce(
      new Error('API error'),
    );

    const { result } = renderHook(() => useTrustBar());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('API error');
    expect(result.current.data).toBeNull();
  });

  it('ignores cancelled axios requests', async () => {
    const cancelError = new axios.Cancel('aborted');
    (trustBarService.getTrustBarData as jest.Mock).mockRejectedValueOnce(
      cancelError,
    );

    const { result } = renderHook(() => useTrustBar());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
  });

  it('refetch triggers a new API request', async () => {
    (trustBarService.getTrustBarData as jest.Mock)
      .mockResolvedValueOnce(mockTrustBarData)
      .mockResolvedValueOnce({
        ...mockTrustBarData,
        header: 'Securing global transactions',
      });

    const { result } = renderHook(() => useTrustBar());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() =>
      expect(trustBarService.getTrustBarData).toHaveBeenCalledTimes(2),
    );
    await waitFor(() =>
      expect(result.current.data?.header).toBe('Securing global transactions'),
    );
  });
});
