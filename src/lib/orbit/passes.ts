import {
  GroundStationInput,
  GroundStationPassResult,
  PassEvent,
  TrajectoryResult,
} from "../types/coordinates";
import { DEG2RAD, RAD2DEG, WGS84 } from "../constants/wgs84";

function groundStationToEcef(gs: GroundStationInput): {
  x: number;
  y: number;
  z: number;
} {
  const a = WGS84.a;
  const f = WGS84.f;
  const e2 = 2 * f - f * f;
  const lat = gs.latitudeDeg * DEG2RAD;
  const lon = gs.longitudeDeg * DEG2RAD;
  const h = gs.altitudeM / 1000.0;

  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const cosLon = Math.cos(lon);
  const sinLon = Math.sin(lon);
  const N = a / Math.sqrt(1 - e2 * sinLat * sinLat);

  const x = (N + h) * cosLat * cosLon;
  const y = (N + h) * cosLat * sinLon;
  const z = (N * (1 - e2) + h) * sinLat;

  return { x, y, z };
}

function computeElevationDeg(
  satEcef: { x: number; y: number; z: number },
  gsEcef: { x: number; y: number; z: number },
  gsLatDeg: number,
  gsLonDeg: number,
): number {
  const rx = satEcef.x - gsEcef.x;
  const ry = satEcef.y - gsEcef.y;
  const rz = satEcef.z - gsEcef.z;

  const lat = gsLatDeg * DEG2RAD;
  const lon = gsLonDeg * DEG2RAD;

  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const sinLon = Math.sin(lon);
  const cosLon = Math.cos(lon);

  const e = -sinLon * rx + cosLon * ry;
  const n = -sinLat * cosLon * rx - sinLat * sinLon * ry + cosLat * rz;
  const u = cosLat * cosLon * rx + cosLat * sinLon * ry + sinLat * rz;

  const horizontalDist = Math.sqrt(e * e + n * n);
  const elev = Math.atan2(u, horizontalDist);
  return elev * RAD2DEG;
}

export interface PassComputationOptions {
  elevationStepDeg?: number;
}

export function computePassesForGroundStation(
  trajectory: TrajectoryResult,
  groundStation: GroundStationInput,
  _options: PassComputationOptions = {},
): GroundStationPassResult {
  const gsEcef = groundStationToEcef(groundStation);

  const passes: PassEvent[] = [];
  const minElev = groundStation.minElevationDeg;
  let inPass = false;
  let aosTime: string | null = null;
  let maxElev = -Infinity;
  let maxElevTime: string | null = null;

  for (const sample of trajectory.samples) {
    const elev = computeElevationDeg(
      sample.ecef,
      gsEcef,
      groundStation.latitudeDeg,
      groundStation.longitudeDeg,
    );

    const above = elev >= minElev;
    if (above && !inPass) {
      inPass = true;
      aosTime = sample.t;
      maxElev = elev;
      maxElevTime = sample.t;
    } else if (above && inPass) {
      if (elev > maxElev) {
        maxElev = elev;
        maxElevTime = sample.t;
      }
    } else if (!above && inPass) {
      const losTime = sample.t;
      if (!aosTime || !maxElevTime) continue;
      const durationSec =
        (new Date(losTime).getTime() - new Date(aosTime).getTime()) / 1000;

      passes.push({
        aos: aosTime,
        los: losTime,
        durationSec,
        maxElevationDeg: maxElev,
        maxElevationTime: maxElevTime,
      });

      inPass = false;
      aosTime = null;
      maxElevTime = null;
    }
  }

  return {
    groundStationId: groundStation.id,
    groundStationName: groundStation.name,
    passes,
  };
}

export function computePassesForStations(
  trajectory: TrajectoryResult,
  groundStations: GroundStationInput[],
  options?: PassComputationOptions,
): GroundStationPassResult[] {
  return groundStations.map((gs) =>
    computePassesForGroundStation(trajectory, gs, options),
  );
}

