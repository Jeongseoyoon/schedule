import type { TleInput } from "../lib/types/tle";
import type { GroundStationInput } from "../lib/types/coordinates";

export const sampleTle: TleInput = {
  name: "ISS (ZARYA)",
  line1:
    "1 25544U 98067A   21075.51005787  .00001264  00000-0  29621-4 0  9993",
  line2:
    "2 25544  51.6468  59.1573 0002294  90.7647  15.5593 15.48910781273144",
};

export const sampleGroundStations: GroundStationInput[] = [
  {
    id: "kr-sat-01",
    name: "KR Test Ground",
    latitudeDeg: 37.5665,
    longitudeDeg: 126.978,
    altitudeM: 30,
    minElevationDeg: 10,
  },
];

