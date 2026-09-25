import { networkService } from '@/services/networkService';

describe('networkService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  describe('getIsOnline', () => {
    it('returns navigator.onLine', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        configurable: true,
      });
      expect(networkService.getIsOnline()).toBe(true);

      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      });
      expect(networkService.getIsOnline()).toBe(false);
    });
  });

  describe('checkConnectivity', () => {
    it('returns true when the heartbeat endpoint responds ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      const result = await networkService.checkConnectivity();

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/system/heartbeat',
        expect.objectContaining({ method: 'GET', cache: 'no-store' }),
      );
    });

    it('returns false when the heartbeat endpoint responds with an error status', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false });

      const result = await networkService.checkConnectivity();

      expect(result).toBe(false);
    });

    it('returns false when the request throws (e.g. no network)', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch'));

      const result = await networkService.checkConnectivity();

      expect(result).toBe(false);
    });

    it('forwards an AbortSignal when provided', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true });
      const controller = new AbortController();

      await networkService.checkConnectivity(controller.signal);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ signal: controller.signal }),
      );
    });
  });
});
