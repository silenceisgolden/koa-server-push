# koa-server-push

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

HTTP2 Server Push middleware for Koa

## Installation
```bash
$ npm install koa-server-push
```

## API
Usage for Koa 2.x (current version of node)
```js
const Koa = require('koa');
const serverpush = require('koa-server-push');
const app = new Koa();

app.use(serverpush());
// OR
// app.use(serverpush({
//   manifestName: 'anothername.json',
//   gaeproxy: true,
//   singleheader: true
// }));
```

## Options (optional)
- `manifestName` The name of the manifest files. Defaults to `'push_manifest.json'`.
- `gaeproxy` Set the `X-Associated-Content` header as well. Defaults to `false`.
- `singleheader` Set the `Link` header as a comma separated string instead of multiple `Link` headers. Defaults to `false`.

## Example
```js
'use strict';

const Koa = require('koa');
const serve = require('koa-static');
const convert = require('koa-convert');
const serverpush = require('koa-server-push');

const app = new Koa();

app.use(serverpush());
// OR
// app.use(serverpush({
//   manifestName: 'anothername.json',
//   gaeproxy: true,
//   singleheader: true
// }));
app.use(convert(serve('test/fixtures')));

/**
 * Note:
 * Please ensure that the server push middleware is not used after the
 * middleware that sets the response body and response type. This use case is
 * not supported at this time.
 */

app.listen(3000);
```

[npm-image]: https://img.shields.io/npm/v/koa-server-push.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-server-push
[github-tag]: http://img.shields.io/github/tag/silenceisgolden/koa-server-push.svg?style=flat-square
[github-url]: https://github.com/silenceisgolden/koa-server-push/tags
[travis-image]: https://img.shields.io/travis/silenceisgolden/koa-server-push.svg?style=flat-square
[travis-url]: https://travis-ci.org/silenceisgolden/koa-server-push
[license-image]: http://img.shields.io/npm/l/koa-server-push.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/koa-server-push.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/koa-server-push
