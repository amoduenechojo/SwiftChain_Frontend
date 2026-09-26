import { render, screen, fireEvent, within } from '@testing-library/react';
import { EnterpriseDashboard } from '../EnterpriseDashboard';
import { useFleet } from '@/hooks/useFleet';
import type { Driver, FleetSummary } from '@/types/fleet';

// Mock the useFleet hook
jest.mock('@/hooks/useFleet');
const mockedUseFleet = useFleet as jest.Mock;

// Mock the useVirtualizer hook from @tanstack/react-virtual
jest.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: jest.fn((opts) => {
    const virtualItems = Array.from({ length: opts.count }).map(
      (_, index) => ({
        index,
        start: index * opts.estimateSize(),
        size: opts.estimateSize(),
        key: index,
      }),
    );

    return {
      getVirtualItems: () => virtualItems,
      getTotalSize: () => opts.count * opts.estimateSize(),
    };
  }),
}));

const mockDrivers: Driver[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '123-456-7890',
    vehicleType: 'Sedan',
    vehiclePlate: 'ABC-123',
    status: 'active',
    activeDeliveries: 2,
    completedDeliveries: 10,
    rating: 4.8,
    location: { lat: 9.076, lng: 7.398 },
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '098-765-4321',
    vehicleType: 'Truck',
    vehiclePlate: 'XYZ-789',
    status: 'on_delivery',
    activeDeliveries: 1,
    completedDeliveries: 25,
    rating: 4.9,
    location: { lat: 6.524, lng: 3.379 },
  },
];

const mockSummary: FleetSummary = {
  totalDrivers: 2,
  activeDrivers: 1,
  onDelivery: 1,
  idle: 0,
  offline: 0,
};

describe('EnterpriseDashboard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading skeletons when data is loading', () => {
    mockedUseFleet.mockReturnValue({
      drivers: [],
      summary: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<EnterpriseDashboard />);

    // Check for summary bar skeleton
    expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0);

    // Check for table skeleton
    expect(screen.getByLabelText('Loading fleet data')).toBeInTheDocument();
  });

  it('should render the error state when an error occurs', () => {
    const refetch = jest.fn();
    mockedUseFleet.mockReturnValue({
      drivers: [],
      summary: null,
      isLoading: false,
      error: 'Network request failed',
      refetch,
    });

    render(<EnterpriseDashboard />);

    expect(screen.getByText('Failed to load fleet data')).toBeInTheDocument();
    expect(screen.getByText('Network request failed')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: 'Try again' });
    expect(retryButton).toBeInTheDocument();
    fireEvent.click(retryButton);
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('should render the empty state when there are no drivers', () => {
    const refetch = jest.fn();
    mockedUseFleet.mockReturnValue({
      drivers: [],
      summary: { totalDrivers: 0, activeDrivers: 0, onDelivery: 0, idle: 0, offline: 0 },
      isLoading: false,
      error: null,
      refetch,
    });

    render(<EnterpriseDashboard />);

    expect(screen.getByText('No drivers found')).toBeInTheDocument();
    expect(screen.getByText('Your fleet appears to be empty.')).toBeInTheDocument();

    const refreshButton = screen.getByRole('button', { name: 'Refresh data' });
    expect(refreshButton).toBeInTheDocument();
    fireEvent.click(refreshButton);
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('should render the dashboard with data on successful fetch', () => {
    mockedUseFleet.mockReturnValue({
      drivers: mockDrivers,
      summary: mockSummary,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<EnterpriseDashboard />);

    // Check summary bar
    const totalCard = screen.getByText('Total').closest('div');
    expect(totalCard).not.toBeNull();
    expect(within(totalCard as HTMLElement).getByText(String(mockSummary.totalDrivers))).toBeInTheDocument();

    // Check table header and virtualized rows
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Check footer
    expect(screen.getByText(/Showing 2 drivers/)).toBeInTheDocument();
  });

  it('should call refetch when the main refresh button is clicked', () => {
    const refetch = jest.fn();
    mockedUseFleet.mockReturnValue({
      drivers: mockDrivers,
      summary: mockSummary,
      isLoading: false,
      error: null,
      refetch,
    });

    render(<EnterpriseDashboard />);

    const refreshButton = screen.getByRole('button', { name: 'Refresh' });
    fireEvent.click(refreshButton);
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});