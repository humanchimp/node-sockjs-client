'use strict';

var test = require('tape');

var helpers = require('./lib/helpers.js');
var config = require('./lib/config.js');

test('invalid url 404', function (t) {
  var r;
  t.plan(4);
  r = helpers.newSockJS('/invalid_url');
  t.ok(r);
  r.onopen = function(e) {
    t.ok(false);
  };
  r.onmessage = function(e) {
    t.ok(false);
  };
  r.onclose = function(e) {
    t.equal(e.code, 1002);
    t.equal(e.reason, 'Can\'t connect to server');
    t.equal(e.wasClean, false);
  };
});

test("invalid url port", function (t) {
  var host, r;
  t.plan(4);
  host = config.client_opts.url.split(':')[0];
  r = helpers.newSockJS(host + ':1079');
  t.ok(r);
  r.onopen = function(e) {
    t.ok(false);
  };
  r.onclose = function(e) {
    t.equal(e.code, 1002);
    t.equal(e.reason, 'Can\'t connect to server');
    t.equal(e.wasClean, false);
  };
});
