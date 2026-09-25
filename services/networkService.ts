/**
 * networkService — responsible for monitoring network connectivity status.
 * This follows the Strict Layered Architecture (Service layer).
 */
export const networkService = {
  /**
   * Returns the current online status.
   */
  getIsOnline: (): boolean => {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  },

  /**
   * Verifies actual internet reachability against the backend.
   *
   * The browser's `online` event only means a network interface became
   * active (e.g. joining a WiFi network with no real internet access) —
   * it does not guarantee reachability. This performs a real request so
   * callers can confirm a reconnect before trusting it.
   */
  checkConnectivity: async (signal?: AbortSignal): Promise<boolean> => {
    if (typeof window === 'undefined') return true;

    try {
      const response = await fetch('/api/system/heartbeat', {
        method: 'GET',
        cache: 'no-store',
        signal,
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};
