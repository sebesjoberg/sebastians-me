// The API's response shapes. Pure types with no imports, so the site can
// import them too and both sides agree on the contract.

export interface RunTotals {
  runs: number;
  distanceKm: number;
  movingTimeSec: number;
  elevationGainM: number;
}

export interface RecentRun {
  /** Strava activity id, for linking to it. */
  id: number;
  name: string;
  /** Strava sport type: Run, TrailRun or VirtualRun. */
  sportType: string;
  /** Local date of the start, YYYY-MM-DD. No time or place on purpose. */
  date: string;
  distanceKm: number;
  movingTimeSec: number;
  paceSecPerKm: number;
  elevationGainM: number;
  /**
   * Shape of the route as [x, y] points in a 0–1 box, north up, with the
   * ends trimmed and no coordinates. null for treadmill runs.
   */
  route: [number, number][] | null;
  /** What I wrote on the activity in Strava, if anything. */
  description: string | null;
}

/** GET /api/running */
export interface RunningSummary {
  /** ISO timestamp of the last successful fetch from Strava. */
  updatedAt: string;
  thisYear: RunTotals;
  last4Weeks: RunTotals;
  allTime: RunTotals;
  /** Newest first, public activities only. */
  recentRuns: RecentRun[];
}
