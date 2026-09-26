'use client';

import { useEffect, useMemo, useState } from 'react';
import { socketService } from '@/lib/websocket';
import { useWebSocketContext } from '@/lib/WebSocketProvider';
import type { Driver, DriverLocation } from '@/types/fleet';

/** Coordinate frame pushed by the server on the DRIVER_LOCATION channel. */
export interface DriverLocationPayload {
  driverId: string;
  lat: number;
  lng: number;
  updatedAt: string;
}

export const DRIVER_LOCATION_EVENT = 'DRIVER_LOCATION';

function isValidPayload(payload: unknown): payload is DriverLocationPayload {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Partial<DriverLocationPayload>;
  return (
    typeof p.driverId === 'string' &&
    typeof p.lat === 'number' &&
    Number.isFinite(p.lat) &&
    typeof p.lng === 'number' &&
    Number.isFinite(p.lng)
  );
}

/**
 * useDriverLocations — overlays live telemetry onto a fetched driver list.
 *
 * The REST snapshot from useFleet gives each driver a location as of page
 * load; this hook keeps that list current by folding in DRIVER_LOCATION
 * socket events. Drivers with no telemetry yet pass through untouched, and
 * an event for an unknown driverId is ignored rather than inventing a marker.
 *
 * Following Strict Layered Architecture:
 * Component -> Hook (this) -> Service (socketService).
 */
export function useDriverLocations(drivers: Driver[]): Driver[] {
  const { isConnected } = useWebSocketContext();
  const [liveLocations, setLiveLocations] = useState<
    Record<string, DriverLocation>
  >({});

  useEffect(() => {
    const socket = socketService.socket;
    if (!socket || !isConnected) return;

    const handleDriverLocation = (payload: DriverLocationPayload) => {
      if (!isValidPayload(payload)) return;

      setLiveLocations((previous) => {
        const existing = previous[payload.driverId];

        // Out-of-order delivery is normal on a reconnect; keep the newer fix.
        if (
          existing &&
          payload.updatedAt &&
          existing.updatedAt &&
          new Date(payload.updatedAt) < new Date(existing.updatedAt)
        ) {
          return previous;
        }

        return {
          ...previous,
          [payload.driverId]: {
            lat: payload.lat,
            lng: payload.lng,
            updatedAt: payload.updatedAt,
          },
        };
      });
    };

    socket.on(DRIVER_LOCATION_EVENT, handleDriverLocation);

    return () => {
      socket.off(DRIVER_LOCATION_EVENT, handleDriverLocation);
    };
  }, [isConnected]);

  return useMemo(
    () =>
      drivers.map((driver) => {
        const live = liveLocations[driver.id];
        return live ? { ...driver, location: live } : driver;
      }),
    [drivers, liveLocations],
  );
}
