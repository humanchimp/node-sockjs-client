'use strict';

var test = require('tape');
var helpers = require('./lib/helpers.js');

test('invalid url 404', function (t) {
  var r;
  t.plan(4);
  r = helpers.newSockJS('/invalid_url', 'jsonp-polling');
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
