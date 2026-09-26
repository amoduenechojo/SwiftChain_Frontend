import api from '@/lib/api';
import { globalSearchService, SEARCH_CATEGORIES } from '@/services/globalSearchService';

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockGet = api.get as jest.Mock;

describe('globalSearchService.search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exposes the three unified search categories in canonical order', () => {
    expect(SEARCH_CATEGORIES).toEqual(['deliveries', 'drivers', 'transactions']);
  });

  it('requests the search endpoint with the trimmed query', async () => {
    mockGet.mockResolvedValue({ data: { results: [] } });

    await globalSearchService.search('  TRK001  ');

    expect(mockGet).toHaveBeenCalledWith('/search', {
      params: { q: 'TRK001' },
      signal: undefined,
    });
  });

  it('short-circuits an empty query without calling the API', async () => {
    await expect(globalSearchService.search('   ')).resolves.toEqual([]);

    expect(mockGet).not.toHaveBeenCalled();
  });

  it('normalises results from a wrapped response', async () => {
    mockGet.mockResolvedValue({
      data: {
        results: [
          { id: 'd1', category: 'deliveries', title: 'TRK001', subtitle: 'In transit' },
          { id: 'v1', category: 'drivers', title: 'Ada Obi' },
        ],
      },
    });

    await expect(globalSearchService.search('a')).resolves.toEqual([
      {
        id: 'd1',
        category: 'deliveries',
        title: 'TRK001',
        subtitle: 'In transit',
        href: '/deliveries/d1',
      },
      {
        id: 'v1',
        category: 'drivers',
        title: 'Ada Obi',
        subtitle: undefined,
        href: '/fleet/drivers/v1',
      },
    ]);
  });

  it('accepts a bare array response', async () => {
    mockGet.mockResolvedValue({
      data: [{ id: 't1', category: 'transactions', title: '0xabc' }],
    });

    const results = await globalSearchService.search('0x');

    expect(results).toHaveLength(1);
    expect(results[0].href).toBe('/transactions/t1');
  });

  it('keeps an explicit href supplied by the API', async () => {
    mockGet.mockResolvedValue({
      data: { results: [{ id: 'd1', category: 'deliveries', title: 'TRK001', href: '/custom/d1' }] },
    });

    const [result] = await globalSearchService.search('trk');

    expect(result.href).toBe('/custom/d1');
  });

  it('falls back to the id when a record carries no title', async () => {
    mockGet.mockResolvedValue({
      data: { results: [{ id: 'd1', category: 'deliveries' }] },
    });

    const [result] = await globalSearchService.search('d');

    expect(result.title).toBe('d1');
  });

  it('drops malformed records instead of rendering broken rows', async () => {
    mockGet.mockResolvedValue({
      data: {
        results: [
          null,
          'not-an-object',
          { category: 'deliveries', title: 'missing id' },
          { id: 'x1', category: 'unknown-category', title: 'bad category' },
          { id: 'd1', category: 'deliveries', title: 'TRK001' },
        ],
      },
    });

    const results = await globalSearchService.search('a');

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('d1');
  });

  it('returns an empty list when the payload has no results field', async () => {
    mockGet.mockResolvedValue({ data: {} });

    await expect(globalSearchService.search('a')).resolves.toEqual([]);
  });

  it('returns an empty list when results is not an array', async () => {
    mockGet.mockResolvedValue({ data: { results: 'nope' } });

    await expect(globalSearchService.search('a')).resolves.toEqual([]);
  });

  it('propagates transport errors to the caller', async () => {
    mockGet.mockRejectedValue(new Error('Network Error'));

    await expect(globalSearchService.search('a')).rejects.toThrow('Network Error');
  });

  it('forwards an abort signal to the transport', async () => {
    mockGet.mockResolvedValue({ data: { results: [] } });
    const controller = new AbortController();

    await globalSearchService.search('a', controller.signal);

    expect(mockGet).toHaveBeenCalledWith('/search', {
      params: { q: 'a' },
      signal: controller.signal,
    });
  });
});
