import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionHistoryTable } from '@/components/transactions/TransactionHistoryTable';
import { downloadCsv } from '@/lib/csvExport';
import type { TransactionRecord } from '@/services/transactionHistoryService';

jest.mock('@/lib/csvExport', () => {
  const actual = jest.requireActual('@/lib/csvExport');
  return {
    ...actual,
    downloadCsv: jest.fn(),
  };
});

const mockDownloadCsv = downloadCsv as jest.Mock;

const TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx-1',
    hash: 'abc123def4567890abcdef',
    date: '2026-02-01T10:00:00.000Z',
    type: 'ESCROW_LOCK',
    amount: 250,
    currency: 'XLM',
    status: 'SUCCESS',
    counterparty: 'Ada Obi',
    deliveryId: 'del-1',
  },
  {
    id: 'tx-2',
    hash: 'short',
    date: '2026-02-02T11:30:00.000Z',
    type: 'REFUND',
    amount: 40,
    currency: 'XLM',
    status: 'FAILED',
  },
];

/** Data rows only — the header row lives in its own <thead>. */
function getBodyRows(): HTMLElement[] {
  const [, ...bodyRows] = screen.getAllByRole('row');
  return bodyRows;
}

describe('TransactionHistoryTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders one row per transaction', () => {
      render(<TransactionHistoryTable transactions={TRANSACTIONS} />);

      expect(screen.getByRole('table', { name: 'Transactions' })).toBeInTheDocument();
      expect(getBodyRows()).toHaveLength(2);
      expect(screen.getByText('ESCROW_LOCK')).toBeInTheDocument();
      expect(screen.getByText('250 XLM')).toBeInTheDocument();
      expect(screen.getByText('SUCCESS')).toBeInTheDocument();
    });

    it('truncates long hashes but leaves short ones intact', () => {
      render(<TransactionHistoryTable transactions={TRANSACTIONS} />);

      expect(screen.getByText('abc123de...abcdef')).toBeInTheDocument();
      expect(screen.getByText('short')).toBeInTheDocument();
    });

    it('shows the row count and pluralises it', () => {
      const { rerender } = render(<TransactionHistoryTable transactions={TRANSACTIONS} />);
      expect(screen.getByTestId('transaction-count')).toHaveTextContent('2 transactions');

      rerender(<TransactionHistoryTable transactions={[TRANSACTIONS[0]]} />);
      expect(screen.getByTestId('transaction-count')).toHaveTextContent('1 transaction');
    });

    it('renders a placeholder for an unparseable date', () => {
      render(
        <TransactionHistoryTable transactions={[{ ...TRANSACTIONS[0], date: 'not-a-date' }]} />,
      );

      expect(screen.getByText('--')).toBeInTheDocument();
    });
  });

  describe('export flow', () => {
    it('downloads the current table data as CSV', async () => {
      const user = userEvent.setup();
      render(<TransactionHistoryTable transactions={TRANSACTIONS} />);

      await user.click(screen.getByRole('button', { name: /Export to CSV/ }));

      expect(mockDownloadCsv).toHaveBeenCalledTimes(1);
      const [content, filename] = mockDownloadCsv.mock.calls[0];
      expect(filename).toMatch(/^swiftchain-transactions-\d{4}-\d{2}-\d{2}\.csv$/);
      expect(content.split('\r\n')).toHaveLength(3);
      expect(content).toContain('abc123def4567890abcdef');
      expect(content).toContain('short');
    });

    it('exports the untruncated hash rather than the rendered one', async () => {
      const user = userEvent.setup();
      render(<TransactionHistoryTable transactions={TRANSACTIONS} />);

      await user.click(screen.getByRole('button', { name: /Export to CSV/ }));

      expect(mockDownloadCsv.mock.calls[0][0]).not.toContain('abc123de...abcdef');
    });

    it('exports exactly the rows the table is currently showing', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<TransactionHistoryTable transactions={TRANSACTIONS} />);

      rerender(<TransactionHistoryTable transactions={[TRANSACTIONS[1]]} />);
      await user.click(screen.getByRole('button', { name: /Export to CSV/ }));

      const content = mockDownloadCsv.mock.calls[0][0] as string;
      expect(content.split('\r\n')).toHaveLength(2);
      expect(content).not.toContain('ESCROW_LOCK');
    });

    it('confirms the export to the user', async () => {
      const user = userEvent.setup();
      render(<TransactionHistoryTable transactions={TRANSACTIONS} />);

      expect(screen.queryByText('Your transactions have been exported.')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Export to CSV/ }));

      expect(screen.getByText('Your transactions have been exported.')).toBeInTheDocument();
    });

    it('can be exported repeatedly', async () => {
      const user = userEvent.setup();
      render(<TransactionHistoryTable transactions={TRANSACTIONS} />);

      const button = screen.getByRole('button', { name: /Export to CSV/ });
      await user.click(button);
      await user.click(button);

      expect(mockDownloadCsv).toHaveBeenCalledTimes(2);
    });

    it('surfaces a download failure and lets the user dismiss it', async () => {
      const user = userEvent.setup();
      mockDownloadCsv.mockImplementationOnce(() => {
        throw new Error('Download blocked by the browser');
      });
      render(<TransactionHistoryTable transactions={TRANSACTIONS} />);

      await user.click(screen.getByRole('button', { name: /Export to CSV/ }));

      expect(screen.getByRole('alert')).toHaveTextContent('Download blocked by the browser');
      expect(screen.queryByText('Your transactions have been exported.')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Dismiss' }));

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('recovers on a retry after a failed export', async () => {
      const user = userEvent.setup();
      mockDownloadCsv.mockImplementationOnce(() => {
        throw new Error('Download blocked by the browser');
      });
      render(<TransactionHistoryTable transactions={TRANSACTIONS} />);

      const button = screen.getByRole('button', { name: /Export to CSV/ });
      await user.click(button);
      await user.click(button);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByText('Your transactions have been exported.')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('renders the empty state and disables the export button', () => {
      render(<TransactionHistoryTable transactions={[]} />);

      expect(screen.getByText('No transactions yet')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Export to CSV/ })).toBeDisabled();
    });

    it('does not trigger a download from the disabled empty-state button', async () => {
      const user = userEvent.setup();
      render(<TransactionHistoryTable transactions={[]} />);

      await user.click(screen.getByRole('button', { name: /Export to CSV/ }));

      expect(mockDownloadCsv).not.toHaveBeenCalled();
    });

    it('renders the loading state instead of the table', () => {
      render(<TransactionHistoryTable transactions={[]} isLoading />);

      expect(screen.getByRole('status')).toHaveTextContent('Loading transactions...');
      expect(screen.queryByRole('button', { name: /Export to CSV/ })).not.toBeInTheDocument();
    });

    it('renders the error state instead of the table', () => {
      render(<TransactionHistoryTable transactions={[]} error="Unable to load transactions" />);

      expect(screen.getByRole('alert')).toHaveTextContent('Unable to load transactions');
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Export to CSV/ })).not.toBeInTheDocument();
    });

    it('prefers the loading state over the error state', () => {
      render(<TransactionHistoryTable transactions={[]} isLoading error="Stale error" />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
