/**
 * TransactionHistoryList component tests.
 *
 * The focus is the empty states: a first-time user with no cross-border
 * transactions must get a friendly, actionable message rather than a blank
 * panel, and an over-filtered list must offer a way back. Loading, error and
 * populated states are covered so the four states stay mutually exclusive.
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionHistoryList } from '@/features/transactions/components/TransactionHistoryList';
import type { CrossBorderTransaction } from '@/types/transactionHistory';

function transaction(
  overrides: Partial<CrossBorderTransaction> = {},
): CrossBorderTransaction {
  return {
    id: 'tx-1',
    reference: 'SC-20260425-0001',
    direction: 'SENT',
    counterparty: 'Amara Okafor',
    amount: 1250.5,
    assetCode: 'XLM',
    fiatAmount: 640.25,
    fiatCurrency: 'USD',
    originCountry: 'NG',
    destinationCountry: 'GB',
    escrowStatus: 'LOCKED',
    createdAt: '2026-04-25T12:00:00.000Z',
    ...overrides,
  };
}

function rows() {
  return screen.queryAllByTestId('transaction-row');
}

describe('TransactionHistoryList', () => {
  describe('empty state - no transactions at all', () => {
    it('renders a friendly empty state instead of an empty list', () => {
      render(<TransactionHistoryList transactions={[]} />);

      expect(
        screen.getByText('No cross-border transactions yet'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Once you send or receive your first cross-border transfer/i),
      ).toBeInTheDocument();
      expect(rows()).toHaveLength(0);
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('offers a call to action that starts the first transfer', async () => {
      const user = userEvent.setup();
      const onCreateTransfer = jest.fn();

      render(
        <TransactionHistoryList
          transactions={[]}
          onCreateTransfer={onCreateTransfer}
        />,
      );

      await user.click(
        screen.getByRole('button', { name: 'Send your first transfer' }),
      );

      expect(onCreateTransfer).toHaveBeenCalledTimes(1);
    });

    it('omits the call to action when no handler is supplied', () => {
      render(<TransactionHistoryList transactions={[]} />);

      expect(
        screen.getByText('No cross-border transactions yet'),
      ).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('does not show the filtered empty state copy', () => {
      render(<TransactionHistoryList transactions={[]} />);

      expect(
        screen.queryByText('No transactions match your filters'),
      ).not.toBeInTheDocument();
    });
  });

  describe('empty state - filters exclude everything', () => {
    it('explains that filters, not the account, are the reason', () => {
      render(<TransactionHistoryList transactions={[]} hasActiveFilters />);

      expect(
        screen.getByText('No transactions match your filters'),
      ).toBeInTheDocument();
      expect(
        screen.queryByText('No cross-border transactions yet'),
      ).not.toBeInTheDocument();
    });

    it('offers a way back to the full history', async () => {
      const user = userEvent.setup();
      const onClearFilters = jest.fn();

      render(
        <TransactionHistoryList
          transactions={[]}
          hasActiveFilters
          onClearFilters={onClearFilters}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Clear filters' }));

      expect(onClearFilters).toHaveBeenCalledTimes(1);
    });

    it('ignores the filtered variant once results exist again', () => {
      render(
        <TransactionHistoryList
          transactions={[transaction()]}
          hasActiveFilters
        />,
      );

      expect(
        screen.queryByText('No transactions match your filters'),
      ).not.toBeInTheDocument();
      expect(rows()).toHaveLength(1);
    });
  });

  describe('loading state', () => {
    it('shows skeleton placeholders and no empty state', () => {
      render(<TransactionHistoryList transactions={[]} isLoading />);

      expect(screen.getAllByTestId('transaction-skeleton')).toHaveLength(3);
      expect(
        screen.queryByText('No cross-border transactions yet'),
      ).not.toBeInTheDocument();
    });

    it('announces loading to assistive technology', () => {
      render(<TransactionHistoryList transactions={[]} isLoading />);

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label', 'Loading transaction history');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('takes precedence over an error so states never stack', () => {
      render(
        <TransactionHistoryList
          transactions={[]}
          isLoading
          error="Network unreachable"
        />,
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('transaction-skeleton')).toHaveLength(3);
    });
  });

  describe('error state', () => {
    it('surfaces the failure message as an alert', () => {
      render(
        <TransactionHistoryList transactions={[]} error="Network unreachable" />,
      );

      expect(screen.getByRole('alert')).toHaveTextContent('Network unreachable');
      expect(
        screen.queryByText('No cross-border transactions yet'),
      ).not.toBeInTheDocument();
    });

    it('lets the user retry the fetch', async () => {
      const user = userEvent.setup();
      const onRetry = jest.fn();

      render(
        <TransactionHistoryList
          transactions={[]}
          error="Network unreachable"
          onRetry={onRetry}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Try again' }));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('hides the retry button when no handler is supplied', () => {
      render(
        <TransactionHistoryList transactions={[]} error="Network unreachable" />,
      );

      expect(
        screen.queryByRole('button', { name: 'Try again' }),
      ).not.toBeInTheDocument();
    });

    it('still reports the error even when transactions are cached', () => {
      render(
        <TransactionHistoryList
          transactions={[transaction()]}
          error="Network unreachable"
        />,
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(rows()).toHaveLength(0);
    });
  });

  describe('populated list', () => {
    it('renders one row per transaction in the given order', () => {
      render(
        <TransactionHistoryList
          transactions={[
            transaction({ id: 'tx-1', counterparty: 'Amara Okafor' }),
            transaction({ id: 'tx-2', counterparty: 'Wei Zhang' }),
          ]}
        />,
      );

      const rendered = rows();
      expect(rendered).toHaveLength(2);
      expect(rendered[0]).toHaveTextContent('Amara Okafor');
      expect(rendered[1]).toHaveTextContent('Wei Zhang');
    });

    it('labels the list for assistive technology', () => {
      render(<TransactionHistoryList transactions={[transaction()]} />);

      expect(
        screen.getByRole('list', { name: 'Cross-border transactions' }),
      ).toBeInTheDocument();
    });

    it('shows the reference, corridor and escrow status of a row', () => {
      render(<TransactionHistoryList transactions={[transaction()]} />);

      const row = within(rows()[0]);
      expect(row.getByText(/SC-20260425-0001/)).toBeInTheDocument();
      expect(row.getByText(/NG → GB/)).toBeInTheDocument();
      expect(row.getByText('Locked in escrow')).toBeInTheDocument();
    });

    it('signs the amount according to the transfer direction', () => {
      render(
        <TransactionHistoryList
          transactions={[
            transaction({ id: 'tx-1', direction: 'SENT', amount: 1250.5 }),
            transaction({ id: 'tx-2', direction: 'RECEIVED', amount: 800 }),
          ]}
        />,
      );

      expect(rows()[0]).toHaveTextContent('-1,250.50 XLM');
      expect(rows()[1]).toHaveTextContent('+800.00 XLM');
    });

    it('renders a placeholder when a corridor has no fiat quote', () => {
      render(
        <TransactionHistoryList
          transactions={[
            transaction({ fiatAmount: undefined, fiatCurrency: undefined }),
          ]}
        />,
      );

      expect(rows()[0]).toHaveTextContent('—');
    });

    it('renders a single-item history without falling back to the empty state', () => {
      render(<TransactionHistoryList transactions={[transaction()]} />);

      expect(rows()).toHaveLength(1);
      expect(
        screen.queryByText('No cross-border transactions yet'),
      ).not.toBeInTheDocument();
    });
  });
});
