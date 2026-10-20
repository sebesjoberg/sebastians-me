/* oxlint-disable no-console -- CLI script, the console is its output */

// One-time Strava authorization for local dev: prints the approval link,
// catches Strava's redirect on localhost, trades the code for a refresh
// token and writes it into server/.env. Strava always allows localhost as a
// redirect, whatever callback domain the app has.
//
// Run with: npm run strava:auth (in server/)
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';

const PORT = 8787;
const SCOPE = 'read,activity:read';
const ENV_FILE = new URL('../.env', import.meta.url);

const clientId = process.env.STRAVA_CLIENT_ID;
const clientSecret = process.env.STRAVA_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error('Put STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET in server/.env');
  process.exit(1);
}

const redirectUri = `http://localhost:${PORT}/callback`;
const params = new URLSearchParams({
  client_id: clientId,
  response_type: 'code',
  redirect_uri: redirectUri,
  approval_prompt: 'force',
  scope: SCOPE,
});
const authorizeUrl = `https://www.strava.com/oauth/authorize?${params.toString()}`;

async function saveRefreshToken(token: string) {
  const env = await readFile(ENV_FILE, 'utf8').catch(() => '');
  const line = `STRAVA_REFRESH_TOKEN=${token}`;
  const next = /^STRAVA_REFRESH_TOKEN=.*$/m.test(env)
    ? env.replace(/^STRAVA_REFRESH_TOKEN=.*$/m, line)
    : `${env.trimEnd()}\n${line}\n`;
  await writeFile(ENV_FILE, next);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', redirectUri);
  if (url.pathname !== '/callback') {
    res.writeHead(404).end();
    return;
  }

  const code = url.searchParams.get('code');
  const granted = url.searchParams.get('scope') ?? '';
  if (!code) {
    res.writeHead(400).end('Strava sent no code. Did you cancel?');
    console.error('No code in the redirect:', url.searchParams.get('error'));
    server.close();
    return;
  }

  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) {
    res.writeHead(500).end('Token exchange failed, see the terminal.');
    console.error('Token exchange failed:', tokenRes.status);
    server.close();
    return;
  }

  const body = (await tokenRes.json()) as { refresh_token: string };
  await saveRefreshToken(body.refresh_token);

  const missing = SCOPE.split(',').filter((s) => !granted.includes(s));
  const note = missing.length
    ? `Saved, but without ${missing.join(', ')}: tick every box on the approval page next time.`
    : 'Saved. You can close this tab.';
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }).end(note);
  // never print the token itself
  console.log(`New refresh token written to server/.env (scope: ${granted})`);
  if (missing.length) {
    console.warn(`Missing scope: ${missing.join(', ')}`);
  }
  server.close();
});

server.listen(PORT, () => {
  console.log('Open this link and approve:\n');
  console.log(authorizeUrl);
  console.log(`\nWaiting for Strava on ${redirectUri} ...`);
});
