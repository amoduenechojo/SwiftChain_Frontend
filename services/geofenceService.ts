/**
 * Geofence Service
 * Pure distance and proximity logic used to raise geo-fencing alerts when a
 * driver approaches a delivery destination.
 *
 * The module is deliberately free of network and browser dependencies so the
 * alert rules can be unit tested in isolation. Hooks and components consume it
 * through the usual Component -> Hook -> Service flow.
 */

import type { Coordinate } from '@/types/tracking';
import type {
  Geofence,
  GeofenceAlert,
  GeofenceEvaluation,
  GeofenceMonitorOptions,
} from '@/types/geofence';

/** Mean radius of the Earth in kilometres, as used by the haversine formula. */
export const EARTH_RADIUS_KM = 6371;

/** Distance from the destination, in km, at which a driver counts as arrived. */
export const DEFAULT_ARRIVAL_THRESHOLD_KM = 0.1;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Validate a coordinate pair.
 * @throws Error when the coordinate is missing, non-numeric, or out of range.
 */
export function assertValidCoordinate(
  coordinate: Coordinate | null | undefined,
  name = 'coordinate'
): asserts coordinate is Coordinate {
  if (!coordinate) {
    throw new Error(`Invalid ${name}: coordinate is required`);
  }

  const { latitude, longitude } = coordinate;

  if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude)) {
    throw new Error(`Invalid ${name}: latitude and longitude must be finite numbers`);
  }

  if (latitude < -90 || latitude > 90) {
    throw new Error(`Invalid ${name}: latitude must be between -90 and 90`);
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error(`Invalid ${name}: longitude must be between -180 and 180`);
  }
}

/**
 * Great-circle distance between two coordinates using the haversine formula.
 *
 * @param from - Starting coordinate
 * @param to - Ending coordinate
 * @returns Distance in kilometres (always non-negative)
 * @throws Error when either coordinate is invalid
 */
export function calculateDistanceKm(from: Coordinate, to: Coordinate): number {
  assertValidCoordinate(from, 'origin');
  assertValidCoordinate(to, 'destination');

  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLon / 2) ** 2;

  // Clamping guards against floating point drift pushing `a` marginally
  // outside [0, 1], which would make Math.sqrt return NaN.
  const c = 2 * Math.atan2(Math.sqrt(Math.min(a, 1)), Math.sqrt(Math.max(1 - a, 0)));

  return EARTH_RADIUS_KM * c;
}

/**
 * Convenience wrapper returning the great-circle distance in metres.
 */
export function calculateDistanceMeters(from: Coordinate, to: Coordinate): number {
  return calculateDistanceKm(from, to) * 1000;
}

/**
 * Validate a geo-fence definition.
 * @throws Error when the centre is invalid or the radius is not positive.
 */
export function assertValidGeofence(
  geofence: Geofence | null | undefined
): asserts geofence is Geofence {
  if (!geofence) {
    throw new Error('Invalid geofence: geofence is required');
  }

  assertValidCoordinate(geofence.center, 'geofence center');

  if (!isFiniteNumber(geofence.radiusKm) || geofence.radiusKm <= 0) {
    throw new Error('Invalid geofence: radiusKm must be a positive number');
  }
}

/**
 * Whether a position falls inside a geo-fence. The boundary itself counts as
 * inside, so a driver sitting exactly on the radius has entered the zone.
 *
 * @throws Error when the position or geo-fence is invalid
 */
export function isWithinGeofence(position: Coordinate, geofence: Geofence): boolean {
  assertValidGeofence(geofence);
  return calculateDistanceKm(position, geofence.center) <= geofence.radiusKm;
}

function resolveArrivalThreshold(
  options: GeofenceMonitorOptions,
  geofence: Geofence
): number {
  const requested = options.arrivalThresholdKm;

  if (requested === undefined) {
    // Keep the default arrival zone well inside the fence, otherwise a very
    // tight geo-fence would report "arrived" the moment it is entered and the
    // approaching alert would never fire.
    return Math.min(DEFAULT_ARRIVAL_THRESHOLD_KM, geofence.radiusKm / 2);
  }

  if (!isFiniteNumber(requested) || requested < 0) {
    throw new Error('Invalid options: arrivalThresholdKm must be a non-negative number');
  }

  return requested;
}

