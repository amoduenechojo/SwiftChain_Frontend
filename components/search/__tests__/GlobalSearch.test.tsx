import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { globalSearchService, type SearchResult } from '@/services/globalSearchService';

jest.mock('@/services/globalSearchService', () => {
  const actual = jest.requireActual('@/services/globalSearchService');
  return {
    ...actual,
    globalSearchService: { search: jest.fn() },
  };
});

const mockSearch = globalSearchService.search as jest.Mock;

const MIXED_RESULTS: SearchResult[] = [
  { id: 't1', category: 'transactions', title: '0xabc123', subtitle: '250 XLM', href: '/transactions/t1' },
  { id: 'd1', category: 'deliveries', title: 'TRK001', subtitle: 'In transit', href: '/deliveries/d1' },
  { id: 'v1', category: 'drivers', title: 'Ada Obi', subtitle: 'Lagos', href: '/fleet/drivers/v1' },
  { id: 'd2', category: 'deliveries', title: 'TRK002', subtitle: 'Pending', href: '/deliveries/d2' },
];

describe('GlobalSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearch.mockResolvedValue([]);
  });

  it('renders the search field and nothing else before a query is typed', () => {
    render(<GlobalSearch />);

    expect(screen.getByRole('searchbox', { name: 'Global search' })).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
  });

  describe('categorisation', () => {
    it('groups results under Deliveries, Drivers and Transactions headings in order', async () => {
      const user = userEvent.setup();
      mockSearch.mockResolvedValue(MIXED_RESULTS);
      render(<GlobalSearch />);

      await user.type(screen.getByRole('searchbox', { name: 'Global search' }), 'a');

      await waitFor(() => expect(screen.getAllByRole('heading')).toHaveLength(3));
      expect(screen.getAllByRole('heading').map((heading) => heading.textContent)).toEqual([
        'Deliveries',
        'Drivers',
        'Transactions',
      ]);
    });

    it('places each result under its own category', async () => {
      const user = userEvent.setup();
      mockSearch.mockResolvedValue(MIXED_RESULTS);
      render(<GlobalSearch />);

      await user.type(screen.getByRole('searchbox', { name: 'Global search' }), 'a');

      const deliveries = await screen.findByRole('region', { name: 'Deliveries' });
      expect(within(deliveries).getAllByRole('listitem')).toHaveLength(2);
      expect(within(deliveries).getByText('TRK001')).toBeInTheDocument();
      expect(within(deliveries).getByText('TRK002')).toBeInTheDocument();

      const drivers = screen.getByRole('region', { name: 'Drivers' });
      expect(within(drivers).getAllByRole('listitem')).toHaveLength(1);
      expect(within(drivers).getByText('Ada Obi')).toBeInTheDocument();

      const transactions = screen.getByRole('region', { name: 'Transactions' });
      expect(within(transactions).getByText('0xabc123')).toBeInTheDocument();
      expect(within(transactions).queryByText('TRK001')).not.toBeInTheDocument();
    });

    it('renders the subtitle alongside each result title', async () => {
      const user = userEvent.setup();
      mockSearch.mockResolvedValue(MIXED_RESULTS);
      render(<GlobalSearch />);

      await user.type(screen.getByRole('searchbox', { name: 'Global search' }), 'a');

      expect(await screen.findByText('In transit')).toBeInTheDocument();
      expect(screen.getByText('250 XLM')).toBeInTheDocument();
    });

    it('omits a heading for a category with no matches', async () => {
      const user = userEvent.setup();
      mockSearch.mockResolvedValue([MIXED_RESULTS[1]]);
      render(<GlobalSearch />);

      await user.type(screen.getByRole('searchbox', { name: 'Global search' }), 'trk');

      expect(await screen.findByRole('heading', { name: 'Deliveries' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Drivers' })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Transactions' })).not.toBeInTheDocument();
    });

    it('re-categorises when a follow-up query returns a different mix', async () => {
      const user = userEvent.setup();
      mockSearch.mockResolvedValueOnce(MIXED_RESULTS);
      render(<GlobalSearch />);

      const input = screen.getByRole('searchbox', { name: 'Global search' });
      await user.type(input, 'a');
      await waitFor(() => expect(screen.getAllByRole('heading')).toHaveLength(3));

      mockSearch.mockResolvedValueOnce([MIXED_RESULTS[2]]);
      await user.type(input, 'd');

      await waitFor(() => expect(screen.getAllByRole('heading')).toHaveLength(1));
      expect(screen.getByRole('heading', { name: 'Drivers' })).toBeInTheDocument();
      expect(screen.queryByText('TRK001')).not.toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('reports the selected result to the caller', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();
      mockSearch.mockResolvedValue(MIXED_RESULTS);
      render(<GlobalSearch onSelect={onSelect} />);

      await user.type(screen.getByRole('searchbox', { name: 'Global search' }), 'a');
      await user.click(await screen.findByRole('button', { name: /Ada Obi/ }));

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(MIXED_RESULTS[2]);
    });

    it('does not throw when no onSelect handler is supplied', async () => {
      const user = userEvent.setup();
      mockSearch.mockResolvedValue(MIXED_RESULTS);
      render(<GlobalSearch />);

      await user.type(screen.getByRole('searchbox', { name: 'Global search' }), 'a');
      const button = await screen.findByRole('button', { name: /Ada Obi/ });

      await expect(user.click(button)).resolves.not.toThrow();
    });
  });

  describe('states', () => {
    it('shows a loading message while the search is in flight', async () => {
      const user = userEvent.setup();
      let resolveSearch: (value: SearchResult[]) => void = () => {};
      mockSearch.mockReturnValue(
        new Promise<SearchResult[]>((resolve) => {
          resolveSearch = resolve;
        }),
      );
      render(<GlobalSearch />);

      await user.type(screen.getByRole('searchbox', { name: 'Global search' }), 'a');

      expect(await screen.findByText('Searching...')).toBeInTheDocument();

      resolveSearch(MIXED_RESULTS);
      await waitFor(() => expect(screen.queryByText('Searching...')).not.toBeInTheDocument());
    });

    it('shows an empty state when nothing matches', async () => {
      const user = userEvent.setup();
      mockSearch.mockResolvedValue([]);
      render(<GlobalSearch />);

      await user.type(screen.getByRole('searchbox', { name: 'Global search' }), 'zzz');

      expect(await screen.findByText('No results found for "zzz".')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('shows an error state when the search service fails', async () => {
      const user = userEvent.setup();
      mockSearch.mockRejectedValue(new Error('Search service unavailable'));
      render(<GlobalSearch />);

      await user.type(screen.getByRole('searchbox', { name: 'Global search' }), 'a');

      expect(await screen.findByRole('alert')).toHaveTextContent('Search service unavailable');
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('clears the query and results via the clear button', async () => {
      const user = userEvent.setup();
      mockSearch.mockResolvedValue(MIXED_RESULTS);
      render(<GlobalSearch />);

      const input = screen.getByRole('searchbox', { name: 'Global search' });
      await user.type(input, 'a');
      await screen.findByRole('heading', { name: 'Deliveries' });

      await user.click(screen.getByRole('button', { name: 'Clear search' }));

      expect(input).toHaveValue('');
      await waitFor(() => expect(screen.queryByRole('heading')).not.toBeInTheDocument());
    });

    it('does not query the service for whitespace-only input', async () => {
      const user = userEvent.setup();
      render(<GlobalSearch />);

      await user.type(screen.getByRole('searchbox', { name: 'Global search' }), '   ');

      await waitFor(() => expect(mockSearch).not.toHaveBeenCalled());
      expect(screen.queryByText(/No results found/)).not.toBeInTheDocument();
    });
  });
});
