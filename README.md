# Round Cloudflare SDK

Use this library to integrate Rownd into your Cloudflare Workers application. This SDK provides methods to validate Rownd JWT tokens, fetch and manipulate user data, and generate sign-in links, all within a Cloudflare Worker environment.

## Installation

```bash
npm install @roundrobtest/rownd-cloudflare
```

## Configuration

The SDK can be configured using environment variables or directly through the `createInstance` function:


- **Environment Variables:**
  - `ROWND_APP_KEY`: Your Rownd application key.
  - `ROWND_APP_SECRET`: Your Rownd application secret.
  - `ROWND_TIMEOUT`: Timeout for API requests in milliseconds (optional).
  - `ROWND_API_URL`: Custom API URL to use instead of the default `https://api.rownd.io` (optional).

Set these directly in your `wrangler.toml` file or through the Cloudflare dashboard.
In your `wrangler.toml` file, you can set these variables like this:

```
[vars]
ROWND_APP_KEY = "your-app-key"
ROWND_APP_SECRET = "your-app-secret"
ROWND_API_URL = "https://custom-api.rownd.io"
```
Get your Rownd app key and app secret from the [Rownd Dashboard](https://app.rownd.io).

## Usage

### Basic Example

```javascript
import { createInstance } from '@roundrobtest/round-cloudflare';

const rownd = createInstance({
  app_key: 'YOUR_ROWND_APP_KEY',
  app_secret: 'YOUR_ROWND_APP_SECRET',
});

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader) throw new Error('No authorization header');

    const token = authorizationHeader.replace(/^Bearer\s+/i, '');
    const tokenInfo = await rownd.validateToken(token);

    // Fetch user info
    const userInfo = await rownd.fetchUserInfo({ user_id: tokenInfo.user_id });

    return new Response(JSON.stringify(userInfo.data), { status: 200 });
  } catch (err) {
    return new Response(err.message, { status: 401 });
  }
}
```

### Custom API URL Example

```javascript
import { createInstance } from '@roundrobtest/round-cloudflare';

// Create with default API URL (https://api.rownd.io)
const rownd = createInstance({
  app_key: 'YOUR_ROWND_APP_KEY',
  app_secret: 'YOUR_ROWND_APP_SECRET',
});

// Later, if needed, switch to a different API URL
rownd.setApiUrl('https://staging-api.rownd.io');

// Now all API calls will use the new base URL
// Any cached data is cleared, and app configuration will be refetched
```

You can also specify a custom API URL at initialization:

```javascript
const rownd = createInstance({
  api_url: 'https://custom-api.rownd.io',
  app_key: 'YOUR_ROWND_APP_KEY',
  app_secret: 'YOUR_ROWND_APP_SECRET',
});
```

## API Reference

### `createInstance(config)`

Creates a new instance of the Rownd client.

- **Parameters:**
  - `config` (Object): Configuration object.
    - `app_key` (string): Your Rownd application key.
    - `app_secret` (string): Your Rownd application secret.
    - `timeout` (number, optional): Timeout for API requests in milliseconds.

### `rownd.validateToken(token)`

Validates a Rownd JWT token.

- **Parameters:**
  - `token` (string): The JWT token to validate.
- **Returns:**
  - A promise that resolves to an object containing the decoded token, user ID, and access token.

### `rownd.fetchUserInfo(opts)`

Fetches user information from Rownd.

- **Parameters:**
  - `opts` (Object):
    - `user_id` (string): The user's ID.
- **Returns:**
  - A promise that resolves to the user's data.

### `rownd.createOrUpdateUser(user)`

Creates or updates a user's data in Rownd.

- **Parameters:**
  - `user` (Object):
    - `id` (string): The user's ID.
    - `data` (Object): The user's data.
- **Returns:**
  - A promise that resolves when the operation is complete.

### `rownd.deleteUser(userId)`

Deletes a user from Rownd.

- **Parameters:**
  - `userId` (string): The user's ID.
- **Returns:**
  - A promise that resolves when the user is deleted.

### `rownd.createSmartLink(opts)`

Creates a magic sign-in link for a user.

- **Parameters:**
  - `opts` (Object):
    - `email` (string, optional): User's email.
    - `phone` (string, optional): User's phone number.
    - `redirect_url` (string): URL to redirect after sign-in.
    - `data` (Object, optional): Additional user data.
- **Returns:**
  - A promise that resolves to the smart link object.

### `rownd.setApiUrl(apiUrl)`

Changes the base API URL used by the Rownd client. This is useful for testing or using a different Rownd API environment.

- **Parameters:**
  - `apiUrl` (string): The new API URL to use.
- **Note:**
  - The default API URL is `https://api.rownd.io`.
  - Calling this method clears any cached data and forces a refetch of application configuration.

### `rownd.appConfig`

Provides access to the application configuration.

- **Returns:**
  - A promise that resolves to the application configuration object (`TApp`).

## Version

Current SDK version: `0.0.2`
