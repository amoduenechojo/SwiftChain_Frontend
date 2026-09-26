import { act, renderHook } from '@testing-library/react';
import {
  useTransactionExport,
  buildTransactionCsvFilename,
  TRANSACTION_CSV_COLUMNS,
} from '@/hooks/useTransactionExport';
import { downloadCsv, toCsv } from '@/lib/csvExport';
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
    hash: 'abc123def456789',
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
    hash: 'fed987cba654321',
    date: '2026-02-02T11:30:00.000Z',
    type: 'ESCROW_RELEASE',
    amount: 250,
    currency: 'XLM',
    status: 'PENDING',
  },
];

describe('buildTransactionCsvFilename', () => {
  it('stamps the filename with the export date', () => {
    expect(buildTransactionCsvFilename(new Date('2026-02-01T10:00:00.000Z'))).toBe(
      'swiftchain-transactions-2026-02-01.csv',
    );
  });
});

describe('TRANSACTION_CSV_COLUMNS', () => {
  it('mirrors the table columns plus the fields only present in the export', () => {
    expect(TRANSACTION_CSV_COLUMNS.map((column) => column.header)).toEqual([
      'Date',
      'Transaction Hash',
      'Type',
      'Amount',
      'Currency',
      'Status',
      'Counterparty',
      'Delivery ID',
    ]);
  });
});

describe('useTransactionExport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-02-03T08:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts idle', () => {
    const { result } = renderHook(() => useTransactionExport());

    expect(result.current.isExporting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.didExport).toBe(false);
  });

  it('serialises the supplied rows and hands them to the downloader', () => {
    const { result } = renderHook(() => useTransactionExport());

    act(() => result.current.exportToCsv(TRANSACTIONS));

    expect(mockDownloadCsv).toHaveBeenCalledTimes(1);
    const [content, filename] = mockDownloadCsv.mock.calls[0];
    expect(filename).toBe('swiftchain-transactions-2026-02-03.csv');
    expect(content).toBe(toCsv(TRANSACTIONS, TRANSACTION_CSV_COLUMNS));
  });

  it('writes a header row and one line per transaction', () => {
    const { result } = renderHook(() => useTransactionExport());

    act(() => result.current.exportToCsv(TRANSACTIONS));

    const lines = (mockDownloadCsv.mock.calls[0][0] as string).split('\r\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(
      'Date,Transaction Hash,Type,Amount,Currency,Status,Counterparty,Delivery ID',
    );
    expect(lines[1]).toBe(
      '2026-02-01T10:00:00.000Z,abc123def456789,ESCROW_LOCK,250,XLM,SUCCESS,Ada Obi,del-1',
    );
  });

  it('leaves optional fields as empty cells', () => {
    const { result } = renderHook(() => useTransactionExport());

    act(() => result.current.exportToCsv(TRANSACTIONS));

    const lines = (mockDownloadCsv.mock.calls[0][0] as string).split('\r\n');
    expect(lines[2]).toBe(
      '2026-02-02T11:30:00.000Z,fed987cba654321,ESCROW_RELEASE,250,XLM,PENDING,,',
    );
  });

  it('escapes a counterparty containing a comma', () => {
    const { result } = renderHook(() => useTransactionExport());

    act(() =>
      result.current.exportToCsv([{ ...TRANSACTIONS[0], counterparty: 'Obi, Ada' }]),
    );

    expect(mockDownloadCsv.mock.calls[0][0]).toContain('"Obi, Ada"');
  });

  it('flags a successful export', () => {
    const { result } = renderHook(() => useTransactionExport());

    act(() => result.current.exportToCsv(TRANSACTIONS));

    expect(result.current.didExport).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isExporting).toBe(false);
  });

  it('refuses to export an empty table', () => {
    const { result } = renderHook(() => useTransactionExport());

    act(() => result.current.exportToCsv([]));

    expect(mockDownloadCsv).not.toHaveBeenCalled();
    expect(result.current.error).toBe('There is nothing to export.');
    expect(result.current.didExport).toBe(false);
  });

  it('surfaces a downloader failure', () => {
    mockDownloadCsv.mockImplementationOnce(() => {
      throw new Error('Download blocked by the browser');
    });
    const { result } = renderHook(() => useTransactionExport());

    act(() => result.current.exportToCsv(TRANSACTIONS));

    expect(result.current.error).toBe('Download blocked by the browser');
    expect(result.current.didExport).toBe(false);
    expect(result.current.isExporting).toBe(false);
  });

  it('falls back to a generic message for a non-Error failure', () => {
    mockDownloadCsv.mockImplementationOnce(() => {
      throw 'boom';
    });
    const { result } = renderHook(() => useTransactionExport());

    act(() => result.current.exportToCsv(TRANSACTIONS));

    expect(result.current.error).toBe('Failed to generate the CSV file');
  });

  it('clears a previous error on the next attempt', () => {
    const { result } = renderHook(() => useTransactionExport());

    act(() => result.current.exportToCsv([]));
    expect(result.current.error).not.toBeNull();

    act(() => result.current.exportToCsv(TRANSACTIONS));

    expect(result.current.error).toBeNull();
    expect(result.current.didExport).toBe(true);
  });

  it('clears the error on demand', () => {
    const { result } = renderHook(() => useTransactionExport());

    act(() => result.current.exportToCsv([]));
    act(() => result.current.clearError());

    expect(result.current.error).toBeNull();
  });

  it('exports only the rows it is given, not a wider dataset', () => {
    const { result } = renderHook(() => useTransactionExport());

    act(() => result.current.exportToCsv([TRANSACTIONS[1]]));

    const content = mockDownloadCsv.mock.calls[0][0] as string;
    expect(content.split('\r\n')).toHaveLength(2);
    expect(content).toContain('fed987cba654321');
    expect(content).not.toContain('abc123def456789');
  });
});
