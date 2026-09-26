// __tests__/integration/DashboardMetrics.test.tsx

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardMetrics from '@/components/DashboardMetrics'; // Adjust path as needed
import * as api from '@/services/metricsService'; // Adjust path to your API service

// Mock the external API dependency
jest.mock('@/services/metricsService');

describe('Integration: Dashboard Metrics Caching with React Query', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create a fresh QueryClient for each test to isolate cache state
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 10000, // 10 seconds for testing
        },
      },
    });
    jest.clearAllMocks();
  });

  it('fetches and displays metrics on initial render', async () => {
    (api.fetchDashboardMetrics as jest.Mock).mockResolvedValueOnce({
      totalDeliveries: 150,
      activeDrivers: 12,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardMetrics />
      </QueryClientProvider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    expect(api.fetchDashboardMetrics).toHaveBeenCalledTimes(1);
  });

  it('serves cached data and does not refetch immediately if data is fresh', async () => {
    (api.fetchDashboardMetrics as jest.Mock).mockResolvedValue({
      totalDeliveries: 150,
      activeDrivers: 12,
    });

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <DashboardMetrics />
      </QueryClientProvider>
    );

    await waitFor(() => expect(screen.getByText('150')).toBeInTheDocument());

    // Rerender the component while data is still fresh
    rerender(
      <QueryClientProvider client={queryClient}>
        <DashboardMetrics />
      </QueryClientProvider>
    );

    // Should still only be called once due to staleTime caching
    expect(api.fetchDashboardMetrics).toHaveBeenCalledTimes(1);
  });

  it('refetches stale data when the window regains focus', async () => {
    (api.fetchDashboardMetrics as jest.Mock)
      .mockResolvedValueOnce({ totalDeliveries: 150, activeDrivers: 12 })
      .mockResolvedValueOnce({ totalDeliveries: 155, activeDrivers: 14 }); // New data on refetch

    // Set up client with 0 staleTime so data is immediately considered stale upon focus
    const focusClient = new QueryClient({
      defaultOptions: { queries: { staleTime: 0, refetchOnWindowFocus: true } },
    });

    render(
      <QueryClientProvider client={focusClient}>
        <DashboardMetrics />
      </QueryClientProvider>
    );

    await waitFor(() => expect(screen.getByText('150')).toBeInTheDocument());
    expect(api.fetchDashboardMetrics).toHaveBeenCalledTimes(1);

    // Simulate user switching tabs and coming back
    act(() => {
      window.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('focus'));
    });

    // Wait for the UI to update with the new mocked data
    await waitFor(() => {
      expect(screen.getByText('155')).toBeInTheDocument();
      expect(screen.getByText('14')).toBeInTheDocument();
    });

    expect(api.fetchDashboardMetrics).toHaveBeenCalledTimes(2);
  });
  
  it('handles and displays API errors correctly', async () => {
    (api.fetchDashboardMetrics as jest.Mock).mockRejectedValueOnce(new Error('Failed to load metrics'));

    render(
      <QueryClientProvider client={queryClient}>
        <DashboardMetrics />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load metrics/i)).toBeInTheDocument();
    });
  });
});