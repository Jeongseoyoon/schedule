import { TleInput } from "../types/tle";
import {
  EciCoordinate,
  TrajectoryResult,
  TrajectorySample,
} from "../types/coordinates";
import { dateFromUtcString } from "../time/utc";
import { eciToEcef, ecefToGeodetic } from "./frames";
import * as sat from "satellite.js";

export function propagateEciAtTime(tle: TleInput, utc: string): EciCoordinate {
  const satrec = sat.twoline2satrec(tle.line1, tle.line2);
  const date = dateFromUtcString(utc);
  const positionAndVelocity = sat.propagate(satrec, date);

  if (!positionAndVelocity.position || !positionAndVelocity.velocity) {
    throw new Error("SGP4 propagation failed");
  }

  const { position, velocity } = positionAndVelocity;

  return {
    x: position.x,
    y: position.y,
    z: position.z,
    vx: velocity.x,
    vy: velocity.y,
    vz: velocity.z,
    t: utc,
  };
}

export function computeTrajectory(
  tle: TleInput,
  startUtc: string,
  endUtc: string,
  stepSec: number,
): TrajectoryResult {
  const start = dateFromUtcString(startUtc).getTime();
  const end = dateFromUtcString(endUtc).getTime();
  const stepMs = stepSec * 1000;

  const samples: TrajectorySample[] = [];
  for (let t = start; t <= end; t += stepMs) {
    const utc = new Date(t).toISOString();
    const eci = propagateEciAtTime(tle, utc);
    const ecef = eciToEcef(eci);
    const geo = ecefToGeodetic(ecef);

    samples.push({
      t: utc,
      eci,
      ecef,
      geodetic: geo,
    });
  }

  return {
    satelliteName: tle.name,
    tleLine1: tle.line1,
    tleLine2: tle.line2,
    samples,
  };
}

