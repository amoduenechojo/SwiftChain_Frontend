import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from '@/app/page';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Home landing page', () => {
  it('renders the industry solutions section and dark footer content', () => {
    render(<Home />, { wrapper: createWrapper() });

    expect(screen.getByText(/Independent Carriers/i)).toBeInTheDocument();
    expect(screen.getByText(/Precision Industry Solutions/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /explore carriers/i })).toBeInTheDocument();
    expect(screen.getByText(/Blockchain-powered logistics infrastructure/i)).toBeInTheDocument();
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });
});
