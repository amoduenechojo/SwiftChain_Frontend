import { escapeCsvValue, toCsv, downloadCsv, type CsvColumn } from '@/lib/csvExport';

interface Row {
  name: string;
  amount: number | null;
  note?: string;
}

const COLUMNS: CsvColumn<Row>[] = [
  { header: 'Name', value: (row) => row.name },
  { header: 'Amount', value: (row) => row.amount },
  { header: 'Note', value: (row) => row.note },
];

describe('escapeCsvValue', () => {
  it('returns simple values unchanged', () => {
    expect(escapeCsvValue('TRK001')).toBe('TRK001');
    expect(escapeCsvValue(42)).toBe('42');
    expect(escapeCsvValue(0)).toBe('0');
  });

  it('renders nullish values as empty cells', () => {
    expect(escapeCsvValue(null)).toBe('');
    expect(escapeCsvValue(undefined)).toBe('');
  });

  it('quotes values containing a comma', () => {
    expect(escapeCsvValue('Lagos, Nigeria')).toBe('"Lagos, Nigeria"');
  });

  it('quotes and doubles embedded double quotes', () => {
    expect(escapeCsvValue('He said "hi"')).toBe('"He said ""hi"""');
  });

  it('quotes values containing newlines', () => {
    expect(escapeCsvValue('line one\nline two')).toBe('"line one\nline two"');
    expect(escapeCsvValue('line one\r\nline two')).toBe('"line one\r\nline two"');
  });
});

describe('toCsv', () => {
  it('writes a header row followed by one line per record', () => {
    const csv = toCsv(
      [
        { name: 'Ada', amount: 10 },
        { name: 'Obi', amount: 20, note: 'urgent' },
      ],
      COLUMNS,
    );

    expect(csv.split('\r\n')).toEqual(['Name,Amount,Note', 'Ada,10,', 'Obi,20,urgent']);
  });

  it('still writes the header row for an empty dataset', () => {
    expect(toCsv([], COLUMNS)).toBe('Name,Amount,Note');
  });

  it('escapes cells that would otherwise break the column layout', () => {
    const csv = toCsv([{ name: 'Doe, Jane', amount: null, note: 'says "ok"' }], COLUMNS);

    expect(csv).toBe('Name,Amount,Note\r\n"Doe, Jane",,"says ""ok"""');
  });

  it('escapes header text too', () => {
    const csv = toCsv<Row>([], [{ header: 'Name, full', value: (row) => row.name }]);

    expect(csv).toBe('"Name, full"');
  });
});

describe('downloadCsv', () => {
  const createObjectURL = jest.fn((_blob: Blob) => 'blob:mock-url');
  const revokeObjectURL = jest.fn();
  let clickSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (URL as unknown as { createObjectURL: unknown }).createObjectURL = createObjectURL;
    (URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = revokeObjectURL;
    clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    clickSpy.mockRestore();
  });

  it('creates a CSV blob, clicks a download link and revokes the URL', () => {
    downloadCsv('Name\r\nAda', 'report.csv');

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0] as unknown as Blob;
    expect(blob.type).toBe('text/csv;charset=utf-8;');

    expect(clickSpy).toHaveBeenCalledTimes(1);
    const link = clickSpy.mock.instances[0] as HTMLAnchorElement;
    expect(link.download).toBe('report.csv');
    expect(link.getAttribute('href')).toBe('blob:mock-url');

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('prefixes the payload with a UTF-8 BOM', () => {
    downloadCsv('Name\r\nAda', 'report.csv');

    const blob = createObjectURL.mock.calls[0][0] as unknown as Blob;
    // 'Name\r\nAda' is 9 ASCII bytes; the 3-byte BOM brings the blob to 12.
    expect(blob.size).toBe(12);
  });

  it('writes the content through unchanged once the BOM is decoded away', async () => {
    downloadCsv('Name\r\nAda', 'report.csv');

    const blob = createObjectURL.mock.calls[0][0] as unknown as Blob;
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob);
    });

    // FileReader strips the BOM when decoding as UTF-8, as spreadsheet apps do.
    expect(text).toBe('Name\r\nAda');
  });

  it('leaves no anchor behind in the document', () => {
    downloadCsv('Name', 'report.csv');

    expect(document.querySelectorAll('a[download]')).toHaveLength(0);
  });

  it('cleans up even when the click throws', () => {
    clickSpy.mockImplementation(() => {
      throw new Error('Download blocked');
    });

    expect(() => downloadCsv('Name', 'report.csv')).toThrow('Download blocked');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    expect(document.querySelectorAll('a[download]')).toHaveLength(0);
  });
});
