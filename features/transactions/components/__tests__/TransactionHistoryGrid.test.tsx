/**
 * TransactionHistoryGrid component tests.
 *
 * The focus is data formatting inside the cards: currency amounts must be
 * grouped, signed by direction and shown with their asset/ISO code, and escrow
 * statuses must render as human-readable badges rather than raw wire values.
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionHistoryGrid } from '@/features/transactions/components/TransactionHistoryGrid';
import type { CrossBorderTransaction } from '@/types/transactionHistory';
import type { EscrowStatus } from '@/types/status';

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

function cards() {
  return screen.queryAllByTestId('transaction-card');
}

function firstCard() {
  return within(cards()[0]);
}

describe('TransactionHistoryGrid', () => {
  describe('currency amount formatting', () => {
    it('groups thousands and pads to two decimals', () => {
      render(
        <TransactionHistoryGrid transactions={[transaction({ amount: 1250.5 })]} />,
      );

      expect(firstCard().getByTestId('card-amount')).toHaveTextContent(
        '-1,250.50 XLM',
      );
    });

    it('marks outgoing transfers with a minus and incoming with a plus', () => {
      render(
        <TransactionHistoryGrid
          transactions={[
            transaction({ id: 'tx-1', direction: 'SENT', amount: 1250.5 }),
            transaction({ id: 'tx-2', direction: 'RECEIVED', amount: 800 }),
          ]}
        />,
      );

      const amounts = screen
        .getAllByTestId('card-amount')
        .map((el) => el.textContent);
      expect(amounts).toEqual(['-1,250.50 XLM', '+800.00 XLM']);
    });

    it('shows the settlement asset code alongside the amount', () => {
      render(
        <TransactionHistoryGrid
          transactions={[
            transaction({ id: 'tx-1', assetCode: 'USDC', amount: 500 }),
            transaction({ id: 'tx-2', assetCode: 'XLM', amount: 500 }),
          ]}
        />,
      );

      const amounts = screen
        .getAllByTestId('card-amount')
        .map((el) => el.textContent);
      expect(amounts).toEqual(['-500.00 USDC', '-500.00 XLM']);
    });

    it('keeps stellar precision for sub-cent amounts', () => {
      render(
        <TransactionHistoryGrid
          transactions={[transaction({ amount: 0.0000001, direction: 'RECEIVED' })]}
        />,
      );

      expect(firstCard().getByTestId('card-amount')).toHaveTextContent(
        '+0.0000001 XLM',
      );
    });

    it('formats a large amount without scientific notation', () => {
      render(
        <TransactionHistoryGrid
          transactions={[transaction({ amount: 12345678.9, direction: 'RECEIVED' })]}
        />,
      );

      expect(firstCard().getByTestId('card-amount')).toHaveTextContent(
        '+12,345,678.90 XLM',
      );
    });

    it('renders the local currency leg with its ISO code', () => {
      render(
        <TransactionHistoryGrid
          transactions={[
            transaction({ fiatAmount: 1234567.8, fiatCurrency: 'NGN' }),
          ]}
        />,
      );

      expect(firstCard().getByTestId('card-fiat-amount')).toHaveTextContent(
        '1,234,567.80 NGN',
      );
    });

    it('renders a placeholder when no fiat quote is attached', () => {
      render(
        <TransactionHistoryGrid
          transactions={[
            transaction({ fiatAmount: undefined, fiatCurrency: undefined }),
          ]}
        />,
      );

      expect(firstCard().getByTestId('card-fiat-amount')).toHaveTextContent('—');
    });

    it('never prints NaN when the feed sends a bad amount', () => {
      render(
        <TransactionHistoryGrid
          transactions={[transaction({ amount: Number.NaN })]}
        />,
      );

      const amount = firstCard().getByTestId('card-amount');
      expect(amount).toHaveTextContent('—');
      expect(amount.textContent).not.toMatch(/NaN/);
    });

    it('renders a zero-value transfer as a real amount', () => {
      render(
        <TransactionHistoryGrid
          transactions={[transaction({ amount: 0, fiatAmount: 0 })]}
        />,
      );

      expect(firstCard().getByTestId('card-amount')).toHaveTextContent(
        '-0.00 XLM',
      );
      expect(firstCard().getByTestId('card-fiat-amount')).toHaveTextContent(
        '0.00 USD',
      );
    });
  });

  describe('escrow status formatting', () => {
    it.each<[EscrowStatus, string]>([
      ['LOCKED', 'Locked in escrow'],
      ['RELEASED', 'Released'],
      ['DISPUTED', 'Disputed'],
      ['NOT_LOCKED', 'Not locked'],
    ])('renders %s as the readable label %s', (escrowStatus, expected) => {
      render(
        <TransactionHistoryGrid transactions={[transaction({ escrowStatus })]} />,
      );

      expect(firstCard().getByTestId('card-escrow-status')).toHaveTextContent(
        expected,
      );
    });

    it('never shows the raw underscored wire value', () => {
      render(
        <TransactionHistoryGrid
          transactions={[transaction({ escrowStatus: 'NOT_LOCKED' })]}
        />,
      );

      expect(cards()[0].textContent).not.toContain('NOT_LOCKED');
    });

    it('gives the badge an accessible label', () => {
      render(
        <TransactionHistoryGrid
          transactions={[transaction({ escrowStatus: 'DISPUTED' })]}
        />,
      );

      expect(
        screen.getByLabelText('Escrow status: Disputed'),
      ).toBeInTheDocument();
    });

    it('styles each status distinctly so they are visually separable', () => {
      render(
        <TransactionHistoryGrid
          transactions={[
            transaction({ id: 'tx-1', escrowStatus: 'LOCKED' }),
            transaction({ id: 'tx-2', escrowStatus: 'RELEASED' }),
            transaction({ id: 'tx-3', escrowStatus: 'DISPUTED' }),
          ]}
        />,
      );

      const classNames = screen
        .getAllByTestId('card-escrow-status')
        .map((el) => el.className);
      expect(new Set(classNames).size).toBe(3);
    });
  });

  describe('card content', () => {
    it('renders one card per transaction in the given order', () => {
      render(
        <TransactionHistoryGrid
          transactions={[
            transaction({ id: 'tx-1', counterparty: 'Amara Okafor' }),
            transaction({ id: 'tx-2', counterparty: 'Wei Zhang' }),
          ]}
        />,
      );

      const rendered = cards();
      expect(rendered).toHaveLength(2);
      expect(rendered[0]).toHaveTextContent('Amara Okafor');
      expect(rendered[1]).toHaveTextContent('Wei Zhang');
    });

    it('shows the reference, corridor and date', () => {
      render(<TransactionHistoryGrid transactions={[transaction()]} />);

      const card = firstCard();
      expect(card.getByTestId('card-reference')).toHaveTextContent(
        'SC-20260425-0001',
      );
      expect(card.getByTestId('card-corridor')).toHaveTextContent('NG → GB');
      expect(card.getByTestId('card-date')).toHaveTextContent('Apr 25, 2026');
    });

    it('renders a placeholder for an unparseable timestamp', () => {
      render(
        <TransactionHistoryGrid
          transactions={[transaction({ createdAt: 'not-a-date' })]}
        />,
      );

      expect(firstCard().getByTestId('card-date')).toHaveTextContent('—');
    });

    it('labels the grid for assistive technology', () => {
      render(<TransactionHistoryGrid transactions={[transaction()]} />);

      expect(
        screen.getByRole('list', { name: 'Cross-border transactions' }),
      ).toBeInTheDocument();
    });

    it('passes the selected transaction to the details handler', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();
      const tx = transaction({ id: 'tx-9' });

      render(
        <TransactionHistoryGrid transactions={[tx]} onSelect={onSelect} />,
      );

      await user.click(screen.getByRole('button', { name: 'View details' }));

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(tx);
    });

    it('omits the details action when no handler is supplied', () => {
      render(<TransactionHistoryGrid transactions={[transaction()]} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('renders an empty state instead of a bare grid', () => {
      render(<TransactionHistoryGrid transactions={[]} />);

      expect(
        screen.getByText('No cross-border transactions yet'),
      ).toBeInTheDocument();
      expect(cards()).toHaveLength(0);
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });
});
