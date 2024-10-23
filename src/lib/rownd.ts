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
  private appConfigPromise?: Promise<TApp>;

  constructor(pConfig?: Partial<TConfig>) {
    this.config = createConfig(pConfig);
  }

  private async getAppConfig(): Promise<TApp> {
    if (!this.appConfigPromise) {
      console.log('App key before fetching app config:', this.config.app_key);

      this.appConfigPromise = fetchAppConfig(this.config.api_url, this.config.app_key!)
        .then((app) => {
          this.config._app = app;
          return app;
        })
        .catch((err) => {
          this.appConfigPromise = undefined; // Reset promise on failure
          throw new Error(`Failed to fetch app config: ${err.message}`);
        });
    }
    return this.appConfigPromise;
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
    const appConfig = await this.getAppConfig();
    const appId = appConfig.id;

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
    const appConfig = await this.getAppConfig();
    const appId = appConfig.id;
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
    const appConfig = await this.getAppConfig();
    const appId = appConfig.id;

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

  // Expose appConfig as a public getter
  public get appConfig(): Promise<TApp> | undefined {
    return this.appConfigPromise;
  }
}
