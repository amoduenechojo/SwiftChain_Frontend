'use client';

import { Search, X } from 'lucide-react';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import type { SearchResult } from '@/services/globalSearchService';

interface GlobalSearchProps {
  /** Called with the selected result — typically routes to `result.href`. */
  onSelect?: (result: SearchResult) => void;
}

/**
 * GlobalSearch — unified search across deliveries, drivers and transactions.
 *
 * Results arrive as one flat list and are rendered under a heading per category,
 * always in the canonical order, with empty categories omitted entirely.
 */
export function GlobalSearch({ onSelect }: GlobalSearchProps) {
  const { query, setQuery, groups, totalResults, isLoading, error, isEmpty, clear } =
    useGlobalSearch();

  return (
    <div className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search deliveries, drivers, transactions..."
          aria-label="Global search"
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm focus:border-transparent focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute right-3 top-3 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="mt-3">
        {isLoading && (
          <p role="status" aria-live="polite" className="p-4 text-sm text-gray-500 dark:text-gray-400">
            Searching...
          </p>
        )}

        {!isLoading && error && (
          <p role="alert" className="p-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {!isLoading && !error && isEmpty && (
          <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No results found for &quot;{query.trim()}&quot;.
          </p>
        )}

        {!isLoading && !error && totalResults > 0 && (
          <div>
            <p className="sr-only" role="status" aria-live="polite">
              {totalResults} result{totalResults === 1 ? '' : 's'} found
            </p>
            {groups.map((group) => (
              <section key={group.category} aria-labelledby={`search-group-${group.category}`}>
                <h3
                  id={`search-group-${group.category}`}
                  className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400"
                >
                  {group.label}
                </h3>
                <ul>
                  {group.results.map((result) => (
                    <li key={`${result.category}-${result.id}`}>
                      <button
                        type="button"
                        onClick={() => onSelect?.(result)}
                        className="flex w-full flex-col items-start rounded-lg px-4 py-2.5 text-left text-sm transition hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          {result.title}
                        </span>
                        {result.subtitle && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {result.subtitle}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
