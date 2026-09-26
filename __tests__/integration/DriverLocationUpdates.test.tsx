/**
 * Integration: WebSocket live driver location updates.
 *
 * Covers the full path a fleet manager sees - a DRIVER_LOCATION frame lands
 * on the socket, useDriverLocations folds it into the driver list, and the
 * map re-renders the marker at the new coordinates.
 *
 * The socket is mocked at the service boundary so no real connection is
 * opened, and Leaflet is stubbed wholesale because jsdom has no layout
 * engine. The stubs surface marker centres as data attributes, so the
 * assertions describe what actually moves on the map.
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import FleetMapClient from '@/components/fleet/FleetMapClient';
import {
  useDriverLocations,
  DRIVER_LOCATION_EVENT,
  type DriverLocationPayload,
} from '@/hooks/useDriverLocations';
import { socketService } from '@/lib/websocket';
import { useWebSocketContext } from '@/lib/WebSocketProvider';
import type { Driver } from '@/types/fleet';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@/lib/websocket', () => ({
  socketService: {
    socket: {
      on: jest.fn(),
      off: jest.fn(),
    },
  },
}));

jest.mock('@/lib/WebSocketProvider', () => ({
  useWebSocketContext: jest.fn(),
}));

jest.mock('leaflet/dist/leaflet.css', () => ({}));

jest.mock('leaflet', () => ({
  __esModule: true,
  default: {
    Icon: { Default: { prototype: { _getIconUrl: () => 'icon.png' } } },
  },
}));

const mockMapState = { zoom: 18 };

jest.mock('react-leaflet', () => {
  const ReactLib = require('react');
  return {
    __esModule: true,
    MapContainer: ({ children, center, zoom, ...rest }: any) =>
      ReactLib.createElement(
        'div',
        {
          'data-testid': 'map-container',
          'data-center': center.join(','),
          'data-zoom': String(zoom),
          'aria-label': rest['aria-label'],
        },
        children,
      ),
    TileLayer: () =>
      ReactLib.createElement('div', { 'data-testid': 'tile-layer' }),
    CircleMarker: ({ children, center, radius }: any) =>
      ReactLib.createElement(
        'div',
        {
          'data-testid': 'cluster-marker',
          'data-center': center.join(','),
          'data-radius': String(radius),
        },
        children,
      ),
    Tooltip: ({ children }: any) =>
      ReactLib.createElement(
        'div',
        { 'data-testid': 'marker-tooltip' },
        children,
      ),
    useMapEvents: () => ({ getZoom: () => mockMapState.zoom }),
  };
});

// ---------------------------------------------------------------------------
// Fixtures and harness
// ---------------------------------------------------------------------------

function makeDriver(overrides: Partial<Driver> = {}): Driver {
  return {
    id: 'drv-1',
    name: 'Ada Okafor',
    phone: '+2348000000001',
    vehicleType: 'van',
    vehiclePlate: 'LAG-123-AA',
    status: 'on_delivery',
    rating: 4.8,
    activeDeliveries: 1,
    completedDeliveries: 120,
    location: {
      lat: 6.5244,
      lng: 3.3792,
      updatedAt: '2026-08-31T10:00:00.000Z',
    },
    ...overrides,
  };
}

/** Mirrors how a fleet page composes the hook with the map. */
function LiveFleetMap({ drivers }: { drivers: Driver[] }) {
  const liveDrivers = useDriverLocations(drivers);
  return <FleetMapClient drivers={liveDrivers} />;
}

/** Grabs the DRIVER_LOCATION handler the hook registered on the socket. */
function captureHandler(): (payload: DriverLocationPayload) => void {
  const on = socketService.socket?.on as jest.Mock;
  const registration = on.mock.calls.find(
    ([event]) => event === DRIVER_LOCATION_EVENT,
  );
  if (!registration) {
    throw new Error('DRIVER_LOCATION handler was never registered');
  }
  return registration[1];
}

function emit(payload: DriverLocationPayload) {
  const handler = captureHandler();
  act(() => {
    handler(payload);
  });
}

