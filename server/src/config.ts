// Everything the service reads from its environment, in one place.

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export interface OpenBaoConfig {
  addr: string;
  /** Kubernetes auth role bound to this pod's service account. */
  role: string;
  authMount: string;
  /** KV v2 mount and the path of the secret inside it. */
  kvMount: string;
  secretPath: string;
  /** Projected service account token used to log in. */
  jwtPath: string;
}

export interface Config {
  port: number;
  /** Built site to serve next to /api. null in dev, where Vite serves it. */
  staticDir: string | null;
  /** Re-fetch from Strava this often even without webhooks. */
  refreshIntervalMs: number;
  /** null: read the Strava secrets from STRAVA_* env vars (local dev). */
  openBao: OpenBaoConfig | null;
}

export function loadConfig(): Config {
  const addr = process.env.BAO_ADDR;
  return {
    port: Number(optional('PORT', '8080')),
    staticDir: process.env.STATIC_DIR || null,
    refreshIntervalMs: Number(optional('REFRESH_INTERVAL_MIN', '360')) * 60_000,
    openBao: addr
      ? {
          addr: addr.replace(/\/$/, ''),
          role: required('BAO_ROLE'),
          authMount: optional('BAO_AUTH_MOUNT', 'kubernetes'),
          kvMount: optional('BAO_KV_MOUNT', 'secret'),
          secretPath: optional('BAO_SECRET_PATH', 'sebastians-me/strava'),
          jwtPath: optional(
            'BAO_JWT_PATH',
            '/var/run/secrets/kubernetes.io/serviceaccount/token'
          ),
        }
      : null,
  };
}
