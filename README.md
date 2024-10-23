# Rownd Cloudflare SDK

Use this library to integrate Rownd into your Cloudflare Workers application. This SDK provides methods to validate Rownd JWT tokens, fetch and manipulate user data, and generate sign-in links, all within a Cloudflare Worker environment.

## Installation

```bash
npm install @rownd/cloudflare
```

## Usage

### Basic Example

```javascript
import { createInstance } from '@rownd/cloudflare';

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
