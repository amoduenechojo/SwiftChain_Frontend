import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JobFilters } from '@/features/driver/components/JobFilters';
import { useJobFilters, EMPTY_JOB_FILTERS, type JobFilterState } from '@/hooks/useJobFilters';
import type { DeliveryJob } from '@/services/driverJobService';

const handlers = {
  onQueryChange: jest.fn(),
  onLocationChange: jest.fn(),
  onCargoTypeChange: jest.fn(),
  onResetFilters: jest.fn(),
};

function renderFilters(overrides: Partial<React.ComponentProps<typeof JobFilters>> = {}) {
  return render(
    <JobFilters
      filters={EMPTY_JOB_FILTERS}
      hasActiveFilters={false}
      availableLocations={['Abuja', 'Lagos']}
      resultCount={0}
      {...handlers}
      {...overrides}
    />,
  );
}

describe('JobFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the keyword, location and cargo type controls', () => {
      renderFilters();

      expect(screen.getByRole('combobox', { name: 'Location' })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: 'Cargo type' })).toBeInTheDocument();
      expect(screen.getByLabelText('Keyword')).toBeInTheDocument();
    });

    it('lists the supplied locations alongside an "all locations" option', () => {
      renderFilters();

      const options = screen.getAllByRole('option').map((option) => option.textContent);
      expect(options).toEqual(
        expect.arrayContaining(['All locations', 'Abuja', 'Lagos', 'All cargo types', 'Fragile']),
      );
    });

    it('renders a human-readable label for every cargo type', () => {
      renderFilters();

      const cargoSelect = screen.getByRole('combobox', { name: 'Cargo type' });
      const labels = Array.from(cargoSelect.querySelectorAll('option')).map(
        (option) => option.textContent,
      );
      expect(labels).toEqual([
        'All cargo types',
        'General',
        'Fragile',
        'Perishable',
        'Hazardous',
        'Oversized',
        'Refrigerated',
      ]);
    });

    it('renders the current filter values as the selected options', () => {
      const filters: JobFilterState = { query: 'crate', location: 'Lagos', cargoType: 'fragile' };
      renderFilters({ filters, hasActiveFilters: true, resultCount: 2 });

      expect(screen.getByRole('combobox', { name: 'Location' })).toHaveValue('Lagos');
      expect(screen.getByRole('combobox', { name: 'Cargo type' })).toHaveValue('fragile');
      expect(screen.getByLabelText('Keyword')).toHaveValue('crate');
    });

    it('renders an empty location dropdown gracefully', () => {
      renderFilters({ availableLocations: [] });

      const locationSelect = screen.getByRole('combobox', { name: 'Location' });
      expect(locationSelect.querySelectorAll('option')).toHaveLength(1);
      expect(screen.getByRole('option', { name: 'All locations' })).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('reports a location selection', async () => {
      const user = userEvent.setup();
      renderFilters();

      await user.selectOptions(screen.getByRole('combobox', { name: 'Location' }), 'Lagos');

      expect(handlers.onLocationChange).toHaveBeenCalledWith('Lagos');
    });

    it('reports a cargo type selection', async () => {
      const user = userEvent.setup();
      renderFilters();

      await user.selectOptions(screen.getByRole('combobox', { name: 'Cargo type' }), 'refrigerated');

      expect(handlers.onCargoTypeChange).toHaveBeenCalledWith('refrigerated');
    });

    it('reports clearing a select back to the "all" option', async () => {
      const user = userEvent.setup();
      renderFilters({
        filters: { ...EMPTY_JOB_FILTERS, cargoType: 'fragile' },
        hasActiveFilters: true,
      });

      await user.selectOptions(screen.getByRole('combobox', { name: 'Cargo type' }), '');

      expect(handlers.onCargoTypeChange).toHaveBeenCalledWith('');
    });

    it('reports each keystroke in the keyword field', async () => {
      const user = userEvent.setup();
      renderFilters();

      await user.type(screen.getByLabelText('Keyword'), 'ab');

      expect(handlers.onQueryChange).toHaveBeenCalledTimes(2);
      expect(handlers.onQueryChange).toHaveBeenLastCalledWith('b');
    });
  });

  describe('active filter summary', () => {
    it('is hidden while no filter is active', () => {
      renderFilters({ hasActiveFilters: false });

      expect(screen.queryByTestId('filter-result-count')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Clear all filters' })).not.toBeInTheDocument();
    });

    it('shows the match count and pluralises it', () => {
      const { rerender } = renderFilters({ hasActiveFilters: true, resultCount: 1 });
      expect(screen.getByTestId('filter-result-count')).toHaveTextContent('1 matching job');

      rerender(
        <JobFilters
          filters={EMPTY_JOB_FILTERS}
          hasActiveFilters
          availableLocations={['Lagos']}
          resultCount={3}
          {...handlers}
        />,
      );
      expect(screen.getByTestId('filter-result-count')).toHaveTextContent('3 matching jobs');
    });

    it('shows a zero count when nothing matches', () => {
      renderFilters({ hasActiveFilters: true, resultCount: 0 });

      expect(screen.getByTestId('filter-result-count')).toHaveTextContent('0 matching jobs');
    });

    it('reports a request to clear all filters', async () => {
      const user = userEvent.setup();
      renderFilters({ hasActiveFilters: true, resultCount: 2 });

      await user.click(screen.getByRole('button', { name: 'Clear all filters' }));

      expect(handlers.onResetFilters).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration with useJobFilters', () => {
    const JOBS: DeliveryJob[] = [
      {
        id: '1',
        pickupAddress: 'Ikeja Depot',
        dropoffAddress: 'Yaba Hub',
        packageDescription: 'Office chairs',
        estimatedDistance: 10,
        estimatedEarnings: 30,
        region: 'Lagos',
        cargoType: 'general',
        createdAt: '2026-02-01T09:00:00.000Z',
        status: 'unassigned',
      },
      {
        id: '2',
        pickupAddress: 'Wuse Market',
        dropoffAddress: 'Garki Plaza',
        packageDescription: 'Glassware crate',
        estimatedDistance: 6,
        estimatedEarnings: 22,
        region: 'Abuja',
        cargoType: 'fragile',
        createdAt: '2026-02-01T10:00:00.000Z',
        status: 'unassigned',
      },
    ];

    function Marketplace() {
      const [jobs] = useState(JOBS);
      const {
        filters,
        filteredJobs,
        hasActiveFilters,
        availableLocations,
        setQuery,
        setLocation,
        setCargoType,
        resetFilters,
      } = useJobFilters(jobs);

      return (
        <div>
          <JobFilters
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            availableLocations={availableLocations}
            resultCount={filteredJobs.length}
            onQueryChange={setQuery}
            onLocationChange={setLocation}
            onCargoTypeChange={setCargoType}
            onResetFilters={resetFilters}
          />
          <ul>
            {filteredJobs.map((entry) => (
              <li key={entry.id}>{entry.packageDescription}</li>
            ))}
          </ul>
        </div>
      );
    }

    it('narrows the visible jobs as filters are applied and restores them on reset', async () => {
      const user = userEvent.setup();
      render(<Marketplace />);

      expect(screen.getByText('Office chairs')).toBeInTheDocument();
      expect(screen.getByText('Glassware crate')).toBeInTheDocument();

      await user.selectOptions(screen.getByRole('combobox', { name: 'Location' }), 'Abuja');

      expect(screen.queryByText('Office chairs')).not.toBeInTheDocument();
      expect(screen.getByText('Glassware crate')).toBeInTheDocument();
      expect(screen.getByTestId('filter-result-count')).toHaveTextContent('1 matching job');

      await user.selectOptions(screen.getByRole('combobox', { name: 'Cargo type' }), 'general');

      expect(screen.queryByText('Glassware crate')).not.toBeInTheDocument();
      expect(screen.getByTestId('filter-result-count')).toHaveTextContent('0 matching jobs');

      await user.click(screen.getByRole('button', { name: 'Clear all filters' }));

      expect(screen.getByText('Office chairs')).toBeInTheDocument();
      expect(screen.getByText('Glassware crate')).toBeInTheDocument();
      expect(screen.queryByTestId('filter-result-count')).not.toBeInTheDocument();
    });
  });
});
