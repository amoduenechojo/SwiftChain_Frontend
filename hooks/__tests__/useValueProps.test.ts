import { renderHook, act, waitFor } from '@testing-library/react';
import axios from 'axios';
import { useValueProps } from '@/hooks/useValueProps';
import { valuePropsService } from '@/services/valuePropsService';
import type { ValuePropsResponse } from '@/types/valueProp';

jest.mock('@/services/valuePropsService', () => ({
  valuePropsService: {
    getValueProps: jest.fn(),
  },
}));

const mockResponse: ValuePropsResponse = {
  items: [
    {
      id: 'escrow',
      icon: '🔗',
      title: 'Trustless Escrow',
      description: 'Payments remain secured until delivery confirmation.',
    },
  ],
};

describe('useValueProps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads value prop items from the service', async () => {
    (valuePropsService.getValueProps as jest.Mock).mockResolvedValueOnce(
      mockResponse,
    );

    const { result } = renderHook(() => useValueProps());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(valuePropsService.getValueProps).toHaveBeenCalledTimes(1);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('exposes a friendly error message when the API fails', async () => {
    (valuePropsService.getValueProps as jest.Mock).mockRejectedValueOnce(
      new Error('Network down'),
    );

    const { result } = renderHook(() => useValueProps());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Network down');
    expect(result.current.items).toEqual([]);
  });

  it('ignores cancelled requests and does not surface them as errors', async () => {
    const cancelError = new axios.Cancel('aborted');
    (valuePropsService.getValueProps as jest.Mock).mockRejectedValueOnce(
      cancelError,
    );

    const { result } = renderHook(() => useValueProps());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
  });

  it('refetch triggers a fresh service call', async () => {
    (valuePropsService.getValueProps as jest.Mock)
      .mockResolvedValueOnce(mockResponse)
      .mockResolvedValueOnce({
        items: [
          ...mockResponse.items,
          {
            id: 'settlement',
            icon: '⚡',
            title: 'Instant Settlement',
            description: 'Instant on-chain payouts.',
          },
        ],
      });

    const { result } = renderHook(() => useValueProps());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() =>
      expect(valuePropsService.getValueProps).toHaveBeenCalledTimes(2),
    );
    await waitFor(() => expect(result.current.items).toHaveLength(2));
  });
});
