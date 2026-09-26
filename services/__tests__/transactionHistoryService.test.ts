import api from '@/lib/api';
import { transactionHistoryService } from '@/services/transactionHistoryService';

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockGet = api.get as jest.Mock;

describe('transactionHistoryService.getTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reads the transaction history endpoint', async () => {
    mockGet.mockResolvedValue({ data: { success: true, data: [] } });

    await transactionHistoryService.getTransactions();

    expect(mockGet).toHaveBeenCalledWith('/transactions');
  });

  it('returns the payload on success', async () => {
    const payload = {
      success: true,
      data: [
        {
          id: 'tx-1',
          hash: 'abc123',
          date: '2026-02-01T10:00:00.000Z',
          type: 'ESCROW_LOCK',
          amount: 250,
          currency: 'XLM',
          status: 'SUCCESS',
        },
      ],
    };
    mockGet.mockResolvedValue({ data: payload });

    await expect(transactionHistoryService.getTransactions()).resolves.toEqual(payload);
  });

  it('converts a transport failure into an unsuccessful response', async () => {
    mockGet.mockRejectedValue(new Error('Network Error'));

    await expect(transactionHistoryService.getTransactions()).resolves.toEqual({
      success: false,
      message: 'Network Error',
    });
  });

  it('falls back to a generic message for a non-Error rejection', async () => {
    mockGet.mockRejectedValue('boom');

    await expect(transactionHistoryService.getTransactions()).resolves.toEqual({
      success: false,
      message: 'Failed to load transaction history',
    });
  });
});
