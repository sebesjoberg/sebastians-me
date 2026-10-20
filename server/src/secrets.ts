import { readFile } from 'node:fs/promises';
import type { OpenBaoConfig } from './config.ts';
import { log } from './log.ts';

export interface StravaSecrets {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  /** Shared with Strava when subscribing to webhooks. */
  webhookVerifyToken: string;
}

// Where the Strava credentials live. Strava may hand out a new refresh
// token on any refresh and the old one then stops working, so the store
// has to be writable, not just readable.
export interface SecretStore {
  load(): Promise<StravaSecrets>;
  saveRefreshToken(token: string): Promise<void>;
}

/** Field names in the KV secret. */
interface KvData {
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
  webhook_verify_token?: string;
}

// OpenBao KV v2, logged in with the pod's service account through the
// Kubernetes auth method. The policy needs read and update on the secret.
export function openBaoStore(config: OpenBaoConfig): SecretStore {
  const dataUrl = `${config.addr}/v1/${config.kvMount}/data/${config.secretPath}`;
  let session: { token: string; expiresAt: number } | null = null;

  async function bao(
    url: string,
    { token, body }: { token?: string; body?: object } = {}
  ): Promise<unknown> {
    const method = body ? 'POST' : 'GET';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['X-Vault-Token'] = token;
    }
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      throw new Error(`OpenBao ${method} ${url}: ${res.status}`);
    }
    return res.json();
  }

  async function token(): Promise<string> {
    if (session && session.expiresAt > Date.now()) {
      return session.token;
    }
    // Read every time: the kubelet rotates the projected token.
    const jwt = (await readFile(config.jwtPath, 'utf8')).trim();
    const body = (await bao(
      `${config.addr}/v1/auth/${config.authMount}/login`,
      { body: { role: config.role, jwt } }
    )) as { auth: { client_token: string; lease_duration: number } };
    session = {
      token: body.auth.client_token,
      // a minute of margin so a request never goes out with a dying token
      expiresAt: Date.now() + (body.auth.lease_duration - 60) * 1000,
    };
    return session.token;
  }

  async function read(): Promise<KvData> {
    const body = (await bao(dataUrl, { token: await token() })) as {
      data: { data: KvData };
    };
    return body.data.data;
  }

  return {
    async load() {
      const data = await read();
      const { client_id, client_secret, refresh_token, webhook_verify_token } =
        data;
      if (!client_id || !client_secret || !refresh_token) {
        throw new Error(
          `${config.kvMount}/${config.secretPath} needs client_id, client_secret and refresh_token`
        );
      }
      return {
        clientId: client_id,
        clientSecret: client_secret,
        refreshToken: refresh_token,
        webhookVerifyToken: webhook_verify_token ?? '',
      };
    },
    async saveRefreshToken(refreshToken) {
      // Write the whole secret back so the other fields survive; KV v2
      // keeps the previous version if this ever goes wrong.
      const data = await read();
      await bao(dataUrl, {
        token: await token(),
        body: { data: { ...data, refresh_token: refreshToken } },
      });
      log.info('Saved new Strava refresh token to OpenBao');
    },
  };
}

// Local development: STRAVA_* env vars, with a new refresh token kept in
// memory only. Restarting after a rotation means updating .env.
export function envStore(): SecretStore {
  let refreshToken = process.env.STRAVA_REFRESH_TOKEN ?? '';

  return {
    async load() {
      const clientId = process.env.STRAVA_CLIENT_ID;
      const clientSecret = process.env.STRAVA_CLIENT_SECRET;
      if (!clientId || !clientSecret || !refreshToken) {
        throw new Error(
          'Set STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET and STRAVA_REFRESH_TOKEN, or BAO_ADDR to use OpenBao'
        );
      }
      return {
        clientId,
        clientSecret,
        refreshToken,
        webhookVerifyToken: process.env.STRAVA_WEBHOOK_VERIFY_TOKEN ?? '',
      };
    },
    async saveRefreshToken(token) {
      refreshToken = token;
      log.warn(
        'Strava issued a new refresh token; it is only kept in memory, update STRAVA_REFRESH_TOKEN'
      );
    },
  };
}
