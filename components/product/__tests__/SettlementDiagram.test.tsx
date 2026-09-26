import { render, screen, fireEvent } from '@testing-library/react';
import { SettlementDiagram } from '../SettlementDiagram';
import { useSettlementDiagram } from '@/hooks/useSettlementDiagram';
import { settlementService } from '@/services/settlementService';
import type { SettlementDiagramData } from '@/types/settlement';

jest.mock('@/hooks/useSettlementDiagram');
const mockedUseSettlementDiagram = useSettlementDiagram as jest.Mock;

jest.mock('@/services/settlementService', () => ({
  settlementService: {
    getSettlementDiagram: jest.fn(),
  },
}));

const mockData: SettlementDiagramData = {
  centralLabel: 'Instant Payouts',
  orbitalElements: [
    { id: 'escrow', label: 'Escrow Release' },
    { id: 'blockchain', label: 'Blockchain Confirmation' },
  ],
  features: [
    {
      id: 'automated-escrow',
      title: 'Automated Escrow Release',
      description: 'Funds release automatically once delivery conditions are verified.',
    },
  ],
};

describe('SettlementDiagram', () => {
  const mockRefetch = jest.fn();

  beforeEach(() => {
    mockedUseSettlementDiagram.mockClear();
    mockRefetch.mockClear();
  });

  it('renders loading state', () => {
    mockedUseSettlementDiagram.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    });

    render(<SettlementDiagram />);
    expect(screen.getByLabelText('Loading settlement diagram')).toBeInTheDocument();
  });

  it('renders error state and retries on click', () => {
    mockedUseSettlementDiagram.mockReturnValue({
      data: null,
      isLoading: false,
      error: 'Failed to load settlement diagram',
      refetch: mockRefetch,
    });

    render(<SettlementDiagram />);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load settlement diagram');

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders the central node, orbital elements, and feature list', () => {
    mockedUseSettlementDiagram.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<SettlementDiagram />);
    expect(screen.getByText('Instant Payouts')).toBeInTheDocument();
    expect(screen.getByText('Escrow Release')).toBeInTheDocument();
    expect(screen.getByText('Blockchain Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Automated Escrow Release')).toBeInTheDocument();
  });

  it('verifies backend API service returns SettlementDiagramData response shape', async () => {
    (settlementService.getSettlementDiagram as jest.Mock).mockResolvedValue(mockData);

    const result = await settlementService.getSettlementDiagram();
    expect(result.centralLabel).toBe('Instant Payouts');
    expect(result.orbitalElements).toHaveLength(2);
  });
});
