'use strict';

const request = require('supertest');
const serverpush = require('..');
const Koa = require('koa');
const serve = require('koa-static');
const convert = require('koa-convert');

describe('serverpush test suite', function () {
  describe('check koa static', function () {
    it('should find package.json', function(done) {
      const app = new Koa();

      app.use(convert(serve('.')));

      request(app.listen())
      .get('/package.json')
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
            // need error check here
            console.log(res.headers.link);
            done();
          }
        });
      })
    });
    describe('check options', function() {
      it('should not error with single header', function(done) {
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
            // need error check here
            console.log(res.headers.link);
            done();
          }
        });
      })
    });
  });
});
