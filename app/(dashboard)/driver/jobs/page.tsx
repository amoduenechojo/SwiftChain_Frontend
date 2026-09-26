'use client';

import { useState } from 'react';
import { Briefcase, RefreshCw } from 'lucide-react';
import { useDriverJobs } from '@/hooks/useDriverJobs';
import { JobCard } from '@/features/driver/components/JobCard';
import { AcceptJobModal } from '@/features/driver/components/AcceptJobModal';
import { JobFilters } from '@/features/driver/components/JobFilters';
import { useJobFilters } from '@/hooks/useJobFilters';
import { DeliveryJob } from '@/services/driverJobService';

/**
 * DriverJobBoardPage — marketplace view for drivers to browse and accept
 * unassigned deliveries in their region.
 *
 * Route: /driver/jobs
 */
export default function DriverJobBoardPage() {
  const { jobs, isLoading, isAccepting, error, refreshJobs, acceptJob } =
    useDriverJobs();

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

  // The job currently being confirmed — null means modal is closed.
  const [pendingJob, setPendingJob] = useState<DeliveryJob | null>(null);

  const handleAcceptRequest = (job: DeliveryJob) => {
    setPendingJob(job);
  };

  const handleConfirm = async () => {
    if (!pendingJob) return;
    await acceptJob(pendingJob.id);
    setPendingJob(null);
  };

  const handleCancel = () => {
    setPendingJob(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Available Jobs
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Browse and accept delivery jobs in your region
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void refreshJobs()}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Refresh job listings"
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {/* Advanced search filters */}
      {!isLoading && !error && jobs.length > 0 && (
        <div className="mt-6">
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
        </div>
      )}

      {/* Stats bar */}
      {!isLoading && !error && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {jobs.length === 0
            ? 'No jobs available right now — check back soon.'
            : `${jobs.length} job${jobs.length !== 1 ? 's' : ''} available`}
        </p>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/30 dark:bg-red-900/10">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            {error}
          </p>
          <button
            type="button"
            onClick={() => void refreshJobs()}
            className="mt-3 rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && jobs.length === 0 && (
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <Briefcase className="h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="text-base font-medium text-gray-500 dark:text-gray-400">
            No jobs available right now
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            New deliveries appear here as soon as they&apos;re posted.
          </p>
        </div>
      )}

      {/* No results for the current filters */}
      {!isLoading && !error && jobs.length > 0 && filteredJobs.length === 0 && (
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <Briefcase className="h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="text-base font-medium text-gray-500 dark:text-gray-400">
            No jobs match your filters
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-medium text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Job grid */}
      {!isLoading && !error && filteredJobs.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onAccept={handleAcceptRequest}
              isAccepting={isAccepting}
            />
          ))}
        </div>
      )}

      {/* Confirmation modal */}
      {pendingJob && (
        <AcceptJobModal
          job={pendingJob}
          isAccepting={isAccepting}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}