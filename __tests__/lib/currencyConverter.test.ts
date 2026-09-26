// __tests__/lib/currencyConverter.test.ts

// TODO: Update this import path to match your actual utility file
// import { convertCryptoToFiat, convertFiatToCrypto, calculateExchangeRate } from '@/lib/currencyConverter';

// Mock implementation of the utility if you haven't written the pure functions yet,
// or replace this block with your actual imports.
const convertCryptoToFiat = (amount: number, rate: number): number => {
  if (amount < 0 || rate < 0) throw new Error('Invalid input: negative amounts not allowed');
  return Number((amount * rate).toFixed(2));
};

const convertFiatToCrypto = (amount: number, rate: number, cryptoDecimals: number = 7): number => {
  if (amount < 0 || rate <= 0) throw new Error('Invalid input: rate must be > 0 and amount >= 0');
  return Number((amount / rate).toFixed(cryptoDecimals));
};

describe('Unit: Currency Converter and Exchange Rate Math', () => {
  // Common exchange rates for XLM and USDC to Fiat (e.g., USD, NGN)
  const MOCK_RATES = {
    XLM_USD: 0.115,
    USDC_USD: 1.00,
    USD_NGN: 1500.50, // NGN fiat testing for local market compatibility
  };

  describe('convertCryptoToFiat()', () => {
    it('accurately converts XLM to USD fiat (standard numbers)', () => {
      const cryptoAmount = 1000; // 1000 XLM
      const result = convertCryptoToFiat(cryptoAmount, MOCK_RATES.XLM_USD);
      expect(result).toBe(115.00);
    });

    it('accurately converts USDC to NGN fiat (large numbers)', () => {
      const usdcAmount = 250.5; // 250.5 USDC
      const result = convertCryptoToFiat(usdcAmount, MOCK_RATES.USD_NGN);
      expect(result).toBe(375875.25);
    });

    it('handles floating point precision safely to 2 decimal places', () => {
      // 0.1 + 0.2 floating point trap test
      const result = convertCryptoToFiat(0.30000000000000004, MOCK_RATES.USDC_USD);
      expect(result).toBe(0.30);
    });

    it('returns 0 when crypto amount is 0', () => {
      expect(convertCryptoToFiat(0, MOCK_RATES.XLM_USD)).toBe(0);
    });

    it('throws an error when provided a negative amount', () => {
      expect(() => convertCryptoToFiat(-50, MOCK_RATES.XLM_USD)).toThrow('negative amounts not allowed');
    });
  });

  describe('convertFiatToCrypto()', () => {
    it('accurately converts USD to XLM with 7 decimal precision (Stellar standard)', () => {
      const fiatAmount = 50; // $50
      const result = convertFiatToCrypto(fiatAmount, MOCK_RATES.XLM_USD);
      // 50 / 0.115 = 434.78260869...
      expect(result).toBe(434.7826087);
    });

    it('accurately converts NGN to USDC', () => {
      const fiatAmount = 150050; // 150,050 NGN
      const result = convertFiatToCrypto(fiatAmount, MOCK_RATES.USD_NGN, 2);
      expect(result).toBe(100.00);
    });

    it('returns 0 when fiat amount is 0', () => {
      expect(convertFiatToCrypto(0, MOCK_RATES.XLM_USD)).toBe(0);
    });

    it('throws an error if exchange rate is 0 to prevent division by zero', () => {
      expect(() => convertFiatToCrypto(100, 0)).toThrow('rate must be > 0');
    });

    it('throws an error when provided a negative fiat amount', () => {
      expect(() => convertFiatToCrypto(-100, MOCK_RATES.USDC_USD)).toThrow('amount >= 0');
    });
  });
});