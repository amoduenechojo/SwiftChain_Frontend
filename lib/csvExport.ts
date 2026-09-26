export interface CsvColumn<T> {
  /** Header text written as the first row of the file. */
  header: string;
  /** Extracts the cell value for a row. Nullish values become empty cells. */
  value: (row: T) => string | number | null | undefined;
}

/**
 * Escapes a single CSV cell per RFC 4180: values containing a comma, a quote or
 * a newline are wrapped in double quotes, and embedded quotes are doubled.
 */
export function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const asString = String(value);
  if (/[",\r\n]/.test(asString)) {
    return `"${asString.replace(/"/g, '""')}"`;
  }
  return asString;
}

/**
 * Serialises rows into a CSV document. The header row is always written, so an
 * empty export still produces a well-formed file.
 */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const headerLine = columns.map((column) => escapeCsvValue(column.header)).join(',');
  const bodyLines = rows.map((row) =>
    columns.map((column) => escapeCsvValue(column.value(row))).join(','),
  );
  return [headerLine, ...bodyLines].join('\r\n');
}

/** Byte-order mark — keeps spreadsheet apps from mangling non-ASCII characters. */
const UTF8_BOM = '\uFEFF';

/**
 * Triggers a browser download of `content` as `filename`.
 * The object URL is revoked once the click has been dispatched so repeated
 * exports do not leak blobs.
 */
export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([UTF8_BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);

  try {
    link.click();
  } finally {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
