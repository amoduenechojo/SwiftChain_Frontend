'use client';

import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import { CARGO_TYPES, type CargoType } from '@/services/driverJobService';
import type { JobFilterState } from '@/hooks/useJobFilters';

interface JobFiltersProps {
  filters: JobFilterState;
  hasActiveFilters: boolean;
  /** Regions offered in the location dropdown, derived from the current pool. */
  availableLocations: string[];
  /** Number of jobs left after filtering — surfaced so drivers see the effect. */
  resultCount: number;
  onQueryChange: (query: string) => void;
  onLocationChange: (location: string) => void;
  onCargoTypeChange: (cargoType: CargoType | '') => void;
  onResetFilters: () => void;
}

const CARGO_TYPE_LABELS: Record<CargoType, string> = {
  general: 'General',
  fragile: 'Fragile',
  perishable: 'Perishable',
  hazardous: 'Hazardous',
  oversized: 'Oversized',
  refrigerated: 'Refrigerated',
};

/**
 * JobFilters — advanced search controls for the driver job marketplace.
 *
 * Presentational only: every value is owned by `useJobFilters`, so the control
 * strip stays in lock-step with the filtered list rendered beside it.
 */
export function JobFilters({
  filters,
  hasActiveFilters,
  availableLocations,
  resultCount,
  onQueryChange,
  onLocationChange,
  onCargoTypeChange,
  onResetFilters,
}: JobFiltersProps) {
  return (
    <section
      aria-label="Job search filters"
      className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-gray-500" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Refine your search</h2>
      </div>

      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label
            htmlFor="job-search"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Keyword
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
            <input
              id="job-search"
              type="search"
              value={filters.query}
              placeholder="e.g., pallet of books"
              onChange={(event) => onQueryChange(event.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-transparent focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1">
          <label
            htmlFor="job-location"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Location
          </label>
          <div className="relative">
            <select
              id="job-location"
              value={filters.location}
              onChange={(event) => onLocationChange(event.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-transparent focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All locations</option>
              {availableLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="flex-1">
          <label
            htmlFor="job-cargo-type"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Cargo type
          </label>
          <div className="relative">
            <select
              id="job-cargo-type"
              value={filters.cargoType}
              onChange={(event) => onCargoTypeChange(event.target.value as CargoType | '')}
              className="w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-transparent focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All cargo types</option>
              {CARGO_TYPES.map((cargoType) => (
                <option key={cargoType} value={cargoType}>
                  {CARGO_TYPE_LABELS[cargoType]}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400" data-testid="filter-result-count">
            {resultCount} matching job{resultCount === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            onClick={onResetFilters}
            aria-label="Clear all filters"
            className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Clear All
          </button>
        </div>
      )}
    </section>
  );
}