function markerCentres(): string[] {
  return screen
    .getAllByTestId('cluster-marker')
    .map((el) => el.getAttribute('data-center') ?? '');
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Integration: WebSocket live driver location updates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useWebSocketContext as jest.Mock).mockReturnValue({ isConnected: true });
  });

  describe('subscription lifecycle', () => {
    it('subscribes to DRIVER_LOCATION once the socket is connected', () => {
      render(<LiveFleetMap drivers={[makeDriver()]} />);

      expect(socketService.socket?.on).toHaveBeenCalledWith(
        DRIVER_LOCATION_EVENT,
        expect.any(Function),
      );
    });

    it('does not subscribe while the socket is disconnected', () => {
      (useWebSocketContext as jest.Mock).mockReturnValue({ isConnected: false });

      render(<LiveFleetMap drivers={[makeDriver()]} />);

      expect(socketService.socket?.on).not.toHaveBeenCalled();
    });

    it('removes the listener on unmount so events cannot leak between pages', () => {
      const { unmount } = render(<LiveFleetMap drivers={[makeDriver()]} />);
      unmount();

      expect(socketService.socket?.off).toHaveBeenCalledWith(
        DRIVER_LOCATION_EVENT,
        expect.any(Function),
      );
    });
  });

  describe('map state updates', () => {
    it('moves the marker when a coordinate frame arrives', () => {
      render(<LiveFleetMap drivers={[makeDriver()]} />);
      expect(markerCentres()).toEqual(['6.5244,3.3792']);

      emit({
        driverId: 'drv-1',
        lat: 6.6,
        lng: 3.4,
        updatedAt: '2026-08-31T10:05:00.000Z',
      });

      expect(markerCentres()).toEqual(['6.6,3.4']);
    });

    it('tracks a driver across a sequence of frames', () => {
      render(<LiveFleetMap drivers={[makeDriver()]} />);

      emit({
        driverId: 'drv-1',
        lat: 6.55,
        lng: 3.38,
        updatedAt: '2026-08-31T10:01:00.000Z',
      });
      emit({
        driverId: 'drv-1',
        lat: 6.58,
        lng: 3.39,
        updatedAt: '2026-08-31T10:02:00.000Z',
      });
      emit({
        driverId: 'drv-1',
        lat: 6.61,
        lng: 3.41,
        updatedAt: '2026-08-31T10:03:00.000Z',
      });

      expect(markerCentres()).toEqual(['6.61,3.41']);
    });

    it('moves only the driver named in the payload', () => {
      const drivers = [
        makeDriver({ id: 'drv-1' }),
        makeDriver({
          id: 'drv-2',
          name: 'Chidi Eze',
          location: {
            lat: 9.05,
            lng: 7.49,
            updatedAt: '2026-08-31T10:00:00.000Z',
          },
        }),
      ];
      render(<LiveFleetMap drivers={drivers} />);

      emit({
        driverId: 'drv-2',
        lat: 9.1,
        lng: 7.5,
        updatedAt: '2026-08-31T10:04:00.000Z',
      });

      expect(markerCentres()).toEqual(
        expect.arrayContaining(['6.5244,3.3792', '9.1,7.5']),
      );
    });
  });

  describe('resilience to bad frames', () => {
    it('ignores an event for a driver that is not on the map', () => {
      render(<LiveFleetMap drivers={[makeDriver()]} />);

      emit({
        driverId: 'drv-unknown',
        lat: 1.1,
        lng: 2.2,
        updatedAt: '2026-08-31T10:06:00.000Z',
      });

      expect(markerCentres()).toEqual(['6.5244,3.3792']);
    });

    it('ignores a malformed frame instead of moving the marker to NaN', () => {
      render(<LiveFleetMap drivers={[makeDriver()]} />);

      emit({
        driverId: 'drv-1',
        lat: Number.NaN,
        lng: 3.4,
      } as DriverLocationPayload);
      emit({ lat: 6.9, lng: 3.9 } as unknown as DriverLocationPayload);

      expect(markerCentres()).toEqual(['6.5244,3.3792']);
    });

    it('keeps the newer fix when frames arrive out of order', () => {
      render(<LiveFleetMap drivers={[makeDriver()]} />);

      emit({
        driverId: 'drv-1',
        lat: 6.7,
        lng: 3.5,
        updatedAt: '2026-08-31T10:10:00.000Z',
      });
      emit({
        driverId: 'drv-1',
        lat: 6.2,
        lng: 3.1,
        updatedAt: '2026-08-31T10:02:00.000Z',
      });

      expect(markerCentres()).toEqual(['6.7,3.5']);
    });
  });
});
