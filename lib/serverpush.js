'use strict';

const path = require('path');
const url = require('url');
const fs = require('mz/fs');
const chalk = require('chalk');
const debug = require('debug')('koa-server-push');

function serverpush(opts) {

  opts = opts ? opts : {};

  debug(`starting server push middleware`);
  debug(opts);

  opts.manifestName = opts.manifestName ? opts.manifestName : 'push_manifest.json';
  opts.gaeproxy = opts.gaeproxy ? true : false;
  opts.singleheader = opts.singleheader ? true : false;

  return function serverpush(ctx, next) {

    try {
      ctx.assert(ctx.status !== 200);
      ctx.assert(!ctx.body);
    } catch(err) {
      chalk.red(`This middleware needs to be called before the static file middleware.`);
      chalk.yellow(err);
      return;
    }

    return next().then(function() {

      debug(`Manifest name is ${opts.manifestName}`)
      debug(`Google App Engine setting is ${opts.gaeproxy}`)
      debug(`Single Header setting is ${opts.singleheader}`)

      try {
        ctx.assert(ctx.status === 200);
        ctx.assert(ctx.body);
      } catch(err) {
        chalk.red(`Status and body are not 200 and defined.`);
        chalk.yellow(err);
        return;
      }

      let ext = path.extname(ctx.body.path);
      try {
        ctx.assert(ext === '.html');
      } catch(err) {
        debug(`${ext} is not an html file, moving on.`);
        return;
      }

      try {
        ctx.assert(!('nopush' in ctx.query));
      } catch(err) {
        debug(`\'nopush\' query parameter found, moving on.`)
        return;
      }

      const manifestfile = path.resolve( path.dirname(ctx.body.path), opts.manifestName );

      debug(`protocol is ${ctx.protocol}`)
      debug(`hostname is ${ctx.host}`);
      debug(`path is ${ctx.path}`);
      debug(`manifest file is ${manifestfile}`);

      return fs.stat(manifestfile)
      .then(stat => {
        try {
          ctx.assert(stat.isFile())
        } catch(err) {
          debug(`Manifest file not found`)
          throw new Error(err);
        }
      })
      .then(() => {
        return fs.readFile(manifestfile)
      })
      .then(file => {
        let links = [];
        let contents = [];
        let data = JSON.parse(file.toString());

        for (let key in data) {
          let u = url.resolve(`${ctx.protocol}://${ctx.host}`, key);
          contents.push(u);
          links.push(`<${u}>; rel=preload; as=${data[key].type}`);
        }

        try {
          ctx.assert(contents.length <= 10 && opts.gaeproxy);
        } catch(err) {
          chalk.yellow('More than 10 resources in push manifest, GAE only supports a maximum of 10 resources to push. Continuing...');
        }

        if( links.length > 0 && opts.gaeproxy ) {
          ctx.set('X-Associated-Content', contents.join(', '));
        }

        if( contents.length > 0 ) {
          if( opts.singleheader ) {
            ctx.set('Link', links.join(', '));
          } else {
            ctx.set('Link', links);
          }
        }
      })
      .catch(err => {
        debug(err)
        return;
      });

    });

  }
}

module.exports = serverpush;
