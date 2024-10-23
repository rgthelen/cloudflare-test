import { DEFAULT_API_USER_AGENT } from './constants';

export async function request(url: string, options: RequestInit = {}) {
  const modifiedOptions: RequestInit = {
    ...options,
    headers: {
      'user-agent': DEFAULT_API_USER_AGENT,
      ...(options.headers || {}),
    },
  };

  console.log('Request options:', modifiedOptions);

  try {
    const response = await fetch(url, modifiedOptions);

    const responseBody = await response.clone().json().catch(() => null);

    console.debug('response', {
      url: response.url,
      status: response.status,
      headers: response.headers,
      body: responseBody,
    });

    if (!response.ok) {
      const error = new Error(`Request failed with status ${response.status}`);
      (error as any).response = response;
      throw error;
    }

    return responseBody;
  } catch (error) {
    console.error('error', error);
    throw error;
  }
}