function buildAlert(
  type: GeofenceAlert['type'],
  position: Coordinate,
  geofence: Geofence,
  distanceKm: number,
  timestamp: string
): GeofenceAlert {
  return {
    type,
    distanceKm,
    radiusKm: geofence.radiusKm,
    coordinate: { latitude: position.latitude, longitude: position.longitude },
    geofenceId: geofence.id,
    label: geofence.label,
    timestamp,
  };
}

/**
 * Evaluate a single driver position against a geo-fence, without any history.
 *
 * Because this call is stateless it reports the alert a crossing *would*
 * produce; use {@link createGeofenceMonitor} when a stream of position updates
 * must raise only one alert per boundary crossing.
 *
 * @param position - Current driver coordinate
 * @param geofence - Zone to evaluate against
 * @param options - Arrival threshold configuration
 * @throws Error when the position, geo-fence, or options are invalid
 */
export function evaluateGeofence(
  position: Coordinate,
  geofence: Geofence,
  options: GeofenceMonitorOptions = {}
): GeofenceEvaluation {
  assertValidGeofence(geofence);
  assertValidCoordinate(position, 'position');

  const arrivalThresholdKm = resolveArrivalThreshold(options, geofence);
  const distanceKm = calculateDistanceKm(position, geofence.center);
  const isInside = distanceKm <= geofence.radiusKm;
  const hasArrived = distanceKm <= arrivalThresholdKm;

  if (!isInside) {
    return { distanceKm, isInside, hasArrived, shouldAlert: false, alert: null };
  }

  const alert = buildAlert(
    hasArrived ? 'arrived' : 'approaching',
    position,
    geofence,
    distanceKm,
    new Date().toISOString()
  );

  return { distanceKm, isInside, hasArrived, shouldAlert: true, alert };
}

/**
 * Stateful geo-fence monitor.
 *
 * Feed it consecutive driver positions and it raises at most one alert per
 * boundary crossing: `approaching` on entry, `arrived` once the driver reaches
 * the arrival threshold, and `departed` when they leave the zone again. Leaving
 * re-arms the alerts, so a driver circling the destination is not reported on
 * every single update.
 */
export function createGeofenceMonitor(
  geofence: Geofence,
  options: GeofenceMonitorOptions = {}
) {
  assertValidGeofence(geofence);

  const arrivalThresholdKm = resolveArrivalThreshold(options, geofence);
  const alertOnExit = options.alertOnExit ?? true;

  let hasEntered = false;
  let hasAnnouncedArrival = false;

  /** Forget the crossing history so the next entry alerts again. */
  function reset(): void {
    hasEntered = false;
    hasAnnouncedArrival = false;
  }

  /**
   * Evaluate the next driver position.
   * @throws Error when the position is invalid
   */
  function update(position: Coordinate): GeofenceEvaluation {
    assertValidCoordinate(position, 'position');

    const distanceKm = calculateDistanceKm(position, geofence.center);
    const isInside = distanceKm <= geofence.radiusKm;
    const hasArrived = distanceKm <= arrivalThresholdKm;
    const timestamp = new Date().toISOString();

    if (!isInside) {
      const alert =
        hasEntered && alertOnExit
          ? buildAlert('departed', position, geofence, distanceKm, timestamp)
          : null;

      reset();

      return { distanceKm, isInside, hasArrived, shouldAlert: alert !== null, alert };
    }

    let alert: GeofenceAlert | null = null;

    if (hasArrived && !hasAnnouncedArrival) {
      alert = buildAlert('arrived', position, geofence, distanceKm, timestamp);
      hasAnnouncedArrival = true;
    } else if (!hasEntered) {
      alert = buildAlert('approaching', position, geofence, distanceKm, timestamp);
    }

    hasEntered = true;

    return { distanceKm, isInside, hasArrived, shouldAlert: alert !== null, alert };
  }

  return {
    update,
    reset,
    /** True once the driver has entered the zone and has not yet left it. */
    get isInside(): boolean {
      return hasEntered;
    },
  };
}

export const geofenceService = {
  calculateDistanceKm,
  calculateDistanceMeters,
  isWithinGeofence,
  evaluateGeofence,
  createGeofenceMonitor,
};
