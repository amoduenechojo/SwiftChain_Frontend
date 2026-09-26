'use client';

/**
 * QrGenerator — Component layer for offline-ready QR code generation.
 *
 * Renders the handoff QR code using `qrcode.react`.
 * Shows a "Cached" badge when the payload originates from local IndexedDB
 * rather than a live API response, so the driver knows the data may be stale.
 *
 * Component → Hook → Service pattern:
 *   QrGenerator → useOfflineQr → { shipmentHandoffService, qrCacheService }
 */

import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useOfflineQr } from '@/hooks/useOfflineQr';
import { ScanConfirmation } from '@/services/qrCacheService';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface QrGeneratorProps {
  deliveryId: string;
  /** Pixel dimensions of the rendered QR code (default 256). */
  size?: number;
  /** Show delivery ID / expiry metadata below the QR (default true). */
  includeLabel?: boolean;
  /** Called after the user confirms a successful scan. */
  onScanConfirmed?: (confirmation: ScanConfirmation) => void;
  className?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CachedBadge() {
  return (
    <span
      role="status"
      aria-label="QR code loaded from local cache"
      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800"
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Cached
    </span>
  );
}

function LiveBadge() {
  return (
    <span
      role="status"
      aria-label="QR code loaded from live API"
      className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800"
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
      Live
    </span>
  );
}

function SyncBadge({ pending }: { pending: number }) {
  return (
    <span
      role="status"
      aria-label={`${pending} scan confirmation${pending !== 1 ? 's' : ''} queued for sync`}
      className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800"
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
      Syncing {pending}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function QrGenerator({
  deliveryId,
  size = 256,
  includeLabel = true,
  onScanConfirmed,
  className = '',
}: QrGeneratorProps) {
  const {
    payload,
    source,
    isLoading,
    error,
    isSyncing,
    pendingCount,
    queueScan,
    refresh,
  } = useOfflineQr(deliveryId);

  // Ticks once a minute so the "Expires in Xm" label stays current without
  // reading the impure Date.now() clock directly during render.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div
        data-testid="qr-loading"
        className={`flex flex-col items-center gap-3 ${className}`}
      >
        <div
          className="animate-pulse rounded-lg bg-gray-200"
          style={{ width: size, height: size }}
        />
        <p className="text-sm text-gray-500">Loading QR code…</p>
      </div>
    );
  }

  // ── Error (no live + no cache) ───────────────────────────────────────────

  if (error) {
    return (
      <div
        data-testid="qr-error"
        className={`flex flex-col items-center gap-3 rounded-lg bg-red-50 p-4 ${className}`}
      >
        <svg
          aria-hidden="true"
          className="h-8 w-8 text-red-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-center text-sm font-medium text-red-800">{error}</p>
        <button
          onClick={() => void refresh()}
          className="rounded bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── No payload (shouldn't normally reach here) ───────────────────────────

  if (!payload) return null;

  // ── Success ──────────────────────────────────────────────────────────────

  const handleConfirmScan = async () => {
    const confirmation: ScanConfirmation = {
      deliveryId: payload.deliveryId,
      token: payload.token,
      scannedAt: new Date().toISOString(),
    };
    await queueScan(confirmation);
    onScanConfirmed?.(confirmation);
  };

  const msLeft = new Date(payload.expiresAt).getTime() - now;
  const minutesLeft = Math.max(0, Math.floor(msLeft / 60_000));

  return (
    <div
      data-testid="qr-generator"
      className={`flex flex-col items-center gap-3 ${className}`}
    >
      {/* ── Source + sync badges ── */}
      <div className="flex items-center gap-2">
        {source === 'cached' ? <CachedBadge /> : <LiveBadge />}
        {isSyncing && <SyncBadge pending={pendingCount} />}
      </div>

      {/* ── QR code ── */}
      <div
        data-testid="qr-canvas-wrapper"
        className={`rounded-lg border-2 p-3 shadow-sm transition-colors ${
          source === 'cached'
            ? 'border-amber-300 bg-amber-50'
            : 'border-gray-200 bg-white'
        }`}
      >
        <QRCodeCanvas
          value={payload.qrData}
          size={size}
          level="H"
          includeMargin
        />
      </div>

      {/* ── Label ── */}
      {includeLabel && (
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">Package Handoff QR</p>
          <p className="mt-0.5 text-xs text-gray-500">Delivery: {deliveryId}</p>
          <p
            className={`mt-1 text-xs font-medium ${
              minutesLeft <= 1
                ? 'text-red-600'
                : minutesLeft <= 5
                ? 'text-amber-600'
                : 'text-green-600'
            }`}
          >
            {msLeft <= 0 ? 'Expired' : `Expires in ${minutesLeft}m`}
          </p>
          {source === 'cached' && (
            <p className="mt-1 text-xs text-amber-700">
              Offline — showing cached QR
            </p>
          )}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex gap-2">
        <button
          data-testid="refresh-button"
          onClick={() => void refresh()}
          className="rounded bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Refresh
        </button>
        <button
          data-testid="confirm-scan-button"
          onClick={() => void handleConfirmScan()}
          className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Confirm Scan
        </button>
      </div>
    </div>
  );
}

export default QrGenerator;
