import { errorMessage, log } from './log.ts';
import { routeShape } from './route.ts';
import type { StravaActivity, StravaClient, StravaTotal } from './strava.ts';
import type { RecentRun, RunTotals, RunningSummary } from './types.ts';

const RUN_TYPES = new Set(['Run', 'TrailRun', 'VirtualRun']);
const RECENT_RUNS = 5;

// Never hit Strava more often than this, whatever asks for it. Webhooks are
// not signed, so anyone could POST one; this keeps that harmless.
const MIN_REFRESH_GAP_MS = 60_000;

// Strava sends the webhook as soon as an upload starts, before its numbers
// are final, so wait a little before fetching.
const WEBHOOK_DELAY_MS = 20_000;

const km = (meters: number) => Math.round(meters / 100) / 10;

function totals(total: StravaTotal): RunTotals {
  return {
    runs: total.count,
    distanceKm: km(total.distance),
    movingTimeSec: total.moving_time,
    elevationGainM: Math.round(total.elevation_gain),
  };
}

function isPublicRun(activity: StravaActivity): boolean {
  return (
    RUN_TYPES.has(activity.sport_type) &&
    !activity.private &&
    (activity.visibility ?? 'everyone') === 'everyone'
  );
}

function recentRun(
  activity: StravaActivity,
  description: string | null
): RecentRun {
  return {
    id: activity.id,
    name: activity.name,
    sportType: activity.sport_type,
    date: activity.start_date_local.slice(0, 10),
    distanceKm: km(activity.distance),
    movingTimeSec: activity.moving_time,
    paceSecPerKm:
      activity.distance > 0
        ? Math.round(activity.moving_time / (activity.distance / 1000))
        : 0,
    elevationGainM: Math.round(activity.total_elevation_gain),
    route: routeShape(activity.map?.summary_polyline),
    description,
  };
}

export interface RunningCache {
  /** null until the first successful fetch. */
  current(): RunningSummary | null;
  athleteId(): number | null;
  /**
   * Fetch soon, e.g. after a webhook. Calls in the meantime are merged.
   * Pass the activity that changed so its description is fetched again.
   */
  refreshSoon(changedActivityId?: number): void;
  /** First fetch now, then one every intervalMs. */
  start(intervalMs: number): void;
  stop(): void;
}

// The summary lives in memory and is served from there; Strava is only
// asked on start, on a timer and after webhooks. A failed fetch keeps the
// previous summary.
export function runningCache(strava: StravaClient): RunningCache {
  let summary: RunningSummary | null = null;
  let athleteId: number | null = null;
  let lastAttempt = 0;
  let inFlight: Promise<void> | null = null;
  let soon: NodeJS.Timeout | null = null;
  let timer: NodeJS.Timeout | null = null;
  // Descriptions cost one request per activity, so each is fetched once
  // and kept until a webhook says that activity changed.
  const descriptions = new Map<number, string | null>();

  async function describe(activity: StravaActivity): Promise<string | null> {
    if (descriptions.has(activity.id)) {
      return descriptions.get(activity.id) ?? null;
    }
    try {
      const description = await strava.description(activity.id);
      descriptions.set(activity.id, description);
      return description;
    } catch (error) {
      // not cached, so the next refresh tries again
      log.warn('Could not fetch description', { error: errorMessage(error) });
      return null;
    }
  }

  async function fetchSummary() {
    athleteId = await strava.athleteId();
    const [stats, activities] = await Promise.all([
      strava.stats(athleteId),
      // Needs the activity:read scope. Without it the totals still work,
      // there are just no recent runs.
      strava.activities(30).catch((error: unknown) => {
        log.warn('Could not fetch activities', { error: errorMessage(error) });
        return [];
      }),
    ]);
    const runs = activities.filter(isPublicRun).slice(0, RECENT_RUNS);
    const recentRuns = await Promise.all(
      runs.map(async (run) => recentRun(run, await describe(run)))
    );
    summary = {
      updatedAt: new Date().toISOString(),
      thisYear: totals(stats.ytd_run_totals),
      last4Weeks: totals(stats.recent_run_totals),
      allTime: totals(stats.all_run_totals),
      recentRuns,
    };
    log.info('Refreshed running summary', {
      ytdKm: summary.thisYear.distanceKm,
    });
  }

  function refresh(): Promise<void> {
    if (inFlight) {
      return inFlight;
    }
    const wait = lastAttempt + MIN_REFRESH_GAP_MS - Date.now();
    if (wait > 0) {
      scheduleSoon(wait);
      return Promise.resolve();
    }
    lastAttempt = Date.now();
    inFlight = fetchSummary()
      .catch((error: unknown) => {
        log.error('Strava refresh failed', { error: errorMessage(error) });
      })
      .finally(() => {
        inFlight = null;
      });
    return inFlight;
  }

  function scheduleSoon(delayMs: number) {
    if (soon) {
      return;
    }
    soon = setTimeout(() => {
      soon = null;
      void refresh();
    }, delayMs);
  }

  return {
    current: () => summary,
    athleteId: () => athleteId,
    refreshSoon(changedActivityId) {
      if (changedActivityId !== undefined) {
        descriptions.delete(changedActivityId);
      }
      scheduleSoon(WEBHOOK_DELAY_MS);
    },
    start(intervalMs) {
      void refresh();
      timer = setInterval(() => void refresh(), intervalMs);
    },
    stop() {
      if (timer) {
        clearInterval(timer);
      }
      if (soon) {
        clearTimeout(soon);
      }
    },
  };
}
