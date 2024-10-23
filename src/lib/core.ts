import { request } from './fetch';
import { TApp } from '../types';

type WellKnownConfig = {
  issuer: string;
  token_endpoint: string;
  jwks_uri: string;
  userinfo_endpoint: string;
  response_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  grant_types_supported: string[];
  subject_types_supported: string[];
  scopes_supported: string[];
  token_endpoint_auth_methods_supported: string[];
  claims_supported: string[];
  code_challenge_methods_supported: string[];
  introspection_endpoint_auth_methods_supported: string[];
  request_parameter_supported: boolean;
  request_object_signing_alg_values_supported: string[];
};

export const CLAIM_USER_ID = 'https://auth.rownd.io/app_user_id';
export const CLAIM_IS_VERIFIED_USER = 'https://auth.rownd.io/is_verified_user';

type TAppResp = {
  app: TApp;
};

const cache: Record<string, any> = {};

export async function fetchRowndWellKnownConfig(
  apiUrl: string
): Promise<WellKnownConfig> {
  if (cache['oauth-config']) {
    return cache['oauth-config'];
  }

  const resp = await request(`${apiUrl}/hub/auth/.well-known/oauth-authorization-server`);
  cache['oauth-config'] = resp;

  return resp;
}

export async function fetchAppConfig(
  apiUrl: string,
  appKey: string
): Promise<TApp> {
  console.log('Fetching app config with appKey:', appKey);

  const resp: TAppResp = await request(`${apiUrl}/hub/app-config`, {
    headers: {
      'x-rownd-app-key': appKey,
    },
  });

  return resp.app;
}
