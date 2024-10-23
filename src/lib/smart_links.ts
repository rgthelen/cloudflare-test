import { WrappedError } from '../errors';
import { CreateSmartLinkOpts, SmartLink, TConfig } from '../types';
import { request } from './fetch';

export async function createSmartLink(
  { email, phone, redirect_url, data }: CreateSmartLinkOpts,
  config: TConfig
): Promise<SmartLink> {
  try {
    const resp = await request(`${config.api_url}/hub/auth/magic`, {
      method: 'POST',
      headers: {
        'x-rownd-app-key': config.app_key!,
        'x-rownd-app-secret': config.app_secret!,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        verification_mode: email ? 'email' : 'phone',
        redirect_url: redirect_url,
        data: {
          email,
          phone,
          ...data,
        },
      }),
    });

    return resp;
  } catch (err) {
    let wrappingError = new WrappedError(
      `Failed to generate the requested smart link. Reason: ${
        (err as Error).message
      }`
    );
    wrappingError.innerError = err as Error;
    wrappingError.statusCode = (err as any).statusCode || 500;
    throw wrappingError;
  }
}
