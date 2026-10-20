import { serve } from '@hono/node-server';
import { createApp } from './app.ts';
import { loadConfig } from './config.ts';
import { log } from './log.ts';
import { runningCache } from './running.ts';
import { envStore, openBaoStore } from './secrets.ts';
import { stravaClient } from './strava.ts';

const config = loadConfig();
const secrets = config.openBao ? openBaoStore(config.openBao) : envStore();
const running = runningCache(stravaClient(secrets));
const app = createApp(running, secrets, config);

running.start(config.refreshIntervalMs);

const server = serve({ fetch: app.fetch, port: config.port }, (info) => {
  log.info('Listening', {
    port: info.port,
    version: config.version,
    secrets: config.openBao ? 'openbao' : 'env',
  });
});

// Kubernetes sends SIGTERM on rollout; finish open requests and go.
process.on('SIGTERM', () => {
  running.stop();
  server.close(() => process.exit(0));
});
