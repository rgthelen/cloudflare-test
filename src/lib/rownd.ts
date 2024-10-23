import { request } from './fetch';
import { createConfig } from './config';
import {
  CLAIM_USER_ID,
  fetchAppConfig,
  fetchRowndWellKnownConfig,
} from './core';
import { createSmartLink } from './smart_links';
import {
  CreateSmartLinkOpts,
  FetchUserInfoOpts,
  IRowndClient,
  RowndToken,
  RowndUser,
  TApp,
  TConfig,
} from '../types';
import * as jose from 'jose';

export class RowndInstance implements IRowndClient {
  private cache: Record<string, any> = {};
  private config: TConfig;
  private initPromise?: Promise<TApp>;
  public appConfig: Promise<TApp> | undefined;

  constructor(pConfig?: Partial<TConfig>) {
    this.config = createConfig(pConfig);

    this.initPromise = fetchAppConfig(this.config.api_url, this.config.app_key!)
      .then((app) => (this.config._app = app))
      .catch((err) => {
        throw new Error(`Failed to fetch app config: ${err.message}`);
      });
  }

  async validateToken(token: string) {
    const authConfig = await fetchRowndWellKnownConfig(this.config.api_url);

    const JWKS = jose.createRemoteJWKSet(new URL(authConfig.jwks_uri));

    const { payload } = await jose.jwtVerify(token, JWKS);
    const rowndToken = payload as RowndToken;

    return {
      decoded_token: rowndToken,
      user_id: rowndToken[CLAIM_USER_ID],
      access_token: token,
    };
  }

  async fetchUserInfo(opts: FetchUserInfoOpts) {
    await Promise.race([
      this.initPromise!,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), this.config.timeout)
      ),
    ]);

    const appId = opts?.app_id || this.config._app?.id;

    if (!appId) {
      throw new Error('An app_id must be provided');
    }

    const { user_id: userId } = opts;

    if (this.cache[`user:${userId}`]) {
      return this.cache[`user:${userId}`];
    }

    const headers: Record<string, string> = {
      'x-rownd-app-key': this.config.app_key!,
      'x-rownd-app-secret': this.config.app_secret!,
    };

    const resp = await request(
      `${this.config.api_url}/applications/${appId}/users/${userId}/data`,
      {
        headers,
      }
    );

    this.cache[`user:${userId}`] = resp;
    return resp;
  }

  async createOrUpdateUser(user: RowndUser) {
    await Promise.race([
      this.initPromise!,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), this.config.timeout)
      ),
    ]);

    const appId = this.config._app!.id;
    const userId = user.id;

    const resp = await request(
      `${this.config.api_url}/applications/${appId}/users/${userId}/data`,
      {
        method: 'PUT',
        headers: {
          'x-rownd-app-key': this.config.app_key!,
          'x-rownd-app-secret': this.config.app_secret!,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          data: user.data,
        }),
      }
    );

    return resp;
  }

  async deleteUser(userId: string) {
    const appId = this.config._app!.id;

    await request(
      `${this.config.api_url}/applications/${appId}/users/${userId}/data`,
      {
        method: 'DELETE',
        headers: {
          'x-rownd-app-key': this.config.app_key!,
          'x-rownd-app-secret': this.config.app_secret!,
          'content-type': 'application/json',
        },
      }
    );
  }

  async createSmartLink(opts: CreateSmartLinkOpts) {
    return createSmartLink(opts, this.config);
  }
}
