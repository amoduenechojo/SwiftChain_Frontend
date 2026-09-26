import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActiveDeliveriesTable } from '@/features/deliveries/components';
import type { Delivery } from '@/types/delivery';

/**
 * Builds a deterministic set of deliveries. No network, no wallet and no socket
 * is involved: the table is a pure presentational component fed by props, which
 * keeps these tests free of the flakiness that mocked transports introduce.
 */
function makeDeliveries(count: number): Delivery[] {
  return Array.from({ length: count }, (_, index) => {
    const n = index + 1;
    return {
      id: `delivery-${n}`,
      trackingNumber: `TRK${String(n).padStart(4, '0')}`,
      senderId: 'sender-1',
      status: 'IN_TRANSIT',
      origin: `Origin ${n}`,
      destination: `Destination ${n}`,
      escrowStatus: 'LOCKED',
      amount: 100 + n,
      currency: 'XLM',
      createdAt: '2026-01-15T10:00:00.000Z',
      updatedAt: '2026-01-15T10:00:00.000Z',
    } satisfies Delivery;
  });
}

/** Data rows only — the header row lives in its own <thead>. */
function getBodyRows(): HTMLElement[] {
  const [, ...bodyRows] = screen.getAllByRole('row');
  return bodyRows;
}

describe('ActiveDeliveriesTable', () => {
  describe('rendering', () => {
    it('renders a row per delivery with its tracking number, route and status', () => {
      render(<ActiveDeliveriesTable deliveries={makeDeliveries(3)} />);

      expect(screen.getByRole('table', { name: 'Active deliveries' })).toBeInTheDocument();
      expect(getBodyRows()).toHaveLength(3);

      const firstRow = getBodyRows()[0];
      expect(within(firstRow).getByText('TRK0001')).toBeInTheDocument();
      expect(within(firstRow).getByText('Origin 1 to Destination 1')).toBeInTheDocument();
      expect(within(firstRow).getByText('IN_TRANSIT')).toBeInTheDocument();
      expect(within(firstRow).getByText('101 XLM')).toBeInTheDocument();
    });

    it('hides pagination controls when the data fits on one page', () => {
      render(<ActiveDeliveriesTable deliveries={makeDeliveries(10)} />);

      expect(getBodyRows()).toHaveLength(10);
      expect(screen.queryByRole('navigation', { name: 'Deliveries pagination' })).not.toBeInTheDocument();
      expect(screen.getByTestId('pagination-summary')).toHaveTextContent(
        'Showing 1-10 of 10 deliveries',
      );
    });
  });

  describe('pagination beyond 10 rows', () => {
    it('shows only the first 10 rows and exposes the remaining pages', () => {
      render(<ActiveDeliveriesTable deliveries={makeDeliveries(25)} />);

      expect(getBodyRows()).toHaveLength(10);
      expect(screen.getByText('TRK0001')).toBeInTheDocument();
      expect(screen.queryByText('TRK0011')).not.toBeInTheDocument();

      const nav = screen.getByRole('navigation', { name: 'Deliveries pagination' });
      expect(within(nav).getByRole('button', { name: 'Page 1' })).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(within(nav).getByRole('button', { name: 'Page 3' })).toBeInTheDocument();
      expect(within(nav).queryByRole('button', { name: 'Page 4' })).not.toBeInTheDocument();
    });

    it('advances to the next page of shipments', async () => {
      const user = userEvent.setup();
      render(<ActiveDeliveriesTable deliveries={makeDeliveries(25)} />);

      await user.click(screen.getByRole('button', { name: 'Next page' }));

      expect(getBodyRows()).toHaveLength(10);
      expect(screen.getByText('TRK0011')).toBeInTheDocument();
      expect(screen.queryByText('TRK0001')).not.toBeInTheDocument();
      expect(screen.getByTestId('pagination-summary')).toHaveTextContent(
        'Showing 11-20 of 25 deliveries',
      );
    });

    it('returns to the previous page', async () => {
      const user = userEvent.setup();
      render(<ActiveDeliveriesTable deliveries={makeDeliveries(25)} />);

      await user.click(screen.getByRole('button', { name: 'Next page' }));
      await user.click(screen.getByRole('button', { name: 'Previous page' }));

      expect(screen.getByText('TRK0001')).toBeInTheDocument();
      expect(screen.getByTestId('pagination-summary')).toHaveTextContent(
        'Showing 1-10 of 25 deliveries',
      );
    });

    it('jumps straight to a page via its numbered control', async () => {
      const user = userEvent.setup();
      render(<ActiveDeliveriesTable deliveries={makeDeliveries(25)} />);

      await user.click(screen.getByRole('button', { name: 'Page 3' }));

      expect(getBodyRows()).toHaveLength(5);
      expect(screen.getByText('TRK0021')).toBeInTheDocument();
      expect(screen.getByTestId('pagination-summary')).toHaveTextContent(
        'Showing 21-25 of 25 deliveries',
      );
    });

    it('renders a partial final page rather than padding it', async () => {
      const user = userEvent.setup();
      render(<ActiveDeliveriesTable deliveries={makeDeliveries(11)} />);

      await user.click(screen.getByRole('button', { name: 'Next page' }));

      expect(getBodyRows()).toHaveLength(1);
      expect(screen.getByText('TRK0011')).toBeInTheDocument();
    });

    it('disables Previous on the first page and Next on the last page', async () => {
      const user = userEvent.setup();
      render(<ActiveDeliveriesTable deliveries={makeDeliveries(15)} />);

      expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();

      await user.click(screen.getByRole('button', { name: 'Next page' }));

      expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    });

    it('respects a custom page size', () => {
      render(<ActiveDeliveriesTable deliveries={makeDeliveries(12)} pageSize={5} />);

      expect(getBodyRows()).toHaveLength(5);
      expect(screen.getByRole('button', { name: 'Page 3' })).toBeInTheDocument();
    });

    it('falls back to the last valid page when the dataset shrinks below the current page', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ActiveDeliveriesTable deliveries={makeDeliveries(30)} />);

      await user.click(screen.getByRole('button', { name: 'Page 3' }));
      expect(screen.getByText('TRK0021')).toBeInTheDocument();

      rerender(<ActiveDeliveriesTable deliveries={makeDeliveries(12)} />);

      expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
      expect(screen.queryByRole('button', { name: 'Page 3' })).not.toBeInTheDocument();
      expect(screen.getByTestId('pagination-summary')).toHaveTextContent(
        'Showing 11-12 of 12 deliveries',
      );
    });
  });

  describe('edge cases', () => {
    it('renders the empty state and no table when there are no deliveries', () => {
      render(<ActiveDeliveriesTable deliveries={[]} />);

      expect(screen.getByText('No active deliveries')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.queryByRole('navigation', { name: 'Deliveries pagination' })).not.toBeInTheDocument();
    });

    it('renders the loading state instead of the table', () => {
      render(<ActiveDeliveriesTable deliveries={[]} isLoading />);

      expect(screen.getByRole('status')).toHaveTextContent('Loading deliveries...');
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('renders the error state and calls onRetry', async () => {
      const user = userEvent.setup();
      const onRetry = jest.fn();
      render(
        <ActiveDeliveriesTable
          deliveries={makeDeliveries(20)}
          error="Unable to load deliveries"
          onRetry={onRetry}
        />,
      );

      expect(screen.getByRole('alert')).toHaveTextContent('Unable to load deliveries');
      expect(screen.queryByRole('table')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Try again' }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('omits the retry button when no retry handler is supplied', () => {
      render(<ActiveDeliveriesTable deliveries={[]} error="Network unreachable" />);

      expect(screen.getByRole('alert')).toHaveTextContent('Network unreachable');
      expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
    });

    it('prefers the loading state over the error state', () => {
      render(<ActiveDeliveriesTable deliveries={[]} isLoading error="Stale error" />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('renders a placeholder for an unparseable creation date', () => {
      const [delivery] = makeDeliveries(1);
      render(<ActiveDeliveriesTable deliveries={[{ ...delivery, createdAt: 'not-a-date' }]} />);

      expect(screen.getByText('--')).toBeInTheDocument();
    });

    it('falls back to XLM when a delivery carries no currency', () => {
      const [delivery] = makeDeliveries(1);
      const { currency: _currency, ...withoutCurrency } = delivery;
      render(<ActiveDeliveriesTable deliveries={[withoutCurrency as Delivery]} />);

      expect(screen.getByText('101 XLM')).toBeInTheDocument();
    });
  });
});
