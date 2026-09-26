import axios from 'axios';
import { valuePropsService } from '@/services/valuePropsService';
import type { ValuePropsResponse } from '@/types/valueProp';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockResponse: ValuePropsResponse = {
  items: [
    {
      id: 'escrow',
      icon: '🔗',
      title: 'Trustless Escrow',
      description: 'Payments remain secured until delivery confirmation.',
    },
    {
      id: 'settlement',
      icon: '⚡',
      title: 'Instant Settlement',
      description: 'Drivers receive payment instantly once verified on-chain.',
    },
    {
      id: 'fees',
      icon: '💰',
      title: 'Zero-Fee Layer',
      description: 'Reduce logistics costs with blockchain efficiency.',
    },
  ],
};

describe('valuePropsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches value props from the content endpoint', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

    const result = await valuePropsService.getValueProps();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/content/value-props'),
      expect.objectContaining({ signal: undefined }),
    );
    expect(result).toEqual(mockResponse);
  });

  it('propagates errors from the API call', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    await expect(valuePropsService.getValueProps()).rejects.toThrow(
      'Network error',
    );
  });
});
