/**
 * Geo-fencing Types
 * Interfaces for proximity zones and the alerts raised when a driver
 * approaches a delivery destination.
 */

import type { Coordinate } from '@/types/tracking';

/**
 * A circular proximity zone centred on a destination.
 */
export interface Geofence {
  /** Centre of the zone — normally the delivery destination */
  center: Coordinate;
  /** Zone radius in kilometres. Must be greater than zero. */
  radiusKm: number;
  /** Optional identifier, echoed back on any alert raised for this zone */
  id?: string;
  /** Optional human-readable label, e.g. "Lagos Warehouse" */
  label?: string;
}

/**
 * Why a geo-fence alert was raised.
 * - `approaching`: the driver crossed into the zone from outside
 * - `arrived`: the driver reached the arrival threshold inside the zone
 * - `departed`: the driver left a zone they had previously entered
 */
export type GeofenceAlertType = 'approaching' | 'arrived' | 'departed';

/**
 * Alert emitted when a driver's position crosses a geo-fence boundary.
 */
export interface GeofenceAlert {
  type: GeofenceAlertType;
  /** Great-circle distance from the driver to the zone centre, in kilometres */
  distanceKm: number;
  /** Radius of the zone that produced the alert, in kilometres */
  radiusKm: number;
  /** Driver position that produced the alert */
  coordinate: Coordinate;
  /** Identifier of the zone, when the zone declares one */
  geofenceId?: string;
  /** Label of the zone, when the zone declares one */
  label?: string;
  /** ISO timestamp of the evaluation */
  timestamp: string;
}

/**
 * Result of evaluating a single driver position against a geo-fence.
 */
export interface GeofenceEvaluation {
  /** Great-circle distance from the driver to the zone centre, in kilometres */
  distanceKm: number;
  /** True when the driver is inside the zone radius */
  isInside: boolean;
  /** True when the driver is within the arrival threshold of the centre */
  hasArrived: boolean;
  /** True when this position changed the zone state and an alert was raised */
  shouldAlert: boolean;
  /** The alert raised by this evaluation, if any */
  alert: GeofenceAlert | null;
}

/**
 * Options accepted by the geo-fence monitor.
 */
export interface GeofenceMonitorOptions {
  /**
   * Distance from the centre, in kilometres, at which the driver counts as
   * arrived rather than merely approaching. Defaults to 0.1 km (100 m).
   */
  arrivalThresholdKm?: number;
  /**
   * Emit a `departed` alert when the driver leaves a zone they had entered.
   * Defaults to true.
   */
  alertOnExit?: boolean;
}
