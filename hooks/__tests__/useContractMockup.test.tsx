import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useContractMockup } from '@/hooks/useContractMockup';
import { contractMockupService } from '@/services/contractMockupService';
import type { ContractSnippet } from '@/types/contractMockup';

jest.mock('@/services/contractMockupService');

const mockedService = contractMockupService as jest.Mocked<typeof contractMockupService>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useContractMockup', () => {
  const mockSnippet: ContractSnippet = {
    fileName: 'EscrowVault.sol',
    language: 'solidity',
    code: 'contract EscrowVault {}',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  it('loads the contract snippet from the service', async () => {
    mockedService.getContractSnippet.mockResolvedValueOnce(mockSnippet);

    const { result } = renderHook(() => useContractMockup(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.snippet).toEqual(mockSnippet);
    expect(result.current.isError).toBe(false);
  });

  it('surfaces an error state when the fetch fails', async () => {
    mockedService.getContractSnippet.mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useContractMockup(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.snippet).toBeNull();
  });

  it('copies the loaded code and flips isCopied for 2 seconds', async () => {
    jest.useFakeTimers({ legacyFakeTimers: false });
    mockedService.getContractSnippet.mockResolvedValueOnce(mockSnippet);

    const { result } = renderHook(() => useContractMockup(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.copyCode();
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockSnippet.code);
    expect(result.current.isCopied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.isCopied).toBe(false);
    jest.useRealTimers();
  });
});
