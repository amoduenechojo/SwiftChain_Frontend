'use client';

import { useCallback, useMemo, useState } from 'react';

export const DEFAULT_PAGE_SIZE = 10;

export interface UseTablePaginationOptions {
  /** Rows rendered per page. Defaults to 10. */
  pageSize?: number;
}

export interface UseTablePaginationResult<T> {
  /** 1-based index of the page currently rendered. */
  page: number;
  /** Rows rendered per page. */
  pageSize: number;
  /** Total number of pages — always at least 1, even for an empty dataset. */
  totalPages: number;
  /** Total number of rows across every page. */
  totalItems: number;
  /** The slice of rows belonging to the current page. */
  pageItems: T[];
  /** 1-based index of the first row on the current page (0 when empty). */
  rangeStart: number;
  /** 1-based index of the last row on the current page (0 when empty). */
  rangeEnd: number;
  /** True when pagination controls are meaningful (more than one page). */
  isPaginated: boolean;
  canPreviousPage: boolean;
  canNextPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
}

/**
 * useTablePagination — client-side pagination for table views.
 *
 * The hook owns nothing but the current page index; the visible slice is derived
 * so a shrinking dataset (a filter being applied, rows being removed) can never
 * leave the table stranded on a page that no longer exists.
 */
export function useTablePagination<T>(
  items: T[],
  { pageSize = DEFAULT_PAGE_SIZE }: UseTablePaginationOptions = {},
): UseTablePaginationResult<T> {
  const [requestedPage, setRequestedPage] = useState(1);

  const safePageSize = pageSize > 0 ? Math.floor(pageSize) : DEFAULT_PAGE_SIZE;
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));

  // Derived rather than stored: if `items` shrinks below the requested page we
  // fall back to the last valid page instead of rendering an empty table.
  const page = Math.min(Math.max(requestedPage, 1), totalPages);

  const pageItems = useMemo(() => {
    const start = (page - 1) * safePageSize;
    return items.slice(start, start + safePageSize);
  }, [items, page, safePageSize]);

  const goToPage = useCallback((target: number) => {
    setRequestedPage(Number.isFinite(target) ? Math.max(1, Math.floor(target)) : 1);
  }, []);

  const nextPage = useCallback(() => {
    setRequestedPage((current) => Math.min(Math.max(current, 1) + 1, totalPages));
  }, [totalPages]);

  const previousPage = useCallback(() => {
    setRequestedPage((current) => Math.max(Math.min(current, totalPages) - 1, 1));
  }, [totalPages]);

  return {
    page,
    pageSize: safePageSize,
    totalPages,
    totalItems,
    pageItems,
    rangeStart: totalItems === 0 ? 0 : (page - 1) * safePageSize + 1,
    rangeEnd: Math.min(page * safePageSize, totalItems),
    isPaginated: totalPages > 1,
    canPreviousPage: page > 1,
    canNextPage: page < totalPages,
    nextPage,
    previousPage,
    goToPage,
  };
}
