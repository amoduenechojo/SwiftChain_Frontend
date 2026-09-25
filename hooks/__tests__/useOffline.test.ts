import { renderHook, act } from '@testing-library/react';
import useOffline from '@/hooks/useOffline';
import { networkService } from '@/services/networkService';

jest.mock('@/services/networkService', () => ({
  networkService: {
    getIsOnline: jest.fn(),
    checkConnectivity: jest.fn(),
  },
}));

/** Resolves once all pending microtasks have flushed (safe under fake timers). */
const flushMicrotasks = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('useOffline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with the current network status', () => {
    (networkService.getIsOnline as jest.Mock).mockReturnValue(true);
    const { result } = renderHook(() => useOffline());
    expect(result.current.isOnline).toBe(true);
    expect(networkService.getIsOnline).toHaveBeenCalled();
  });

  it('trusts an offline event immediately, without verification', async () => {
    (networkService.getIsOnline as jest.Mock).mockReturnValue(true);
    const { result } = renderHook(() => useOffline());

    await act(async () => {
      window.dispatchEvent(new Event('offline'));
      await flushMicrotasks();
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.showBackOnline).toBe(false);
    expect(networkService.checkConnectivity).not.toHaveBeenCalled();
  });

  it('verifies an online event against the backend before flipping isOnline', async () => {
    (networkService.getIsOnline as jest.Mock).mockReturnValue(false);
    (networkService.checkConnectivity as jest.Mock).mockResolvedValue(true);
    const { result } = renderHook(() => useOffline());

    window.dispatchEvent(new Event('offline'));
    await act(async () => {
      window.dispatchEvent(new Event('online'));
      await flushMicrotasks();
    });

    expect(networkService.checkConnectivity).toHaveBeenCalledTimes(1);
    expect(result.current.isOnline).toBe(true);
    expect(result.current.showBackOnline).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.showBackOnline).toBe(false);
  });

  it('stays offline when the backend reachability check fails', async () => {
    (networkService.getIsOnline as jest.Mock).mockReturnValue(false);
    (networkService.checkConnectivity as jest.Mock).mockResolvedValue(false);
    const { result } = renderHook(() => useOffline());

    window.dispatchEvent(new Event('offline'));
    await act(async () => {
      window.dispatchEvent(new Event('online'));
      await flushMicrotasks();
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.showBackOnline).toBe(false);
  });

  it('ignores a stale verification result superseded by a later offline event (flapping)', async () => {
    (networkService.getIsOnline as jest.Mock).mockReturnValue(false);

    let resolveFirstCheck: (_value: boolean) => void = () => {};
    const firstCheck = new Promise<boolean>((resolve) => {
      resolveFirstCheck = resolve;
    });
    (networkService.checkConnectivity as jest.Mock).mockReturnValueOnce(
      firstCheck
    );

    const { result } = renderHook(() => useOffline());

    // Network flaps online -> offline before the first verification resolves.
    act(() => {
      window.dispatchEvent(new Event('online'));
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);

    // The stale "online" check finally resolves (true) — it must be ignored.
    await act(async () => {
      resolveFirstCheck(true);
      await flushMicrotasks();
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.showBackOnline).toBe(false);
  });

  it('should cleanup event listeners and abort in-flight verification on unmount', () => {
    (networkService.getIsOnline as jest.Mock).mockReturnValue(true);

    const { unmount } = renderHook(() => useOffline());
    unmount();

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(networkService.checkConnectivity).not.toHaveBeenCalled();
  });
});
