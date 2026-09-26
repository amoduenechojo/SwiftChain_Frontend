import api from '@/lib/api';

/** The categories the unified search groups its results into. */
export type SearchCategory = 'deliveries' | 'drivers' | 'transactions';

export const SEARCH_CATEGORIES: SearchCategory[] = ['deliveries', 'drivers', 'transactions'];

export const SEARCH_CATEGORY_LABELS: Record<SearchCategory, string> = {
  deliveries: 'Deliveries',
  drivers: 'Drivers',
  transactions: 'Transactions',
};

export interface SearchResult {
  id: string;
  category: SearchCategory;
  /** Primary line — a tracking number, a driver name, a transaction hash. */
  title: string;
  /** Secondary line — status, region, amount. */
  subtitle?: string;
  /** In-app route the result navigates to when selected. */
  href: string;
}

interface RawSearchResponse {
  results?: unknown;
}

const ROUTE_BY_CATEGORY: Record<SearchCategory, string> = {
  deliveries: '/deliveries',
  drivers: '/fleet/drivers',
  transactions: '/transactions',
};

function isSearchCategory(value: unknown): value is SearchCategory {
  return typeof value === 'string' && (SEARCH_CATEGORIES as string[]).includes(value);
}

/**
 * Normalises one raw record from the search endpoint.
 * Records without an id or an unrecognised category are dropped rather than
 * rendered as a broken row.
 */
function toSearchResult(raw: unknown): SearchResult | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const record = raw as Record<string, unknown>;

  const id = typeof record.id === 'string' ? record.id : null;
  if (!id) return null;
  if (!isSearchCategory(record.category)) return null;

  const category = record.category;

  return {
    id,
    category,
    title: typeof record.title === 'string' && record.title ? record.title : id,
    subtitle: typeof record.subtitle === 'string' ? record.subtitle : undefined,
    href:
      typeof record.href === 'string' && record.href
        ? record.href
        : `${ROUTE_BY_CATEGORY[category]}/${id}`,
  };
}

/**
 * globalSearchService — talks to the unified search endpoint that spans
 * deliveries, drivers and transactions.
 */
export const globalSearchService = {
  async search(query: string, signal?: AbortSignal): Promise<SearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const { data } = await api.get<RawSearchResponse | unknown[]>('/search', {
      params: { q: trimmed },
      signal,
    });

    const rawResults = Array.isArray(data) ? data : ((data as RawSearchResponse)?.results ?? []);
    if (!Array.isArray(rawResults)) return [];

    return rawResults
      .map(toSearchResult)
      .filter((result): result is SearchResult => result !== null);
  },
};
