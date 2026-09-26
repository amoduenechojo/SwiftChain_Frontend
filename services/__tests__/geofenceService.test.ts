import {
  DEFAULT_ARRIVAL_THRESHOLD_KM,
  EARTH_RADIUS_KM,
  assertValidCoordinate,
  assertValidGeofence,
  calculateDistanceKm,
  calculateDistanceMeters,
  createGeofenceMonitor,
  evaluateGeofence,
  geofenceService,
  isWithinGeofence,
} from '@/services/geofenceService';
import type { Coordinate } from '@/types/tracking';
import type { Geofence } from '@/types/geofence';

/** Lagos, Nigeria — used as the delivery destination throughout. */
const DESTINATION: Coordinate = { latitude: 6.5244, longitude: 3.3792 };

/** Roughly 5 km due north of DESTINATION. */
const FIVE_KM_NORTH: Coordinate = { latitude: 6.5694, longitude: 3.3792 };

const geofence = (overrides: Partial<Geofence> = {}): Geofence => ({
  center: DESTINATION,
  radiusKm: 2,
  id: 'fence-1',
  label: 'Lagos Warehouse',
  ...overrides,
});

/**
 * Build a coordinate a given number of kilometres due north of `from`.
 * Along a meridian one degree of latitude is a constant arc, so this is exact
 * for the haversine model the service uses.
 */
function northOf(from: Coordinate, km: number): Coordinate {
  const degreesPerKm = 180 / (Math.PI * EARTH_RADIUS_KM);
  return { latitude: from.latitude + km * degreesPerKm, longitude: from.longitude };
}

