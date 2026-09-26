// __tests__/components/DashboardOverview.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardOverview from '@/components/dashboard/DashboardOverview'; // Adjust path as needed
import { useDashboardData } from '@/hooks/useDashboardData'; // Adjust path to your data hook

// Mock the data fetching hook to control loading states
jest.mock('@/hooks/useDashboardData');

describe('Component: Skeleton Loading States for Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders skeleton UI placeholders when data is loading', () => {
    // Force the loading state to true
    (useDashboardData as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<DashboardOverview />);

    // Assert that skeleton elements are rendered
    const skeletons = screen.getAllByTestId('skeleton-loader');
    expect(skeletons.length).toBeGreaterThan(0);

    // Assert that actual data content is not present
    expect(screen.queryByText(/total deliveries/i)).not.toBeInTheDocument();
  });

  it('removes skeleton loaders and renders actual data when loading completes', () => {
    // Simulate a successful data fetch
    (useDashboardData as jest.Mock).mockReturnValue({
      data: {
        totalDeliveries: 1450,
        activeDrivers: 32,
      },
      isLoading: false,
      error: null,
    });

    render(<DashboardOverview />);

    // Assert that skeletons are removed
    expect(screen.queryByTestId('skeleton-loader')).not.toBeInTheDocument();

    // Assert that real data is rendered
    expect(screen.getByText('1450')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
  });

  it('renders an error boundary or state if data fetching fails', () => {
    (useDashboardData as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to fetch dashboard metrics'),
    });

    render(<DashboardOverview />);

    expect(screen.queryByTestId('skeleton-loader')).not.toBeInTheDocument();
    expect(screen.getByText(/failed to fetch dashboard metrics/i)).toBeInTheDocument();
  });
});