jest.mock('axios');
import axios from 'axios';
import { contractMockupService } from '@/services/contractMockupService';
import type { ContractSnippet } from '@/types/contractMockup';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('contractMockupService', () => {
  const mockSnippet: ContractSnippet = {
    fileName: 'EscrowVault.sol',
    language: 'solidity',
    code: 'contract EscrowVault {}',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches the contract snippet from the backend API', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockSnippet });

    const result = await contractMockupService.getContractSnippet();

    expect(result).toEqual(mockSnippet);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/product/contract-mockup'),
      expect.any(Object),
    );
  });

  it('forwards an AbortSignal when provided', async () => {
    const controller = new AbortController();
    mockedAxios.get.mockResolvedValueOnce({ data: mockSnippet });

    await contractMockupService.getContractSnippet(controller.signal);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controller.signal }),
    );
  });

  it('propagates request failures', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    await expect(contractMockupService.getContractSnippet()).rejects.toThrow(
      'Network error',
    );
  });
});
