import { act, renderHook } from '@testing-library/react';
import { useJobFilters, EMPTY_JOB_FILTERS } from '@/hooks/useJobFilters';
import type { DeliveryJob } from '@/services/driverJobService';

const job = (overrides: Partial<DeliveryJob> & { id: string }): DeliveryJob => ({
  pickupAddress: 'Ikeja Depot',
  dropoffAddress: 'Yaba Hub',
  packageDescription: 'Assorted parcels',
  estimatedDistance: 12,
  estimatedEarnings: 40,
  region: 'Lagos',
  cargoType: 'general',
  createdAt: '2026-02-01T09:00:00.000Z',
  status: 'unassigned',
  ...overrides,
});

const JOBS: DeliveryJob[] = [
  job({ id: '1', region: 'Lagos', cargoType: 'general', packageDescription: 'Office chairs' }),
  job({ id: '2', region: 'Abuja', cargoType: 'fragile', packageDescription: 'Glassware crate' }),
  job({ id: '3', region: 'Lagos', cargoType: 'refrigerated', packageDescription: 'Vaccine cooler' }),
  job({ id: '4', region: 'Kano', cargoType: 'general', packageDescription: 'Cement bags' }),
];

const ids = (jobs: DeliveryJob[]) => jobs.map((entry) => entry.id);

describe('useJobFilters', () => {
  it('starts with no active filters and the full job pool', () => {
    const { result } = renderHook(() => useJobFilters(JOBS));

    expect(result.current.filters).toEqual(EMPTY_JOB_FILTERS);
    expect(result.current.hasActiveFilters).toBe(false);
    expect(ids(result.current.filteredJobs)).toEqual(['1', '2', '3', '4']);
  });

  it('derives the available locations from the pool, de-duplicated and sorted', () => {
    const { result } = renderHook(() => useJobFilters(JOBS));

    expect(result.current.availableLocations).toEqual(['Abuja', 'Kano', 'Lagos']);
  });

  it('derives the available cargo types from the pool, de-duplicated and sorted', () => {
    const { result } = renderHook(() => useJobFilters(JOBS));

    expect(result.current.availableCargoTypes).toEqual(['fragile', 'general', 'refrigerated']);
  });

  it('filters by location', () => {
    const { result } = renderHook(() => useJobFilters(JOBS));

    act(() => result.current.setLocation('Lagos'));

    expect(result.current.filters.location).toBe('Lagos');
    expect(result.current.hasActiveFilters).toBe(true);
    expect(ids(result.current.filteredJobs)).toEqual(['1', '3']);
  });

  it('matches a location against the pickup and drop-off addresses too', () => {
    const { result } = renderHook(() =>
      useJobFilters([
        job({ id: 'a', region: 'Lagos', dropoffAddress: 'Enugu Terminal' }),
        job({ id: 'b', region: 'Lagos', dropoffAddress: 'Yaba Hub' }),
      ]),
    );

    act(() => result.current.setLocation('Enugu'));

    expect(ids(result.current.filteredJobs)).toEqual(['a']);
  });

  it('matches locations case-insensitively and ignores surrounding whitespace', () => {
    const { result } = renderHook(() => useJobFilters(JOBS));

    act(() => result.current.setLocation('  lAgOs  '));

    expect(ids(result.current.filteredJobs)).toEqual(['1', '3']);
  });

  it('filters by cargo type with an exact match', () => {
    const { result } = renderHook(() => useJobFilters(JOBS));

    act(() => result.current.setCargoType('general'));

    expect(ids(result.current.filteredJobs)).toEqual(['1', '4']);
  });

  it('combines the location and cargo type filters with AND', () => {
    const { result } = renderHook(() => useJobFilters(JOBS));

    act(() => result.current.setLocation('Lagos'));
    act(() => result.current.setCargoType('refrigerated'));

    expect(ids(result.current.filteredJobs)).toEqual(['3']);
  });

  it('filters by keyword across the description and addresses', () => {
    const { result } = renderHook(() => useJobFilters(JOBS));

    act(() => result.current.setQuery('vaccine'));

    expect(ids(result.current.filteredJobs)).toEqual(['3']);
  });

  it('keeps each filter independent when another one changes', () => {
    const { result } = renderHook(() => useJobFilters(JOBS));

    act(() => result.current.setLocation('Lagos'));
    act(() => result.current.setCargoType('general'));
    act(() => result.current.setLocation('Kano'));

    expect(result.current.filters).toEqual({ query: '', location: 'Kano', cargoType: 'general' });
    expect(ids(result.current.filteredJobs)).toEqual(['4']);
  });

  it('treats clearing a filter back to its empty value as a no-op filter', () => {
    const { result } = renderHook(() => useJobFilters(JOBS));

    act(() => result.current.setCargoType('fragile'));
    expect(ids(result.current.filteredJobs)).toEqual(['2']);

    act(() => result.current.setCargoType(''));

    expect(result.current.hasActiveFilters).toBe(false);
    expect(ids(result.current.filteredJobs)).toEqual(['1', '2', '3', '4']);
  });

  it('does not treat a whitespace-only keyword as an active filter', () => {
    const { result } = renderHook(() => useJobFilters(JOBS));

    act(() => result.current.setQuery('   '));

    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.filteredJobs).toHaveLength(4);
  });

  it('resets every filter at once', () => {
    const { result } = renderHook(() => useJobFilters(JOBS));

    act(() => result.current.setQuery('cement'));
    act(() => result.current.setLocation('Kano'));
    act(() => result.current.setCargoType('general'));

    act(() => result.current.resetFilters());

    expect(result.current.filters).toEqual(EMPTY_JOB_FILTERS);
    expect(result.current.hasActiveFilters).toBe(false);
    expect(ids(result.current.filteredJobs)).toEqual(['1', '2', '3', '4']);
  });

  it('returns an empty result set when no job matches', () => {
    const { result } = renderHook(() => useJobFilters(JOBS));

    act(() => result.current.setLocation('Lagos'));
    act(() => result.current.setCargoType('hazardous'));

    expect(result.current.filteredJobs).toEqual([]);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('excludes jobs with no cargo type when a cargo type filter is set', () => {
    const { result } = renderHook(() =>
      useJobFilters([job({ id: 'x', cargoType: undefined }), job({ id: 'y', cargoType: 'fragile' })]),
    );

    act(() => result.current.setCargoType('fragile'));

    expect(ids(result.current.filteredJobs)).toEqual(['y']);
  });

  it('handles an empty job pool without throwing', () => {
    const { result } = renderHook(() => useJobFilters([]));

    act(() => result.current.setLocation('Lagos'));

    expect(result.current.filteredJobs).toEqual([]);
    expect(result.current.availableLocations).toEqual([]);
    expect(result.current.availableCargoTypes).toEqual([]);
  });

  it('keeps the active filters applied when the job pool is refreshed', () => {
    const { result, rerender } = renderHook(({ jobs }) => useJobFilters(jobs), {
      initialProps: { jobs: JOBS },
    });

    act(() => result.current.setCargoType('general'));
    expect(ids(result.current.filteredJobs)).toEqual(['1', '4']);

    rerender({ jobs: [...JOBS, job({ id: '5', region: 'Jos', cargoType: 'general' })] });

    expect(result.current.filters.cargoType).toBe('general');
    expect(ids(result.current.filteredJobs)).toEqual(['1', '4', '5']);
  });
});
