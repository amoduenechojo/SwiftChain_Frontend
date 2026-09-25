'use client';

import useOffline from '@/hooks/useOffline';
import { WifiOff, Wifi } from 'lucide-react';

/**
 * OfflineBanner — global network status fallback banner.
 *
 * Architecture: OfflineBanner (Component) → useOffline (Hook) → networkService (Service)
 */
const OfflineBanner = () => {
  const { isOnline, showBackOnline } = useOffline();

  if (isOnline && !showBackOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[9999] animate-in fade-in slide-in-from-top duration-300"
    >
      <div
        className={`px-6 py-2.5 flex items-center justify-center gap-3 shadow-lg backdrop-blur-md bg-opacity-95 ${showBackOnline ? 'bg-gradient-to-r from-green-600 to-green-500' : 'bg-gradient-to-r from-red-600 to-red-500'} text-white`}
      >
        {showBackOnline ? (
          <Wifi className="w-4 h-4 animate-pulse" aria-hidden="true" />
        ) : (
          <WifiOff className="w-4 h-4 animate-pulse" aria-hidden="true" />
        )}
        <p className="text-sm font-semibold tracking-wide">
          {showBackOnline ? (
            'Back Online!'
          ) : (
            <>
              You are currently offline.{' '}
              <span className="font-normal opacity-90 ml-1.5">
                Transactions are disabled until connection is restored.
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default OfflineBanner;
