import { WGS84 } from "../constants/wgs84";

export function dateFromUtcString(utc: string): Date {
  const d = new Date(utc);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid UTC timestamp: ${utc}`);
  }
  return d;
}

// UTC Date → Julian Date
export function toJulianDate(date: Date): number {
  const time = date.getTime();
  return time / 86400000 + 2440587.5;
}

// IAU 1982 approximate GMST (rad)
export function gmstFromDate(date: Date): number {
  const jd = toJulianDate(date);
  const T = (jd - 2451545.0) / 36525.0;
  const gmstSec =
    67310.54841 +
    (876600.0 * 3600 + 8640184.812866) * T +
    0.093104 * T * T -
    6.2e-6 * T * T * T;
  let gmstRad = ((gmstSec % 86400) * (2 * Math.PI)) / 86400;
  if (gmstRad < 0) gmstRad += 2 * Math.PI;
  return gmstRad;
}

