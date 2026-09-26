// __tests__/lib/csvParser.test.ts

// TODO: Update this import path to match your actual utility file
// import { parseBulkShipmentsCSV, ParsedShipment, ParseResult } from '@/lib/csvParser';

// Mock implementation of the utility if you haven't written the pure functions yet,
// or replace this block with your actual imports.
interface ParsedShipment {
  recipient: string;
  amount: number;
  currency: string;
}

interface ParseResult {
  validRows: ParsedShipment[];
  errors: { row: number; reason: string }[];
}

const parseBulkShipmentsCSV = (csvContent: string): ParseResult => {
  const lines = csvContent.trim().split('\n');
  const result: ParseResult = { validRows: [], errors: [] };

  if (lines.length < 2) return result; // Needs at least a header and one row

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty rows

    const [recipient, amountStr, currency] = line.split(',').map(s => s.trim());

    if (!recipient) {
      result.errors.push({ row: i + 1, reason: 'Missing recipient address' });
      continue;
    }

    const amount = Number(amountStr);
    if (!amountStr || isNaN(amount) || amount <= 0) {
      result.errors.push({ row: i + 1, reason: 'Invalid or zero amount' });
      continue;
    }

    if (!currency) {
      result.errors.push({ row: i + 1, reason: 'Missing currency' });
      continue;
    }

    result.validRows.push({ recipient, amount, currency });
  }

  return result;
};

describe('Unit: CSV Parser & Data Validation for Bulk Shipments', () => {
  it('correctly maps a valid CSV file to shipment objects', () => {
    const validCSV = `recipient,amount,currency
0x1234567890abcdef1234567890abcdef12345678,500,USDC
0xabcdef1234567890abcdef1234567890abcdef12,150.5,USDC`;

    const result = parseBulkShipmentsCSV(validCSV);

    expect(result.errors).toHaveLength(0);
    expect(result.validRows).toHaveLength(2);
    expect(result.validRows[0]).toEqual({
      recipient: '0x1234567890abcdef1234567890abcdef12345678',
      amount: 500,
      currency: 'USDC',
    });
    expect(result.validRows[1]).toEqual({
      recipient: '0xabcdef1234567890abcdef1234567890abcdef12',
      amount: 150.5,
      currency: 'USDC',
    });
  });

  it('handles empty rows and trailing whitespace gracefully', () => {
    const csvWithSpaces = `recipient,amount,currency
    0x1234...   ,  100  ,  XLM  
    
    0xabcd...   ,  200  ,  USDC  `;

    const result = parseBulkShipmentsCSV(csvWithSpaces);

    expect(result.errors).toHaveLength(0);
    expect(result.validRows).toHaveLength(2);
    expect(result.validRows[0].amount).toBe(100);
    expect(result.validRows[1].currency).toBe('USDC');
  });

  it('returns structured errors for rows with missing required fields', () => {
    const invalidCSV = `recipient,amount,currency
,100,USDC
0x1234...,,USDC
0x1234...,100,`;

    const result = parseBulkShipmentsCSV(invalidCSV);

    expect(result.validRows).toHaveLength(0);
    expect(result.errors).toHaveLength(3);
    
    // Row numbers are 1-indexed, header is row 1
    expect(result.errors[0]).toEqual({ row: 2, reason: 'Missing recipient address' });
    expect(result.errors[1]).toEqual({ row: 3, reason: 'Invalid or zero amount' });
    expect(result.errors[2]).toEqual({ row: 4, reason: 'Missing currency' });
  });

  it('returns structured errors for invalid amount formats (NaN or negative)', () => {
    const invalidAmountsCSV = `recipient,amount,currency
0x1234...,abc,USDC
0xabcd...,-50,USDC
0xefgh...,0,USDC`;

    const result = parseBulkShipmentsCSV(invalidAmountsCSV);

    expect(result.validRows).toHaveLength(0);
    expect(result.errors).toHaveLength(3);
    expect(result.errors[0].reason).toBe('Invalid or zero amount');
    expect(result.errors[1].reason).toBe('Invalid or zero amount');
    expect(result.errors[2].reason).toBe('Invalid or zero amount');
  });

  it('processes partial successes (mixed valid and invalid rows)', () => {
    const mixedCSV = `recipient,amount,currency
0x1234...,100,USDC
,200,USDC
0xabcd...,300,USDC
0xefgh...,abc,USDC`;

    const result = parseBulkShipmentsCSV(mixedCSV);

    expect(result.validRows).toHaveLength(2);
    expect(result.errors).toHaveLength(2);
    
    expect(result.validRows[0].amount).toBe(100);
    expect(result.validRows[1].amount).toBe(300);
    
    expect(result.errors[0].row).toBe(3);
    expect(result.errors[1].row).toBe(5);
  });
});