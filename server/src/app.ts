import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { errorMessage, log } from './log.ts';
import type { RunningCache } from './running.ts';
import type { SecretStore } from './secrets.ts';

interface StravaEvent {
  object_type: 'activity' | 'athlete';
  aspect_type: 'create' | 'update' | 'delete';
  owner_id: number;
  /** The activity's id, or the athlete's for athlete events. */
  object_id: number;
  updates?: Record<string, string>;
}

function createApi(
  running: RunningCache,
  secrets: SecretStore,
  version: string
) {
  const api = new Hono();

  // Probes. Up means the process serves; Strava being down is not a reason
  // to restart it.
  api.get('/health', (c) =>
    c.json({ ok: true, version, strava: running.current() !== null })
  );

  api.get('/running', (c) => {
    const summary = running.current();
    if (!summary) {
      return c.json({ error: 'Not fetched from Strava yet' }, 503);
    }
    c.header('Cache-Control', 'public, max-age=300');
    return c.json(summary);
  });

  // Strava checks the subscription once by asking us to echo a challenge.
  api.get('/strava/webhook', async (c) => {
    const webhookVerifyToken = await secrets
      .load()
      .then((loaded) => loaded.webhookVerifyToken)
      .catch((error: unknown) => {
        log.error('Could not load secrets for webhook check', {
          error: errorMessage(error),
        });
        return null;
      });
    if (webhookVerifyToken === null) {
      return c.json({ error: 'Unavailable' }, 503);
    }
    const mode = c.req.query('hub.mode');
    const verifyToken = c.req.query('hub.verify_token');
    const challenge = c.req.query('hub.challenge');
    if (
      mode !== 'subscribe' ||
      !webhookVerifyToken ||
      verifyToken !== webhookVerifyToken ||
      !challenge
    ) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    return c.json({ 'hub.challenge': challenge });
  });

  // Strava wants a 200 within two seconds, so just note it and refresh
  // in the background.
  api.post('/strava/webhook', async (c) => {
    const event = await c.req.json<StravaEvent>().catch(() => null);
    const me = running.athleteId();
    if (event && (me === null || event.owner_id === me)) {
      if (event.object_type === 'activity') {
        running.refreshSoon(event.object_id);
      } else if (event.updates?.authorized === 'false') {
        log.warn('Strava access was revoked; re-authorize the app');
      }
    }
    return c.body(null, 200);
  });

  // Unknown API paths are API errors, not the site's index.html.
  api.all('*', (c) => c.json({ error: 'Not found' }, 404));

  return api;
}

// One server for the whole site: /api is the API, every other path is the
// built site from staticDir. In dev staticDir is null and Vite serves the
// site, proxying /api here.
export function createApp(
  running: RunningCache,
  secrets: SecretStore,
  { staticDir, version }: { staticDir: string | null; version: string }
) {
  const app = new Hono();
  app.route('/api', createApi(running, secrets, version));

  if (staticDir) {
    // hashed file names, so they can be cached forever
    app.use(
      '/assets/*',
      serveStatic({
        root: staticDir,
        onFound: (_path, c) => {
          c.header('Cache-Control', 'public, max-age=31536000, immutable');
        },
      })
    );
    // robots.txt, favicon and the like, plus index.html for "/"
    app.use(
      '*',
      serveStatic({
        root: staticDir,
        onFound: (path, c) => {
          if (path.endsWith('.html')) {
            c.header('Cache-Control', 'no-cache');
          }
        },
      })
    );
    // Client-side routes (/, /en, ...) all get the app shell. It is always
    // revalidated so a deploy shows up right away.
    app.get(
      '*',
      serveStatic({
        root: staticDir,
        path: 'index.html',
        onFound: (_path, c) => {
          c.header('Cache-Control', 'no-cache');
        },
      })
    );
  }

  return app;
}
