import classes from './Runs.module.css';

interface RouteShapeProps {
  /** [x, y] points in a 0–1 box, from the API. null: no route. */
  route: [number, number][] | null;
}

// A run's route as a bare line: no map under it, so it reads as the shape
// of the run rather than a place.
export function RouteShape({ route }: RouteShapeProps) {
  return (
    <svg className={classes.route} viewBox="-4 -4 108 108" aria-hidden>
      {route ? (
        <polyline
          points={route.map(([x, y]) => `${x * 100},${y * 100}`).join(' ')}
        />
      ) : (
        // treadmill and other runs without GPS: one straight stretch
        <line x1="20" y1="50" x2="80" y2="50" />
      )}
    </svg>
  );
}
