'use strict';

const request = require('supertest');
const serverpush = require('..');
const Koa = require('koa');
const serve = require('koa-static');
const convert = require('koa-convert');

// need a function to extract state from response, instead of file when
// querystring is set

function debugState(ctx, next) {
  return next().then(function() {
    if( 'statereturn' in ctx.query && ctx.query.statereturn.length > 0 ) {
      ctx.body = ctx.state[ctx.query.statereturn]
    }
  });
}

describe('serverpush test suite', function () {
  describe('check koa static', function () {
    it('should find package.json', function(done) {
      const app = new Koa();

      app.use(convert(serve('./test/fixtures')));

      request(app.listen())
      .get('/')
      .expect(200, done);
    });
  });

  describe('serverpush()', function() {
    describe('check defaults', function() {
      it('should not error with just defaults', function(done) {
        const app = new Koa();

        app.use(serverpush());
        app.use(convert(serve('./test/fixtures')));

        request(app.listen())
        .get('/')
        .expect(200)
        .end((err, res) => {
          if(err) { done(err) } else {
            if(res.headers.link.split(', ').length === 2) {
              done();
            } else {
              console.log(res.headers.link);
              done('Incorrect link header length.');
            }
          }
        });
      })
    });
    describe('check options', function() {
      it('should not error with single header set to true', function(done) {
        const app = new Koa();

        app.use(serverpush({
          singleheader: true
        }));
        app.use(convert(serve('./test/fixtures')));

        request(app.listen())
        .get('/')
        .expect(200)
        .end((err, res) => {
          if(err) { done(err) } else {
            if(res.headers.link.split(', ').length === 2) {
              done();
            } else {
              console.log(res.headers.link);
              done('Incorrect link header length.');
            }
          }
        });
      });

      it('should not error with manifest name set', function(done) {
        const app = new Koa();

        app.use(serverpush({
          manifestName: 'http_manifest.json'
        }));
        app.use(convert(serve('./test/fixtures')));

        request(app.listen())
        .get('/')
        .expect(200)
        .end((err, res) => {
          if(err) { done(err) } else {
            if(res.headers.link.split(', ').length === 2) {
              done();
            } else {
              console.log(res.headers.link);
              done('Incorrect link header length.');
            }
          }
        });
      });

      it('should not error with google app engine setting set', function(done) {
        const app = new Koa();

        app.use(serverpush({
          gaeproxy: true
        }));
        app.use(convert(serve('./test/fixtures')));

        request(app.listen())
        .get('/')
        .expect(200)
        .end((err, res) => {
          if(err) { done(err) } else {
            if(res.headers.link.split(', ').length === 2) {
              done();
            } else {
              console.log(res.headers.link);
              done('Incorrect link header length.');
            }
          }
        });
      });
    });

    describe('check data', function() {
      it('should have 2 links for headers with base fixture html file', function(done) {
        const app = new Koa();

        app.use(serverpush());
        app.use(convert(serve('./test/fixtures')));

        request(app.listen())
        .get('/')
        .expect(200)
        .end((err, res) => {
          if(err) { done(err) } else {
            if(res.headers.link.split(', ').length === 2) {
              done();
            } else {
              console.log(res.headers.link);
              done('Incorrect link header length.');
            }
          }
        });
      });

      it('should not have any link headers set for non-html file', function(done) {
        const app = new Koa();

        app.use(serverpush());
        app.use(convert(serve('./test/fixtures')));

        request(app.listen())
        .get('/js/testing.js')
        .expect(200)
        .end((err, res) => {
          if(err) { done(err) } else {
            if(res.headers.link) {
              done('Link header should not be set for non-html files.');
            } else {
              done();
            }
          }
        });
      });

      it('should not have any link headers for an html file with nopush query parameter set', function(done) {
        const app = new Koa();

        app.use(serverpush());
        app.use(convert(serve('./test/fixtures')));

        request(app.listen())
        .get('/?nopush')
        .expect(200)
        .end((err, res) => {
          if(err) { done(err) } else {
            if(res.headers.link) {
              done('Link header should not be set if nopush query parameter was set.');
            } else {
              done();
            }
          }
        });
      });

      it('should not error, but should warn, if GAE limit is reached', function(done) {
        const app = new Koa();

        app.use(serverpush({
          gaeproxy: true
        }));
        app.use(convert(serve('./test/fixtures')));

        request(app.listen())
        .get('/toomany/')
        .expect(200)
        .end((err, res) => {
          if(err) { done(err) } else {
            if(res.headers['x-associated-content'].split(', ').length === 11) {
              done();
            } else {
              console.log(res.headers['x-associated-content']);
              done('Incorrect link header length.');
            }
          }
        });
      });
    });

    describe('check errors', function() {
      it('should catch errors internally if fs errors', function(done) {
        const app = new Koa();

        app.use(serverpush());
        app.use(convert(serve('./test/fixtures')));

        request(app.listen())
        .get('/nomanifest/')
        .expect(200, done);
      });

      it('should handle an empty manifest without error', function(done) {
        const app = new Koa();

        app.use(serverpush());
        app.use(convert(serve('./test/fixtures')));

        request(app.listen())
        .get('/emptymanifest/')
        .expect(200, done);
      });
    });

  });
});
