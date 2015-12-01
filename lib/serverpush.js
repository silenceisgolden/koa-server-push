'use strict';

const path = require('path');
const url = require('url');
const fs = require('mz/fs');
const chalk = require('chalk');
const debug = require('debug')('koa-server-push');

function serverpushConstructor(opts) {

  opts = opts ? opts : {};
  opts.manifestName = opts.manifestName || 'push_manifest.json';
  opts.gaeproxy = opts.gaeproxy ? true : false;
  opts.singleheader = opts.singleheader ? true : false;

  return function serverpush(ctx, next) {

    return next().then(function() {

      if(!ctx.response.is('html')) return;

      if( 'nopush' in ctx.query ) return;

      return new Promise((res, rej) => {

        const manifestfile = path.resolve( path.dirname(ctx.body.path), opts.manifestName );

        fs.stat(manifestfile)
        .then(stat => {
          return stat.isFile();
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

          if(opts.gaeproxy && contents.length > 10) {
            chalk.yellow('Google App Engine only supports a maximum of 10 resources to be sent via server push at this time.');
          }

          if( contents.length > 0 ) {

            if( opts.gaeproxy ) {
              ctx.set('X-Associated-Content', contents.join(', '));
            }

            if( opts.singleheader ) {
              ctx.set('Link', links.join(', '));
            } else {
              ctx.set('Link', links);
            }

          } else {
            return;
          }

          ctx.state.h2push = {
            links: links,
            contents: contents,
            data: data
          }
        })
        .then(() => {
          res();
        })
        .catch(err => {
          debug(err)
          res();
        });
      });

    });

  }
}

module.exports = serverpushConstructor;
