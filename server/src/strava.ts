import type { SecretStore } from './secrets.ts';

const BASE = 'https://www.strava.com';

/** The parts of Strava's ActivityTotal we use. */
export interface StravaTotal {
  count: number;
  distance: number;
  moving_time: number;
  elevation_gain: number;
}

export interface StravaStats {
  recent_run_totals: StravaTotal;
  ytd_run_totals: StravaTotal;
  all_run_totals: StravaTotal;
}

/** The parts of Strava's SummaryActivity we use. */
export interface StravaActivity {
  id: number;
  name: string;
  sport_type: string;
  start_date_local: string;
  distance: number;
  moving_time: number;
  total_elevation_gain: number;
  private: boolean;
  visibility?: 'everyone' | 'followers_only' | 'only_me';
  map?: { summary_polyline: string | null };
}

export interface StravaClient {
  athleteId(): Promise<number>;
  stats(athleteId: number): Promise<StravaStats>;
  /** Newest first. */
  activities(perPage: number): Promise<StravaActivity[]>;
  /** The written description, which only the full activity carries. */
  description(activityId: number): Promise<string | null>;
}

// Talks to Strava as me. Access tokens live six hours and are kept in
// memory; the refresh token comes from the store and goes back into it
// whenever Strava rotates it.
export function stravaClient(store: SecretStore): StravaClient {
  let access: { token: string; expiresAt: number } | null = null;
  let athleteId: number | null = null;

  async function accessToken(): Promise<string> {
    if (access && access.expiresAt > Date.now()) {
      return access.token;
    }
    const secrets = await store.load();
    const res = await fetch(`${BASE}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: secrets.clientId,
        client_secret: secrets.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: secrets.refreshToken,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      // the body can echo request details, so only the status goes out
      throw new Error(`Strava token refresh: ${res.status}`);
    }
    const body = (await res.json()) as {
      access_token: string;
      refresh_token: string;
      expires_at: number;
    };
    if (body.refresh_token !== secrets.refreshToken) {
      await store.saveRefreshToken(body.refresh_token);
    }
    access = {
      token: body.access_token,
      // five minutes of margin before Strava's own expiry
      expiresAt: body.expires_at * 1000 - 5 * 60_000,
    };
    return access.token;
  }

  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE}/api/v3${path}`, {
      headers: { Authorization: `Bearer ${await accessToken()}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      throw new Error(`Strava GET ${path}: ${res.status}`);
    }
    return (await res.json()) as T;
  }

  return {
    async athleteId() {
      athleteId ??= (await get<{ id: number }>('/athlete')).id;
      return athleteId;
    },
    stats: (id) => get(`/athletes/${id}/stats`),
    activities: (perPage) => get(`/athlete/activities?per_page=${perPage}`),
    async description(activityId) {
      const activity = await get<{ description: string | null }>(
        `/activities/${activityId}`
      );
      return activity.description?.trim() || null;
    },
  };
}
