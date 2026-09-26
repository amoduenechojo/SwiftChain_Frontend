'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cellSizeForZoom, clusterDrivers } from './clustering';
import type { Driver } from '@/types/fleet';

interface FleetMapClientProps {
  drivers: Driver[];
}

const DEFAULT_CENTER: [number, number] = [9.082, 8.6753]; // Nigeria centroid
const INITIAL_ZOOM = 6;

function pickCenter(drivers: Driver[]): [number, number] {
  if (drivers.length === 0) return DEFAULT_CENTER;
  const lat =
    drivers.reduce((s, d) => s + d.location.lat, 0) / drivers.length;
  const lng =
    drivers.reduce((s, d) => s + d.location.lng, 0) / drivers.length;
  return [lat, lng];
}

function radiusFor(count: number): number {
  if (count <= 1) return 8;
  if (count < 5) return 12;
  if (count < 15) return 18;
  return 24;
}

/**
 * Renders one marker per cluster and re-buckets whenever the map zoom changes.
 *
 * Lives inside `MapContainer` because `useMapEvents` needs the Leaflet map from
 * context. Zooming out widens the clustering grid, so nearby drivers merge into
 * a single marker instead of overlapping pins.
 */
function DriverClusterLayer({ drivers }: FleetMapClientProps) {
  const [zoomFromEvent, setZoomFromEvent] = useState<number | null>(null);

  const map = useMapEvents({
    zoomend: () => setZoomFromEvent(map.getZoom()),
  });

  // Before the first `zoomend` the map may already sit at a zoom other than
  // INITIAL_ZOOM (a restored view, or `fitBounds`), so read the live value and
  // let subsequent events take over.
  const zoom = zoomFromEvent ?? map?.getZoom?.() ?? INITIAL_ZOOM;

  const clusters = useMemo(
    () => clusterDrivers(drivers, cellSizeForZoom(zoom)),
    [drivers, zoom],
  );

  return (
    <>
      {clusters.map((cluster) => {
        const count = cluster.drivers.length;
        const isCluster = count > 1;
        return (
          <CircleMarker
            key={cluster.id}
            center={[cluster.lat, cluster.lng]}
            radius={radiusFor(count)}
            pathOptions={{
              color: isCluster ? '#1d4ed8' : '#10b981',
              fillColor: isCluster ? '#3b82f6' : '#34d399',
              fillOpacity: 0.7,
              weight: 2,
            }}
          >
            <Tooltip direction="top" offset={[0, -4]} opacity={1}>
              {isCluster ? (
                <span>{count} drivers</span>
              ) : (
                <span>{cluster.drivers[0].name}</span>
              )}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}

export default function FleetMapClient({ drivers }: FleetMapClientProps) {
  const center = useMemo(() => pickCenter(drivers), [drivers]);

  // Ensure Leaflet picks up the CSS-loaded marker icons in environments
  // (Next.js bundles) where the default detection misfires. Without this
  // the default markers can render broken even when CSS is imported.
  useEffect(() => {
    const proto = L.Icon.Default.prototype as { _getIconUrl?: unknown };
    if (proto._getIconUrl) delete proto._getIconUrl;
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={INITIAL_ZOOM}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
      aria-label="Fleet map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DriverClusterLayer drivers={drivers} />
    </MapContainer>
  );
}
