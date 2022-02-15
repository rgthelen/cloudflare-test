# Rownd bindings for Node.js

Use this library to integrate Rownd into your Node.js application. Convenience wrappers are provided
for common server implementations.

## Installation

```bash
npm i @rownd/node
```

## Supported frameworks

- [Express](#express)

Don't see your framework of choice? Open an issue and request it, or contribute it via pull request!

## Usage

### Express

An `authenticate` function is provided for use as Express middleware.
It takes the usual `req, res, next` arguments and will call `next()` if authentication
succeeds or `next(err)` if it fails.

Upon successful authentication, the request will be augmented with a `tokenObj` property containing
details about the authenticated token.

Each user's information is cached in memory for a short period of time to speed up subsequent requests.

See the [Express example](/examples/express/server.js) for a working implementation.

Here's an example protecting one route:
```js
const { rownd } = require('@rownd/node');
const { authenticate } = rownd.express;

app.get('/protected-route', authenticate(), (req, res) => {
    res.send({
        message: 'You are authenticated!',
        tokenObj: req.tokenObj,
    });
});
```

Here's an example protecting multiple routes on a certain path prefix:
```js
const { rownd } = require('@rownd/node');
const { authenticate } = rownd.express;

app.use('/protected-path', authenticate());
```

The `authenticate()` function accepts an optional `options` object containing the following properties:
- `fetchUserInfo: boolean (default: false)` - If `true`, the user's data will be fetched from the Rownd API and annotated on the request object as `req.user`. When present, it will contain a set of key/value pairs that match your application's schema. The user's data will be cached for a short period of time to speed up subsequent requests.