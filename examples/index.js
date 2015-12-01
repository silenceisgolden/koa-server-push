'use strict';

const Koa = require('koa');
const serve = require('koa-static');
const convert = require('koa-convert');
const serverpush = require('..');

const app = new Koa();

app.use(serverpush());
app.use(convert(serve('test/fixtures')));

app.listen(3000);