describe('geofenceService', () => {
  describe('calculateDistanceKm', () => {
    it('returns zero for identical coordinates', () => {
      expect(calculateDistanceKm(DESTINATION, { ...DESTINATION })).toBe(0);
    });

    it('measures a known short distance accurately', () => {
      // ~5 km separation; allow 50 m of tolerance for the spherical model
      expect(calculateDistanceKm(DESTINATION, FIVE_KM_NORTH)).toBeCloseTo(5, 1);
    });

    it('measures a known long distance accurately', () => {
      const lagos: Coordinate = { latitude: 6.5244, longitude: 3.3792 };
      const nairobi: Coordinate = { latitude: -1.2921, longitude: 36.8219 };

      // Published great-circle distance is approximately 3826 km
      expect(calculateDistanceKm(lagos, nairobi)).toBeCloseTo(3826, -2);
    });

    it('is symmetric', () => {
      const forward = calculateDistanceKm(DESTINATION, FIVE_KM_NORTH);
      const backward = calculateDistanceKm(FIVE_KM_NORTH, DESTINATION);

      expect(forward).toBeCloseTo(backward, 10);
    });

    it('handles antipodal points without NaN from floating point drift', () => {
      const north: Coordinate = { latitude: 90, longitude: 0 };
      const south: Coordinate = { latitude: -90, longitude: 0 };

      const distance = calculateDistanceKm(north, south);

      expect(Number.isNaN(distance)).toBe(false);
      expect(distance).toBeCloseTo(Math.PI * EARTH_RADIUS_KM, 6);
    });

    it('handles coordinates spanning the antimeridian', () => {
      const west: Coordinate = { latitude: 0, longitude: 179.9 };
      const east: Coordinate = { latitude: 0, longitude: -179.9 };

      // 0.2 degrees of longitude at the equator is roughly 22 km
      expect(calculateDistanceKm(west, east)).toBeCloseTo(22.2, 0);
    });

    it('handles negative latitudes and longitudes', () => {
      const a: Coordinate = { latitude: -33.8688, longitude: 151.2093 };
      const b: Coordinate = { latitude: -37.8136, longitude: 144.9631 };

      // Sydney to Melbourne is approximately 714 km
      expect(calculateDistanceKm(a, b)).toBeCloseTo(714, -2);
    });

    it('accepts the extremes of the valid coordinate range', () => {
      expect(() =>
        calculateDistanceKm({ latitude: -90, longitude: -180 }, { latitude: 90, longitude: 180 })
      ).not.toThrow();
    });

    it.each([
      ['latitude above 90', { latitude: 90.1, longitude: 0 }, /latitude must be between/],
      ['latitude below -90', { latitude: -90.1, longitude: 0 }, /latitude must be between/],
      ['longitude above 180', { latitude: 0, longitude: 180.1 }, /longitude must be between/],
      ['longitude below -180', { latitude: 0, longitude: -180.1 }, /longitude must be between/],
      ['NaN latitude', { latitude: NaN, longitude: 0 }, /finite numbers/],
      ['infinite longitude', { latitude: 0, longitude: Infinity }, /finite numbers/],
    ])('throws for %s', (_label, coordinate, message) => {
      expect(() => calculateDistanceKm(DESTINATION, coordinate as Coordinate)).toThrow(
        message as RegExp
      );
    });

    it('throws when a coordinate is missing', () => {
      expect(() =>
        calculateDistanceKm(null as unknown as Coordinate, DESTINATION)
      ).toThrow('Invalid origin: coordinate is required');
    });

    it('names the offending argument in the error message', () => {
      expect(() =>
        calculateDistanceKm(DESTINATION, undefined as unknown as Coordinate)
      ).toThrow('Invalid destination: coordinate is required');
    });
  });

  describe('calculateDistanceMeters', () => {
    it('returns the kilometre distance scaled by 1000', () => {
      const km = calculateDistanceKm(DESTINATION, FIVE_KM_NORTH);

      expect(calculateDistanceMeters(DESTINATION, FIVE_KM_NORTH)).toBeCloseTo(km * 1000, 6);
    });

    it('returns zero for identical coordinates', () => {
      expect(calculateDistanceMeters(DESTINATION, { ...DESTINATION })).toBe(0);
    });
  });

  describe('assertValidCoordinate', () => {
    it('passes for a valid coordinate', () => {
      expect(() => assertValidCoordinate(DESTINATION)).not.toThrow();
    });

    it('uses the default argument name when none is supplied', () => {
      expect(() => assertValidCoordinate(null)).toThrow(
        'Invalid coordinate: coordinate is required'
      );
    });
  });

  describe('assertValidGeofence', () => {
    it('passes for a valid geofence', () => {
      expect(() => assertValidGeofence(geofence())).not.toThrow();
    });

    it('throws when the geofence is missing', () => {
      expect(() => assertValidGeofence(undefined)).toThrow(
        'Invalid geofence: geofence is required'
      );
    });

    it('throws when the centre coordinate is invalid', () => {
      expect(() =>
        assertValidGeofence(geofence({ center: { latitude: 200, longitude: 0 } }))
      ).toThrow(/geofence center/);
    });

    it.each([0, -1, NaN, Infinity])('throws for radiusKm %p', (radiusKm) => {
      expect(() => assertValidGeofence(geofence({ radiusKm }))).toThrow(
        'Invalid geofence: radiusKm must be a positive number'
      );
    });
  });

  describe('isWithinGeofence', () => {
    it('returns true when the driver is inside the zone', () => {
      expect(isWithinGeofence(northOf(DESTINATION, 1), geofence({ radiusKm: 2 }))).toBe(true);
    });

    it('returns false when the driver is outside the zone', () => {
      expect(isWithinGeofence(northOf(DESTINATION, 3), geofence({ radiusKm: 2 }))).toBe(false);
    });

    it('treats the boundary itself as inside', () => {
      expect(isWithinGeofence(northOf(DESTINATION, 2), geofence({ radiusKm: 2 }))).toBe(true);
    });

    it('returns false just outside the boundary', () => {
      expect(isWithinGeofence(northOf(DESTINATION, 2.001), geofence({ radiusKm: 2 }))).toBe(
        false
      );
    });

    it('validates the geofence before measuring', () => {
      expect(() => isWithinGeofence(DESTINATION, geofence({ radiusKm: -5 }))).toThrow(
        /radiusKm must be a positive number/
      );
    });
  });

  describe('evaluateGeofence', () => {
    it('raises an approaching alert when the driver enters the zone', () => {
      const result = evaluateGeofence(northOf(DESTINATION, 1.5), geofence({ radiusKm: 2 }));

      expect(result.isInside).toBe(true);
      expect(result.hasArrived).toBe(false);
      expect(result.shouldAlert).toBe(true);
      expect(result.alert?.type).toBe('approaching');
      expect(result.distanceKm).toBeCloseTo(1.5, 3);
    });

    it('raises an arrived alert within the arrival threshold', () => {
      const result = evaluateGeofence(northOf(DESTINATION, 0.05), geofence({ radiusKm: 2 }));

      expect(result.hasArrived).toBe(true);
      expect(result.alert?.type).toBe('arrived');
    });

    it('does not alert while the driver is outside the zone', () => {
      const result = evaluateGeofence(northOf(DESTINATION, 10), geofence({ radiusKm: 2 }));

      expect(result.isInside).toBe(false);
      expect(result.shouldAlert).toBe(false);
      expect(result.alert).toBeNull();
      expect(result.distanceKm).toBeCloseTo(10, 2);
    });

    it('includes the zone identity and radius on the alert', () => {
      const result = evaluateGeofence(
        DESTINATION,
        geofence({ id: 'fence-42', label: 'Ikeja Hub', radiusKm: 3 })
      );

      expect(result.alert).toMatchObject({
        geofenceId: 'fence-42',
        label: 'Ikeja Hub',
        radiusKm: 3,
        coordinate: DESTINATION,
      });
      expect(Date.parse(result.alert!.timestamp)).not.toBeNaN();
    });

    it('omits identity fields when the zone declares none', () => {
      const result = evaluateGeofence(DESTINATION, {
        center: DESTINATION,
        radiusKm: 1,
      });

      expect(result.alert?.geofenceId).toBeUndefined();
      expect(result.alert?.label).toBeUndefined();
    });

    it('honours a custom arrival threshold', () => {
      const position = northOf(DESTINATION, 0.4);
      const fence = geofence({ radiusKm: 2 });

      expect(evaluateGeofence(position, fence).alert?.type).toBe('approaching');
      expect(
        evaluateGeofence(position, fence, { arrivalThresholdKm: 0.5 }).alert?.type
      ).toBe('arrived');
    });

    it('clamps the default arrival threshold to a tighter radius', () => {
      const tightFence = geofence({ radiusKm: DEFAULT_ARRIVAL_THRESHOLD_KM });
      const result = evaluateGeofence(northOf(DESTINATION, 0.08), tightFence);

      // Without clamping, entering this zone at all would report "arrived"
      expect(result.isInside).toBe(true);
      expect(result.hasArrived).toBe(false);
      expect(result.alert?.type).toBe('approaching');
    });

    it.each([-1, NaN])('throws for arrivalThresholdKm %p', (arrivalThresholdKm) => {
      expect(() =>
        evaluateGeofence(DESTINATION, geofence(), { arrivalThresholdKm })
      ).toThrow('Invalid options: arrivalThresholdKm must be a non-negative number');
    });

    it('accepts an arrival threshold of exactly zero', () => {
      const result = evaluateGeofence(DESTINATION, geofence(), { arrivalThresholdKm: 0 });

      expect(result.hasArrived).toBe(true);
    });

    it('throws for an invalid driver position', () => {
      expect(() =>
        evaluateGeofence({ latitude: NaN, longitude: 0 }, geofence())
      ).toThrow(/Invalid position/);
    });

    it('is stateless — repeated calls keep alerting', () => {
      const position = northOf(DESTINATION, 1);
      const fence = geofence();

      expect(evaluateGeofence(position, fence).shouldAlert).toBe(true);
      expect(evaluateGeofence(position, fence).shouldAlert).toBe(true);
    });
  });

  describe('createGeofenceMonitor', () => {
    it('rejects an invalid geofence at construction time', () => {
      expect(() => createGeofenceMonitor(geofence({ radiusKm: 0 }))).toThrow(
        /radiusKm must be a positive number/
      );
    });

    it('stays silent while the driver is still far away', () => {
      const monitor = createGeofenceMonitor(geofence({ radiusKm: 2 }));

      const result = monitor.update(northOf(DESTINATION, 20));

      expect(result.shouldAlert).toBe(false);
      expect(result.alert).toBeNull();
      expect(monitor.isInside).toBe(false);
    });

    it('alerts once on entry and stays quiet on subsequent updates inside', () => {
      const monitor = createGeofenceMonitor(geofence({ radiusKm: 2 }));

      monitor.update(northOf(DESTINATION, 5));
      const entry = monitor.update(northOf(DESTINATION, 1.8));
      const stillInside = monitor.update(northOf(DESTINATION, 1.5));

      expect(entry.shouldAlert).toBe(true);
      expect(entry.alert?.type).toBe('approaching');
      expect(stillInside.shouldAlert).toBe(false);
      expect(stillInside.alert).toBeNull();
      expect(monitor.isInside).toBe(true);
    });

    it('follows an approach with a single arrival alert', () => {
      const monitor = createGeofenceMonitor(geofence({ radiusKm: 2 }));

      monitor.update(northOf(DESTINATION, 1.5));
      const arrival = monitor.update(northOf(DESTINATION, 0.02));
      const parked = monitor.update(DESTINATION);

      expect(arrival.alert?.type).toBe('arrived');
      expect(parked.shouldAlert).toBe(false);
    });

    it('reports arrival directly when the first fix is at the destination', () => {
      const monitor = createGeofenceMonitor(geofence({ radiusKm: 2 }));

      const result = monitor.update(DESTINATION);

      expect(result.alert?.type).toBe('arrived');
      expect(result.distanceKm).toBe(0);
    });

    it('emits a departed alert when the driver leaves the zone', () => {
      const monitor = createGeofenceMonitor(geofence({ radiusKm: 2 }));

      monitor.update(northOf(DESTINATION, 1));
      const departure = monitor.update(northOf(DESTINATION, 4));

      expect(departure.alert?.type).toBe('departed');
      expect(departure.isInside).toBe(false);
      expect(monitor.isInside).toBe(false);
    });

    it('suppresses the departed alert when alertOnExit is false', () => {
      const monitor = createGeofenceMonitor(geofence({ radiusKm: 2 }), {
        alertOnExit: false,
      });

      monitor.update(northOf(DESTINATION, 1));
      const departure = monitor.update(northOf(DESTINATION, 4));

      expect(departure.shouldAlert).toBe(false);
      expect(departure.alert).toBeNull();
    });

    it('does not emit a departed alert for a driver who was never inside', () => {
      const monitor = createGeofenceMonitor(geofence({ radiusKm: 2 }));

      const first = monitor.update(northOf(DESTINATION, 10));
      const second = monitor.update(northOf(DESTINATION, 8));

      expect(first.shouldAlert).toBe(false);
      expect(second.shouldAlert).toBe(false);
    });

    it('re-arms after the driver leaves and returns', () => {
      const monitor = createGeofenceMonitor(geofence({ radiusKm: 2 }));

      monitor.update(northOf(DESTINATION, 1.5));
      monitor.update(northOf(DESTINATION, 5));
      const reentry = monitor.update(northOf(DESTINATION, 1.5));

      expect(reentry.alert?.type).toBe('approaching');
    });

    it('re-arms the arrival alert after a departure', () => {
      const monitor = createGeofenceMonitor(geofence({ radiusKm: 2 }));

      monitor.update(DESTINATION);
      monitor.update(northOf(DESTINATION, 5));
      const secondArrival = monitor.update(DESTINATION);

      expect(secondArrival.alert?.type).toBe('arrived');
    });

    it('emits exactly one alert per crossing across a full approach', () => {
      const monitor = createGeofenceMonitor(geofence({ radiusKm: 2 }));
      const track = [12, 8, 5, 3, 1.9, 1.2, 0.6, 0.2, 0.05, 0.01, 0].map((km) =>
        northOf(DESTINATION, km)
      );

      const alerts = track
        .map((position) => monitor.update(position))
        .filter((result) => result.shouldAlert)
        .map((result) => result.alert!.type);

      expect(alerts).toEqual(['approaching', 'arrived']);
    });

    it('reports a monotonically decreasing distance along an approach', () => {
      const monitor = createGeofenceMonitor(geofence({ radiusKm: 2 }));
      const distances = [5, 4, 3, 2, 1].map(
        (km) => monitor.update(northOf(DESTINATION, km)).distanceKm
      );

      expect(distances).toEqual([...distances].sort((a, b) => b - a));
      distances.forEach((distance, index) => {
        expect(distance).toBeCloseTo([5, 4, 3, 2, 1][index], 3);
      });
    });

    it('reset() clears the crossing history', () => {
      const monitor = createGeofenceMonitor(geofence({ radiusKm: 2 }));

      monitor.update(northOf(DESTINATION, 1));
      monitor.reset();

      expect(monitor.isInside).toBe(false);
      expect(monitor.update(northOf(DESTINATION, 1)).alert?.type).toBe('approaching');
    });

    it('throws for an invalid position update without corrupting state', () => {
      const monitor = createGeofenceMonitor(geofence({ radiusKm: 2 }));

      monitor.update(northOf(DESTINATION, 1));

      expect(() => monitor.update({ latitude: 91, longitude: 0 })).toThrow(
        /Invalid position/
      );
      expect(monitor.isInside).toBe(true);
    });

    it('keeps two monitors independent of one another', () => {
      const near = createGeofenceMonitor(geofence({ id: 'near', radiusKm: 2 }));
      const far = createGeofenceMonitor(geofence({ id: 'far', radiusKm: 10 }));

      const position = northOf(DESTINATION, 5);

      expect(near.update(position).shouldAlert).toBe(false);
      expect(far.update(position).alert?.geofenceId).toBe('far');
    });

    it('timestamps alerts with the current time', () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-01T12:00:00.000Z'));

      try {
        const monitor = createGeofenceMonitor(geofence({ radiusKm: 2 }));
        const result = monitor.update(northOf(DESTINATION, 1));

        expect(result.alert?.timestamp).toBe('2026-01-01T12:00:00.000Z');
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('geofenceService facade', () => {
    it('exposes the public API', () => {
      expect(geofenceService).toEqual({
        calculateDistanceKm,
        calculateDistanceMeters,
        isWithinGeofence,
        evaluateGeofence,
        createGeofenceMonitor,
      });
    });
  });
});
