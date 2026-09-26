import { act, renderHook } from '@testing-library/react';
import { useTablePagination, DEFAULT_PAGE_SIZE } from '@/hooks/useTablePagination';

const makeRows = (count: number) =>
  Array.from({ length: count }, (_, index) => ({ id: `row-${index + 1}` }));

describe('useTablePagination', () => {
  it('defaults to a page size of 10', () => {
    const { result } = renderHook(() => useTablePagination(makeRows(25)));

    expect(DEFAULT_PAGE_SIZE).toBe(10);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.pageItems).toHaveLength(10);
  });

  it('keeps everything on a single page when rows do not exceed the page size', () => {
    const { result } = renderHook(() => useTablePagination(makeRows(10)));

    expect(result.current.totalPages).toBe(1);
    expect(result.current.isPaginated).toBe(false);
    expect(result.current.canNextPage).toBe(false);
    expect(result.current.canPreviousPage).toBe(false);
  });

  it('splits rows into pages once the dataset exceeds the page size', () => {
    const { result } = renderHook(() => useTablePagination(makeRows(23)));

    expect(result.current.totalPages).toBe(3);
    expect(result.current.isPaginated).toBe(true);
    expect(result.current.pageItems[0]).toEqual({ id: 'row-1' });

    act(() => result.current.nextPage());
    expect(result.current.page).toBe(2);
    expect(result.current.pageItems[0]).toEqual({ id: 'row-11' });
    expect(result.current.pageItems).toHaveLength(10);

    act(() => result.current.nextPage());
    expect(result.current.page).toBe(3);
    expect(result.current.pageItems).toHaveLength(3);
    expect(result.current.pageItems[0]).toEqual({ id: 'row-21' });
  });

  it('reports a human-readable range for the current page', () => {
    const { result } = renderHook(() => useTablePagination(makeRows(23)));

    expect(result.current.rangeStart).toBe(1);
    expect(result.current.rangeEnd).toBe(10);

    act(() => result.current.goToPage(3));
    expect(result.current.rangeStart).toBe(21);
    expect(result.current.rangeEnd).toBe(23);
  });

  it('never advances past the last page', () => {
    const { result } = renderHook(() => useTablePagination(makeRows(12)));

    act(() => result.current.nextPage());
    act(() => result.current.nextPage());
    act(() => result.current.nextPage());

    expect(result.current.page).toBe(2);
    expect(result.current.canNextPage).toBe(false);
  });

  it('never moves before the first page', () => {
    const { result } = renderHook(() => useTablePagination(makeRows(12)));

    act(() => result.current.previousPage());

    expect(result.current.page).toBe(1);
    expect(result.current.canPreviousPage).toBe(false);
  });

  it('clamps out-of-range page requests', () => {
    const { result } = renderHook(() => useTablePagination(makeRows(15)));

    act(() => result.current.goToPage(99));
    expect(result.current.page).toBe(2);

    act(() => result.current.goToPage(-4));
    expect(result.current.page).toBe(1);
  });

  it('falls back to the last valid page when the dataset shrinks', () => {
    const { result, rerender } = renderHook(({ rows }) => useTablePagination(rows), {
      initialProps: { rows: makeRows(30) },
    });

    act(() => result.current.goToPage(3));
    expect(result.current.page).toBe(3);

    rerender({ rows: makeRows(12) });

    expect(result.current.totalPages).toBe(2);
    expect(result.current.page).toBe(2);
    expect(result.current.pageItems).toHaveLength(2);
  });

  it('handles an empty dataset without dividing by zero', () => {
    const { result } = renderHook(() => useTablePagination([]));

    expect(result.current.totalPages).toBe(1);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.pageItems).toEqual([]);
    expect(result.current.rangeStart).toBe(0);
    expect(result.current.rangeEnd).toBe(0);
    expect(result.current.isPaginated).toBe(false);
  });

  it('honours a custom page size', () => {
    const { result } = renderHook(() => useTablePagination(makeRows(9), { pageSize: 4 }));

    expect(result.current.pageSize).toBe(4);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.pageItems).toHaveLength(4);
  });

  it('ignores a non-positive page size and uses the default', () => {
    const { result } = renderHook(() => useTablePagination(makeRows(12), { pageSize: 0 }));

    expect(result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(result.current.totalPages).toBe(2);
  });
});
