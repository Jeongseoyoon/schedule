export type TimestampUTC = string; // ISO 8601, e.g. "2026-03-13T00:00:00Z"

export interface EciCoordinate {
  x: number; // km
  y: number; // km
  z: number; // km
  vx: number; // km/s
  vy: number; // km/s
  vz: number; // km/s
  t: TimestampUTC;
}

export interface EcefCoordinate {
  x: number; // km
  y: number; // km
  z: number; // km
  t: TimestampUTC;
}

export interface GeodeticCoordinate {
  lat: number; // deg
  lon: number; // deg
  height: number; // km
  t: TimestampUTC;
}

export interface GroundStationInput {
  id: string;
  name: string;
  latitudeDeg: number;
  longitudeDeg: number;
  altitudeM: number;
  minElevationDeg: number;
}

export interface PassEvent {
  aos: TimestampUTC;
  los: TimestampUTC;
  durationSec: number;
  maxElevationDeg: number;
  maxElevationTime: TimestampUTC;
}

export interface GroundStationPassResult {
  groundStationId: string;
  groundStationName: string;
  passes: PassEvent[];
}

export interface TrajectorySample {
  t: TimestampUTC;
  eci: EciCoordinate;
  ecef: EcefCoordinate;
  geodetic: GeodeticCoordinate;
}

export interface TrajectoryResult {
  satelliteName: string;
  tleLine1: string;
  tleLine2: string;
  samples: TrajectorySample[];
}
