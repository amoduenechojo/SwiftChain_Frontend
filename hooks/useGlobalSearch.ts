'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  globalSearchService,
  SEARCH_CATEGORIES,
  SEARCH_CATEGORY_LABELS,
  type SearchCategory,
  type SearchResult,
} from '@/services/globalSearchService';

export interface SearchResultGroup {
  category: SearchCategory;
  label: string;
  results: SearchResult[];
}

export interface UseGlobalSearchResult {
  query: string;
  setQuery: (query: string) => void;
  /** Non-empty categories, always in the canonical Deliveries/Drivers/Transactions order. */
  groups: SearchResultGroup[];
  /** Flat result list, useful for keyboard navigation and counters. */
  results: SearchResult[];
  totalResults: number;
  isLoading: boolean;
  error: string | null;
  /** True once a search has run for a non-empty query and returned nothing. */
  isEmpty: boolean;
  clear: () => void;
}

/** The outcome of the most recently completed search, tagged with its query. */
interface SearchSnapshot {
  query: string;
  results: SearchResult[];
  error: string | null;
}

const EMPTY_SNAPSHOT: SearchSnapshot = { query: '', results: [], error: null };

/**
 * useGlobalSearch — runs the unified search and groups the results by category.
 *
 * The snapshot is tagged with the query that produced it, so every derived value
 * — loading, results, grouping — follows from whether that tag still matches the
 * current query. Results from a superseded query can therefore never be shown,
 * and in-flight requests are aborted as soon as the query moves on.
 */
export function useGlobalSearch(): UseGlobalSearchResult {
  const [query, setQuery] = useState('');
  const [snapshot, setSnapshot] = useState<SearchSnapshot>(EMPTY_SNAPSHOT);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!trimmedQuery) return;

    const controller = new AbortController();

    globalSearchService
      .search(trimmedQuery, controller.signal)
      .then((results) => {
        if (controller.signal.aborted) return;
        setSnapshot({ query: trimmedQuery, results, error: null });
      })
      .catch((searchError: unknown) => {
        if (controller.signal.aborted) return;
        setSnapshot({
          query: trimmedQuery,
          results: [],
          error:
            searchError instanceof Error ? searchError.message : 'Unable to complete the search',
        });
      });

    return () => controller.abort();
  }, [trimmedQuery]);

  // The snapshot only counts while it still describes the query on screen.
  const isSettled = trimmedQuery !== '' && snapshot.query === trimmedQuery;
  const results = useMemo(
    () => (isSettled ? snapshot.results : []),
    [isSettled, snapshot.results],
  );
  const error = isSettled ? snapshot.error : null;

  const groups = useMemo<SearchResultGroup[]>(
    () =>
      SEARCH_CATEGORIES.map((category) => ({
        category,
        label: SEARCH_CATEGORY_LABELS[category],
        results: results.filter((result) => result.category === category),
      })).filter((group) => group.results.length > 0),
    [results],
  );

  const clear = useCallback(() => {
    setQuery('');
    setSnapshot(EMPTY_SNAPSHOT);
  }, []);

  return {
    query,
    setQuery,
    groups,
    results,
    totalResults: results.length,
    isLoading: trimmedQuery !== '' && !isSettled,
    error,
    isEmpty: isSettled && error === null && results.length === 0,
    clear,
  };
}
