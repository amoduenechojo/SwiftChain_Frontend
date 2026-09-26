'use client';

import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  useHandoffQR,
  useGenerateHandoffQR,
} from '../../../hooks/useHandoffQR';
import { HandoffQRData } from '../../../types/shipment';
import clsx from 'clsx';

interface HandoffQRProps {
  deliveryId: string;
  driverId?: string;
  className?: string;
  size?: number;
  includeLabel?: boolean;
  autoGenerate?: boolean;
  onQRGenerated?: (qrData: HandoffQRData) => void;
  onError?: (error: Error) => void;
}

/**
 * HandoffQR Component
 *
 * Generates and displays a scannable QR code for package handoff verification.
 * Uses secure, time-sensitive tokens to ensure only authorized handoffs are verified.
 *
 * The QR code contains:
 * - Delivery ID
 * - Time-sensitive token (expires in configured time)
 * - Timestamp for verification
 *
 * Usage:
 * <HandoffQR deliveryId="del-123" autoGenerate driverId="drv-456" />
 */
export function HandoffQR({
  deliveryId,
  driverId,
  className = '',
  size = 256,
  includeLabel = true,
  autoGenerate = false,
  onQRGenerated,
  onError,
}: HandoffQRProps) {
  const [hasTriedGenerate, setHasTriedGenerate] = useState(false);
  const qrQuery = useHandoffQR(deliveryId, !autoGenerate || hasTriedGenerate);
  const generateMutation = useGenerateHandoffQR();

  // Auto-generate QR on first load if requested
  useEffect(() => {
    if (autoGenerate && !hasTriedGenerate && deliveryId && driverId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasTriedGenerate(true);
      generateMutation.mutate(deliveryId);
    }
  }, [autoGenerate, hasTriedGenerate, deliveryId, driverId, generateMutation]);

  // Call onQRGenerated callback when QR data is loaded
  useEffect(() => {
    if (qrQuery.data && onQRGenerated) {
      onQRGenerated(qrQuery.data);
    }
  }, [qrQuery.data, onQRGenerated]);

  // Call onError callback when error occurs
  useEffect(() => {
    const error = qrQuery.error || (generateMutation.error as Error | null);
    if (error && onError) {
      onError(error);
    }
  }, [qrQuery.error, generateMutation.error, onError]);

  // Extract expiry time remaining
  const getTimeRemaining = (): string => {
    if (!qrQuery.data?.expiresAt) return '';
    const expiryDate = new Date(qrQuery.data.expiresAt);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const minutes = Math.floor(diffMs / 1000 / 60);
    const seconds = Math.floor((diffMs / 1000) % 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  // Render loading state
  if (qrQuery.isLoading || generateMutation.isPending) {
    return (
      <div className={clsx('flex flex-col items-center gap-4', className)}>
        <div
          className="animate-pulse bg-gray-200 rounded"
          style={{ width: size, height: size }}
        />
        {includeLabel && (
          <p className="text-sm text-gray-500">Generating QR code...</p>
        )}
      </div>
    );
  }

  // Render error state
  if (qrQuery.isError || generateMutation.isError) {
    const error = qrQuery.error || generateMutation.error;
    return (
      <div
        className={clsx(
          'flex flex-col items-center gap-3 p-4 rounded-lg bg-red-50',
          className
        )}
      >
        <div className="text-red-600">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-red-900">
            Failed to generate QR code
          </p>
          <p className="text-xs text-red-700 mt-1">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
        </div>
        <button
          onClick={() => {
            if (autoGenerate) {
              setHasTriedGenerate(false);
            } else {
              generateMutation.mutate(deliveryId);
            }
          }}
          className="mt-2 px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Render QR code
  if (!qrQuery.data) {
    return (
      <div className={clsx('flex flex-col items-center gap-4', className)}>
        <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 border-dashed">
          <p className="text-sm text-gray-600 text-center">
            No QR code available
          </p>
        </div>
        {!autoGenerate && (
          <button
            onClick={() => generateMutation.mutate(deliveryId)}
            disabled={generateMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {generateMutation.isPending ? 'Generating...' : 'Generate QR Code'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={clsx('flex flex-col items-center gap-4', className)}>
      {/* QR Code Container */}
      <div className="p-4 bg-white rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="bg-white p-2 rounded">
          <QRCodeCanvas
            value={qrQuery.data.qrData}
            size={size}
            level="H"
            includeMargin={true}
            data-testid="handoff-qr-code"
          />
        </div>
      </div>

      {/* QR Information */}
      {includeLabel && (
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">
            Package Handoff QR
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Delivery ID: {deliveryId}
          </p>
          <p
            className={clsx('text-xs font-medium mt-2 transition-colors', {
              'text-red-600':
                new Date(qrQuery.data.expiresAt).getTime() -
                  new Date().getTime() <
                60000,
              'text-amber-600':
                new Date(qrQuery.data.expiresAt).getTime() -
                  new Date().getTime() <
                300000,
              'text-green-600':
                new Date(qrQuery.data.expiresAt).getTime() -
                  new Date().getTime() >=
                300000,
            })}
          >
            Expires in: {getTimeRemaining()}
          </p>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={() => generateMutation.mutate(deliveryId)}
        disabled={generateMutation.isPending}
        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
        data-testid="refresh-qr-button"
      >
        {generateMutation.isPending ? 'Refreshing...' : 'Refresh QR'}
      </button>
    </div>
  );
}

export default HandoffQR;
