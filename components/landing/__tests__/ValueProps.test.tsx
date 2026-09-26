import { render, screen } from '@testing-library/react';
import { ValueProps } from '@/components/landing/ValueProps';
import { useValueProps } from '@/hooks/useValueProps';

jest.mock('@/hooks/useValueProps');
const mockUseValueProps = useValueProps as jest.Mock;

describe('ValueProps', () => {
  it('renders each value prop card once loaded', () => {
    mockUseValueProps.mockReturnValue({
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
          description: 'Drivers receive payment instantly.',
        },
        {
          id: 'fees',
          icon: '💰',
          title: 'Zero-Fee Layer',
          description: 'Minimal transaction overhead.',
        },
      ],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ValueProps />);

    expect(screen.getByText('Trustless Escrow')).toBeInTheDocument();
    expect(screen.getByText('Instant Settlement')).toBeInTheDocument();
    expect(screen.getByText('Zero-Fee Layer')).toBeInTheDocument();
  });

  it('renders loading skeletons while data is being fetched', () => {
    mockUseValueProps.mockReturnValue({
      items: [],
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<ValueProps />);

    expect(container.querySelectorAll('.animate-pulse').length).toBe(3);
  });

  it('renders an error message when the fetch fails', () => {
    mockUseValueProps.mockReturnValue({
      items: [],
      isLoading: false,
      error: 'Failed to load value propositions',
      refetch: jest.fn(),
    });

    render(<ValueProps />);

    expect(
      screen.getByText('Failed to load value propositions'),
    ).toBeInTheDocument();
  });

  it('clips glow effects within each card container', () => {
    mockUseValueProps.mockReturnValue({
      items: [
        {
          id: 'escrow',
          icon: '🔗',
          title: 'Trustless Escrow',
          description: 'Payments remain secured until delivery confirmation.',
        },
      ],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<ValueProps />);

    const card = container.querySelector('.overflow-hidden');
    expect(card).not.toBeNull();
    expect(card?.querySelector('.blur-3xl')).not.toBeNull();
  });
});
