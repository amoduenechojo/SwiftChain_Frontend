import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContractMockup } from '@/components/product/ContractMockup';
import { useContractMockup } from '@/hooks/useContractMockup';

jest.mock('@/hooks/useContractMockup');
jest.mock('../ContractMockup.css', () => ({}));

const mockedUseContractMockup = useContractMockup as jest.Mock;

describe('ContractMockup', () => {
  const mockSnippet = {
    fileName: 'EscrowVault.sol',
    language: 'solidity',
    code: 'contract EscrowVault { uint256 public amount; }',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the MacOS-style window frame with the file name', () => {
    mockedUseContractMockup.mockReturnValue({
      snippet: mockSnippet,
      isLoading: false,
      isError: false,
      isCopied: false,
      refetch: jest.fn(),
      copyCode: jest.fn(),
    });

    render(<ContractMockup />);

    expect(screen.getByText('EscrowVault.sol')).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: /smart contract code preview/i }),
    ).toBeInTheDocument();
  });

  it('shows a loading skeleton while the snippet is being fetched', () => {
    mockedUseContractMockup.mockReturnValue({
      snippet: null,
      isLoading: true,
      isError: false,
      isCopied: false,
      refetch: jest.fn(),
      copyCode: jest.fn(),
    });

    render(<ContractMockup />);

    expect(screen.getByLabelText(/loading contract code/i)).toBeInTheDocument();
  });

  it('shows an error state with a retry action on failure', async () => {
    const refetch = jest.fn();
    mockedUseContractMockup.mockReturnValue({
      snippet: null,
      isLoading: false,
      isError: true,
      isCopied: false,
      refetch,
      copyCode: jest.fn(),
    });

    render(<ContractMockup />);

    expect(
      screen.getByText(/failed to load the contract preview/i),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('invokes copyCode when the copy button is clicked', async () => {
    const copyCode = jest.fn();
    mockedUseContractMockup.mockReturnValue({
      snippet: mockSnippet,
      isLoading: false,
      isError: false,
      isCopied: false,
      refetch: jest.fn(),
      copyCode,
    });

    render(<ContractMockup />);

    await userEvent.click(
      screen.getByRole('button', { name: /copy contract code/i }),
    );
    expect(copyCode).toHaveBeenCalledTimes(1);
  });

  it('reflects the copied state from the hook', () => {
    mockedUseContractMockup.mockReturnValue({
      snippet: mockSnippet,
      isLoading: false,
      isError: false,
      isCopied: true,
      refetch: jest.fn(),
      copyCode: jest.fn(),
    });

    render(<ContractMockup />);

    expect(screen.getByText('Copied')).toBeInTheDocument();
  });
});
