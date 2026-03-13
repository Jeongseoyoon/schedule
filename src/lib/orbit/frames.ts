import {
  EciCoordinate,
  EcefCoordinate,
  GeodeticCoordinate,
} from "../types/coordinates";
import { WGS84, RAD2DEG } from "../constants/wgs84";
import { gmstFromDate, dateFromUtcString } from "../time/utc";

export function eciToEcef(eci: EciCoordinate): EcefCoordinate {
  const date = dateFromUtcString(eci.t);
  const theta = gmstFromDate(date);
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  const x = cosT * eci.x + sinT * eci.y;
  const y = -sinT * eci.x + cosT * eci.y;
  const z = eci.z;

  return { x, y, z, t: eci.t };
}

export function ecefToGeodetic(ecef: EcefCoordinate): GeodeticCoordinate {
  const { a, f } = WGS84;
  const e2 = 2 * f - f * f;
  const x = ecef.x;
  const y = ecef.y;
  const z = ecef.z;
  const r2 = x * x + y * y;
  const r = Math.sqrt(r2);

  const lon = Math.atan2(y, x);
  let lat = Math.atan2(z, r * (1 - e2));
  let h = 0;

  for (let i = 0; i < 5; i++) {
    const sinLat = Math.sin(lat);
    const N = a / Math.sqrt(1 - e2 * sinLat * sinLat);
    h = r / Math.cos(lat) - N;
    lat = Math.atan2(z, r * (1 - e2 * (N / (N + h))));
  }

  return {
    lat: lat * RAD2DEG,
    lon: lon * RAD2DEG,
    height: h,
    t: ecef.t,
  };
}

