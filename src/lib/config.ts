import { TConfig } from '../types';

/* Assuming you have environment variables bound as global variables */
declare const ROWND_APP_KEY: string | undefined;
declare const ROWND_APP_SECRET: string | undefined;
declare const ROWND_TIMEOUT: string | undefined;

const defaultConfig: TConfig = {
  api_url: 'https://api.rownd.io',
  app_key: typeof ROWND_APP_KEY !== 'undefined' ? ROWND_APP_KEY : undefined,
  app_secret: typeof ROWND_APP_SECRET !== 'undefined' ? ROWND_APP_SECRET : undefined,
  timeout: typeof ROWND_TIMEOUT !== 'undefined' ? parseInt(ROWND_TIMEOUT, 10) : 10000,
};

export function createConfig(opts: Partial<TConfig> = {}): TConfig {
  return {
    ...defaultConfig,
    ...opts,
  };
}
