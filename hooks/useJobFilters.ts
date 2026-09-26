'use client';

import { useCallback, useMemo, useState } from 'react';
import type { CargoType, DeliveryJob } from '@/services/driverJobService';

export interface JobFilterState {
  /** Free-text keyword matched against the description and both addresses. */
  query: string;
  /** Region or address fragment. Empty string means "any location". */
  location: string;
  /** Exact cargo type. Empty string means "any cargo type". */
  cargoType: CargoType | '';
}

export const EMPTY_JOB_FILTERS: JobFilterState = {
  query: '',
  location: '',
  cargoType: '',
};

export interface UseJobFiltersResult {
  filters: JobFilterState;
  /** Jobs left after every active filter has been applied. */
  filteredJobs: DeliveryJob[];
  /** True when at least one filter narrows the result set. */
  hasActiveFilters: boolean;
  /** Distinct regions present in the supplied jobs, alphabetically sorted. */
  availableLocations: string[];
  /** Distinct cargo types present in the supplied jobs, alphabetically sorted. */
  availableCargoTypes: CargoType[];
  setQuery: (query: string) => void;
  setLocation: (location: string) => void;
  setCargoType: (cargoType: CargoType | '') => void;
  resetFilters: () => void;
}

const normalize = (value: string) => value.trim().toLowerCase();

function matchesLocation(job: DeliveryJob, location: string): boolean {
  const needle = normalize(location);
  if (!needle) return true;
  return [job.region, job.pickupAddress, job.dropoffAddress].some((field) =>
    normalize(field ?? '').includes(needle),
  );
}

function matchesQuery(job: DeliveryJob, query: string): boolean {
  const needle = normalize(query);
  if (!needle) return true;
  return [job.packageDescription, job.pickupAddress, job.dropoffAddress].some((field) =>
    normalize(field ?? '').includes(needle),
  );
}

function matchesCargoType(job: DeliveryJob, cargoType: CargoType | ''): boolean {
  if (!cargoType) return true;
  return job.cargoType === cargoType;
}

/**
 * useJobFilters — owns the advanced-search state for the driver job marketplace.
 *
 * Filtering happens client-side over the pool the board already holds, so
 * changing a filter never triggers a refetch and the driver keeps their place
 * in the list. Filters combine with AND; each unset filter is a no-op.
 */
export function useJobFilters(jobs: DeliveryJob[]): UseJobFiltersResult {
  const [filters, setFilters] = useState<JobFilterState>(EMPTY_JOB_FILTERS);

  const setQuery = useCallback((query: string) => {
    setFilters((current) => ({ ...current, query }));
  }, []);

  const setLocation = useCallback((location: string) => {
    setFilters((current) => ({ ...current, location }));
  }, []);

  const setCargoType = useCallback((cargoType: CargoType | '') => {
    setFilters((current) => ({ ...current, cargoType }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_JOB_FILTERS);
  }, []);

  const availableLocations = useMemo(
    () =>
      Array.from(
        new Set(jobs.map((job) => job.region).filter((region): region is string => Boolean(region))),
      ).sort((a, b) => a.localeCompare(b)),
    [jobs],
  );

  const availableCargoTypes = useMemo(
    () =>
      Array.from(
        new Set(
          jobs
            .map((job) => job.cargoType)
            .filter((cargoType): cargoType is CargoType => Boolean(cargoType)),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [jobs],
  );

  const filteredJobs = useMemo(
    () =>
      jobs.filter(
        (job) =>
          matchesQuery(job, filters.query) &&
          matchesLocation(job, filters.location) &&
          matchesCargoType(job, filters.cargoType),
      ),
    [jobs, filters],
  );

  const hasActiveFilters =
    normalize(filters.query) !== '' || normalize(filters.location) !== '' || filters.cargoType !== '';

  return {
    filters,
    filteredJobs,
    hasActiveFilters,
    availableLocations,
    availableCargoTypes,
    setQuery,
    setLocation,
    setCargoType,
    resetFilters,
  };
}
