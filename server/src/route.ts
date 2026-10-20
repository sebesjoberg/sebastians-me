// Turns a Strava route into a bare shape for the site: no coordinates, no
// scale, and with the ends cut off, so it cannot be traced back to where a
// run started (usually home).

/** Metres cut off each end of the route before drawing it. */
const TRIM_M = 400;
/** Plenty for a 72px drawing. */
const MAX_POINTS = 120;

type LatLng = [number, number];

// Google's encoded polyline format, which Strava uses for summary maps.
function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    for (const axis of [0, 1]) {
      let result = 0;
      let shift = 0;
      let byte: number;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (axis === 0) {
        lat += delta;
      } else {
        lng += delta;
      }
    }
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

function metres([lat1, lng1]: LatLng, [lat2, lng2]: LatLng): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 6_371_000 * 2 * Math.asin(Math.sqrt(a));
}

/** Drops the first and last `trim` metres of the route. */
function trimEnds(points: LatLng[], trim: number): LatLng[] {
  const along = [0];
  for (let i = 1; i < points.length; i++) {
    along.push(along[i - 1] + metres(points[i - 1], points[i]));
  }
  const total = along[along.length - 1];
  return points.filter((_, i) => along[i] >= trim && along[i] <= total - trim);
}

/**
 * Shape of the route as [x, y] points in a 0–1 box, north up and centred,
 * or null when there is no usable route (treadmill, very short run).
 */
export function routeShape(
  polyline: string | null | undefined
): [number, number][] | null {
  if (!polyline) {
    return null;
  }
  const points = trimEnds(decodePolyline(polyline), TRIM_M);
  if (points.length < 2) {
    return null;
  }

  // Flat projection, fine at the scale of one run: a degree of longitude is
  // cos(latitude) as long as a degree of latitude.
  const meanLat = points.reduce((sum, [lat]) => sum + lat, 0) / points.length;
  const xScale = Math.cos((meanLat * Math.PI) / 180);
  const xs = points.map(([, lng]) => lng * xScale);
  const ys = points.map(([lat]) => -lat);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const width = Math.max(...xs) - minX;
  const height = Math.max(...ys) - minY;
  const size = Math.max(width, height) || 1;
  const offsetX = (1 - width / size) / 2;
  const offsetY = (1 - height / size) / 2;

  const step = Math.max(1, Math.ceil(points.length / MAX_POINTS));
  const round = (value: number) => Math.round(value * 1000) / 1000;
  const shape: [number, number][] = [];
  for (let i = 0; i < points.length; i += step) {
    shape.push([
      round(offsetX + (xs[i] - minX) / size),
      round(offsetY + (ys[i] - minY) / size),
    ]);
  }
  return shape;
}
