/**
 * CurrencyConverter component tests.
 *
 * The widget polls the XLM rate endpoint on a fixed interval, so the focus
 * here is on *when* the refetch fires: on mount, once per interval, on a
 * currency switch, and never after unmount. Timers are faked and the rate
 * service is mocked so the suite is deterministic and never touches network.
 */

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CurrencyConverter } from '@/features/deliveries/components/CurrencyConverter';
import { currencyRateService } from '@/services/currencyRateService';

jest.mock('@/services/currencyRateService', () => ({
  currencyRateService: {
    getXlmRate: jest.fn(),
  },
}));

const getXlmRate = currencyRateService.getXlmRate as jest.Mock;

/** Matches REFRESH_INTERVAL_MS in useCurrencyConverter. */
const POLL_INTERVAL_MS = 30_000;

function rate(xlmRate: number, fiat = 'USD', updatedAt = '2026-04-25T10:00:00.000Z') {
  return { fiat, xlmRate, updatedAt };
}

function renderConverter() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <CurrencyConverter />
    </QueryClientProvider>,
  );

  return { ...utils, queryClient };
}

/** Advances fake timers and flushes the promises the refetch chains on. */
async function advance(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

/** Lets the initial mount fetch settle before assertions. */
async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

function amountInput() {
  return screen.getByPlaceholderText(/Enter amount in/i);
}

describe('CurrencyConverter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    getXlmRate.mockResolvedValue(rate(0.5));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('rate polling', () => {
    it('fetches the rate once on mount for the default currency', async () => {
      renderConverter();
      await flush();

      expect(getXlmRate).toHaveBeenCalledTimes(1);
      expect(getXlmRate).toHaveBeenCalledWith('USD');
    });

    it('does not refetch before the polling interval elapses', async () => {
      renderConverter();
      await flush();
      expect(getXlmRate).toHaveBeenCalledTimes(1);

      await advance(POLL_INTERVAL_MS - 1);

      expect(getXlmRate).toHaveBeenCalledTimes(1);
    });

    it('refetches exactly once per polling interval', async () => {
      renderConverter();
      await flush();

      await advance(POLL_INTERVAL_MS);
      expect(getXlmRate).toHaveBeenCalledTimes(2);

      await advance(POLL_INTERVAL_MS);
      expect(getXlmRate).toHaveBeenCalledTimes(3);
    });

    it('keeps polling steadily over several intervals', async () => {
      renderConverter();
      await flush();

      for (let i = 0; i < 4; i += 1) {
        await advance(POLL_INTERVAL_MS);
      }

      // 1 mount fetch + 4 interval refetches.
      expect(getXlmRate).toHaveBeenCalledTimes(5);
    });

    it('renders the newest rate returned by a poll', async () => {
      getXlmRate.mockResolvedValueOnce(rate(0.5));
      renderConverter();

      fireEvent.change(amountInput(), { target: { value: '10' } });
      await waitFor(() => {
        expect(screen.getByText(/20\.000000 XLM/)).toBeInTheDocument();
      });

      getXlmRate.mockResolvedValue(rate(0.25));
      await advance(POLL_INTERVAL_MS);

      await waitFor(() => {
        expect(screen.getByText(/40\.000000 XLM/)).toBeInTheDocument();
      });
    });

    it('stops polling once the widget unmounts', async () => {
      const { unmount } = renderConverter();
      await flush();
      expect(getXlmRate).toHaveBeenCalledTimes(1);

      unmount();
      await advance(POLL_INTERVAL_MS * 3);

      expect(getXlmRate).toHaveBeenCalledTimes(1);
    });

    it('polls the newly selected currency after a switch', async () => {
      renderConverter();
      await flush();

      fireEvent.change(screen.getByLabelText(/Local currency/i), {
        target: { value: 'NGN' },
      });
      await waitFor(() => {
        expect(getXlmRate).toHaveBeenCalledWith('NGN');
      });

      const callsBefore = getXlmRate.mock.calls.length;
      await advance(POLL_INTERVAL_MS);

      expect(getXlmRate).toHaveBeenCalledTimes(callsBefore + 1);
      expect(getXlmRate).toHaveBeenLastCalledWith('NGN');
    });

    it('keeps polling after a failed request so the rate can recover', async () => {
      getXlmRate.mockRejectedValue(new Error('Rate API unavailable'));
      renderConverter();

      await waitFor(() => {
        expect(screen.getByText(/Rate unavailable, try again\./i)).toBeInTheDocument();
      });
      const callsAfterFailure = getXlmRate.mock.calls.length;

      getXlmRate.mockResolvedValue(rate(0.5));
      await advance(POLL_INTERVAL_MS);

      expect(getXlmRate.mock.calls.length).toBeGreaterThan(callsAfterFailure);
      await waitFor(() => {
        expect(
          screen.queryByText(/Rate unavailable, try again\./i),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('happy path rendering', () => {
    it('shows a loading message until the first rate resolves', async () => {
      let resolveRate: (_value: unknown) => void = () => {};
      getXlmRate.mockReturnValue(
        new Promise((resolve) => {
          resolveRate = resolve;
        }),
      );

      renderConverter();

      expect(screen.getByText(/Loading current exchange rate/i)).toBeInTheDocument();

      await act(async () => {
        resolveRate(rate(0.5));
      });

      await waitFor(() => {
        expect(
          screen.queryByText(/Loading current exchange rate/i),
        ).not.toBeInTheDocument();
      });
    });

    it('renders the live rate and last updated timestamp', async () => {
      renderConverter();

      await waitFor(() => {
        expect(screen.getByText(/1 XLM = 0\.500000 USD/)).toBeInTheDocument();
      });
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });

    it('offers every supported fiat currency', async () => {
      renderConverter();
      await flush();

      const select = screen.getByLabelText(/Local currency/i) as HTMLSelectElement;
      expect(
        Array.from(select.options).map((option) => option.value),
      ).toEqual(['USD', 'EUR', 'NGN', 'KES', 'GHS']);
    });

    it('recalculates the estimate as the user edits the amount', async () => {
      renderConverter();
      await waitFor(() => {
        expect(screen.getByText(/1 XLM = 0\.500000 USD/)).toBeInTheDocument();
      });

      fireEvent.change(amountInput(), { target: { value: '10' } });
      expect(screen.getByText(/20\.000000 XLM/)).toBeInTheDocument();

      fireEvent.change(amountInput(), { target: { value: '2.5' } });
      expect(screen.getByText(/5\.000000 XLM/)).toBeInTheDocument();
    });

    it('relabels the amount field for the selected currency', async () => {
      renderConverter();
      await flush();

      fireEvent.change(screen.getByLabelText(/Local currency/i), {
        target: { value: 'KES' },
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter amount in KES')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('shows a fallback message when the rate lookup fails', async () => {
      getXlmRate.mockRejectedValue(new Error('Rate API unavailable'));
      renderConverter();

      await waitFor(() => {
        expect(screen.getByText(/Rate unavailable, try again\./i)).toBeInTheDocument();
      });
      expect(screen.queryByText(/Estimated total/i)).not.toBeInTheDocument();
    });

    it('retries on demand and recovers when the endpoint comes back', async () => {
      getXlmRate.mockRejectedValue(new Error('Rate API unavailable'));
      renderConverter();

      const retry = await screen.findByRole('button', { name: /Retry rate lookup/i });

      getXlmRate.mockResolvedValue(rate(0.5));
      await act(async () => {
        fireEvent.click(retry);
      });

      await waitFor(() => {
        expect(screen.getByText(/1 XLM = 0\.500000 USD/)).toBeInTheDocument();
      });
      expect(
        screen.queryByText(/Rate unavailable, try again\./i),
      ).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('treats an empty amount as zero rather than NaN', async () => {
      renderConverter();
      await waitFor(() => {
        expect(screen.getByText(/1 XLM = 0\.500000 USD/)).toBeInTheDocument();
      });

      fireEvent.change(amountInput(), { target: { value: '' } });

      expect(screen.getByText(/0\.000000 XLM/)).toBeInTheDocument();
    });

    it('clamps a negative amount to zero', async () => {
      renderConverter();
      await waitFor(() => {
        expect(screen.getByText(/1 XLM = 0\.500000 USD/)).toBeInTheDocument();
      });

      fireEvent.change(amountInput(), { target: { value: '-25' } });

      expect(screen.getByText(/0\.000000 XLM/)).toBeInTheDocument();
    });

    it('renders no estimate when the API reports a zero rate', async () => {
      getXlmRate.mockResolvedValue(rate(0));
      renderConverter();
      await flush();

      fireEvent.change(amountInput(), { target: { value: '10' } });

      await waitFor(() => {
        expect(screen.queryByText(/Estimated total/i)).not.toBeInTheDocument();
      });
    });

    it('handles a very small rate without losing precision in the estimate', async () => {
      getXlmRate.mockResolvedValue(rate(0.000002));
      renderConverter();
      await waitFor(() => {
        expect(screen.getByText(/1 XLM = 0\.000002 USD/)).toBeInTheDocument();
      });

      fireEvent.change(amountInput(), { target: { value: '1' } });

      expect(screen.getByText(/500000\.000000 XLM/)).toBeInTheDocument();
    });
  });
});
