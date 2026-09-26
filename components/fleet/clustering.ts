import type { Driver } from '@/types/fleet';

export interface MapCluster {
  id: string;
  lat: number;
  lng: number;
  drivers: Driver[];
}

/**
 * Grid-based clustering for fleet map pins.
 *
 * Why: avoids adding an extra dependency (react-leaflet-cluster). For a fleet
 * dashboard the driver count is bounded (~hundreds), so an O(N) bucketing
 * pass at a coarse resolution is sufficient and predictable. Each cluster's
 * representative position is the centroid of its drivers.
 */
export function clusterDrivers(
  drivers: Driver[],
  cellSize: number = DEFAULT_CLUSTER_CELL_SIZE,
): MapCluster[] {
  const buckets: Record<string, Driver[]> = {};

  for (const d of drivers) {
    const key = `${Math.floor(d.location.lat / cellSize)}:${Math.floor(d.location.lng / cellSize)}`;
    const bucket = buckets[key];
    if (bucket) {
      bucket.push(d);
    } else {
      buckets[key] = [d];
    }
  }

  const clusters: MapCluster[] = [];
  for (const key of Object.keys(buckets)) {
    const group = buckets[key];
    const lat =
      group.reduce((s: number, d: Driver) => s + d.location.lat, 0) /
      group.length;
    const lng =
      group.reduce((s: number, d: Driver) => s + d.location.lng, 0) /
      group.length;
    clusters.push({ id: key, lat, lng, drivers: group });
  }
  return clusters;
}

/**
 * Cell size used at {@link REFERENCE_ZOOM}, matching the historical default.
 */
export const DEFAULT_CLUSTER_CELL_SIZE = 0.05;

/** Leaflet zoom level at which {@link DEFAULT_CLUSTER_CELL_SIZE} applies. */
export const REFERENCE_ZOOM = 6;

const MIN_CELL_SIZE = 0.001;
const MAX_CELL_SIZE = 45;

/**
 * Grid cell size (in degrees) to use for a given Leaflet zoom level.
 *
 * One Leaflet zoom step halves the ground distance covered by a pixel, so the
 * bucket has to double in size for every level the user zooms out. That keeps
 * the on-screen distance between merged pins roughly constant: zooming out
 * collapses neighbouring drivers into a single cluster, zooming in splits them
 * back apart. The result is clamped so extreme zooms cannot degenerate into
 * one bucket per driver or a single bucket for the whole world.
 */
export function cellSizeForZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return DEFAULT_CLUSTER_CELL_SIZE;
  const size = DEFAULT_CLUSTER_CELL_SIZE * 2 ** (REFERENCE_ZOOM - zoom);
  return Math.min(MAX_CELL_SIZE, Math.max(MIN_CELL_SIZE, size));
}
