import { render, screen } from '@testing-library/react';
import { KineticExplorer } from '@/components/landing/KineticExplorer';
import { useKineticExplorer } from '@/hooks/useKineticExplorer';

jest.mock('@/hooks/useKineticExplorer');
const mockUseKineticExplorer = useKineticExplorer as jest.Mock;

describe('KineticExplorer', () => {
  it('renders network metrics and transactions once loaded', () => {
    mockUseKineticExplorer.mockReturnValue({
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
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<KineticExplorer />);

    expect(screen.getByText('1450')).toBeInTheDocument();
    expect(screen.getByText('320ms')).toBeInTheDocument();
    expect(screen.getByText('settled')).toBeInTheDocument();
    expect(screen.getByText(/250 XLM/)).toBeInTheDocument();
  });

  it('shows a loading skeleton while data is being fetched', () => {
    mockUseKineticExplorer.mockReturnValue({
      transactions: [],
      metrics: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<KineticExplorer />);

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(screen.queryByText('1450')).not.toBeInTheDocument();
  });

  it('renders an error message when the fetch fails', () => {
    mockUseKineticExplorer.mockReturnValue({
      transactions: [],
      metrics: null,
      isLoading: false,
      error: 'Failed to load network explorer data',
      refetch: jest.fn(),
    });

    render(<KineticExplorer />);

    expect(
      screen.getByText('Failed to load network explorer data'),
    ).toBeInTheDocument();
  });
});
