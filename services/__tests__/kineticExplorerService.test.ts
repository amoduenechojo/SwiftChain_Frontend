import axios from 'axios';
import { kineticExplorerService } from '@/services/kineticExplorerService';
import type { KineticExplorerResponse } from '@/types/kineticExplorer';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockResponse: KineticExplorerResponse = {
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

describe('kineticExplorerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches the explorer snapshot from the network endpoint', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

    const result = await kineticExplorerService.getSnapshot();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/network/kinetic-explorer'),
      expect.objectContaining({ signal: undefined }),
    );
    expect(result).toEqual(mockResponse);
  });

  it('propagates errors from the API call', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    await expect(kineticExplorerService.getSnapshot()).rejects.toThrow(
      'Network error',
    );
  });
});
