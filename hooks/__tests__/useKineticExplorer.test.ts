import { renderHook, act, waitFor } from '@testing-library/react';
import axios from 'axios';
import { useKineticExplorer } from '@/hooks/useKineticExplorer';
import { kineticExplorerService } from '@/services/kineticExplorerService';
import type { KineticExplorerResponse } from '@/types/kineticExplorer';

jest.mock('@/services/kineticExplorerService', () => ({
  kineticExplorerService: {
    getSnapshot: jest.fn(),
  },
}));

const mockSnapshot: KineticExplorerResponse = {
  transactions: [
    {
      id: 'tx1',
      hash: '0xabc123def456',
      from: 'GABC...',
      to: 'GXYZ...',
      amount: 250,
      asset: 'XLM',
      status: 'settled',
      timestamp: '2026-07-26T10:00:00Z',
    },
  ],
  metrics: {
    tps: 1450,
    latencyMs: 320,
    ledgerNumber: 48213092,
    activeValidators: 24,
  },
};

describe('useKineticExplorer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads transactions and metrics from the service', async () => {
    (kineticExplorerService.getSnapshot as jest.Mock).mockResolvedValueOnce(
      mockSnapshot,
    );

    const { result } = renderHook(() => useKineticExplorer());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(kineticExplorerService.getSnapshot).toHaveBeenCalledTimes(1);
    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.metrics?.tps).toBe(1450);
    expect(result.current.error).toBeNull();
  });

  it('exposes a friendly error message when the API fails', async () => {
    (kineticExplorerService.getSnapshot as jest.Mock).mockRejectedValueOnce(
      new Error('Network down'),
    );

    const { result } = renderHook(() => useKineticExplorer());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Network down');
    expect(result.current.transactions).toEqual([]);
  });

  it('ignores cancelled requests and does not surface them as errors', async () => {
    const cancelError = new axios.Cancel('aborted');
    (kineticExplorerService.getSnapshot as jest.Mock).mockRejectedValueOnce(
      cancelError,
    );

    const { result } = renderHook(() => useKineticExplorer());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
  });

  it('refetch triggers a fresh service call', async () => {
    (kineticExplorerService.getSnapshot as jest.Mock)
      .mockResolvedValueOnce(mockSnapshot)
      .mockResolvedValueOnce({
        ...mockSnapshot,
        metrics: { ...mockSnapshot.metrics, tps: 2000 },
      });

    const { result } = renderHook(() => useKineticExplorer());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() =>
      expect(kineticExplorerService.getSnapshot).toHaveBeenCalledTimes(2),
    );
    await waitFor(() => expect(result.current.metrics?.tps).toBe(2000));
  });
});
