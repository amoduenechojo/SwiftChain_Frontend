import axios from 'axios';
import { trustBarService } from '@/services/trustBarService';
import type { TrustBarResponse } from '@/types/trustBar';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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
    { id: 'tvl', label: 'Total Volume Secured', value: '$500M+', subtext: 'Cross-chain liquidity' },
    { id: 'uptime', label: 'Escrow Uptime', value: '99.99%', subtext: '24/7 smart contracts' },
  ],
};

describe('trustBarService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches trust bar data from the content endpoint', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockTrustBarData });

    const result = await trustBarService.getTrustBarData();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/content/trust-bar'),
      expect.objectContaining({ signal: undefined }),
    );
    expect(result).toEqual(mockTrustBarData);
  });

  it('propagates errors from the API call', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    await expect(trustBarService.getTrustBarData()).rejects.toThrow(
      'Network error',
    );
  });
});
