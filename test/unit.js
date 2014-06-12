var test = require('tape');

var u = require('../lib/helpers.js');

test('random_string', function (t) {
  t.plan(5);

  t.notEqual(
    u.random_string(8),
    u.random_string(8)
  );

  [1, 2, 3, 128].forEach(function (i) {
    t.equal(u.random_string(i).length, i);
  });
});

test('random_number_string', function (t) {
  t.plan(55);

  for (var i = 0; i <= 10; i++) {
    t.equal(u.random_number_string(10).length, 1);
    t.equal(u.random_number_string(100).length, 2);
    t.equal(u.random_number_string(1000).length, 3);
    t.equal(u.random_number_string(10000).length, 4);
    t.equal(u.random_number_string(100000).length, 5);
  }
});

test('amendUrl', function (t) {
  // NOTE: i stripped out tests that were depending on the DOM:
  t.plan(6);

  t.throws(function() {
    u.amendUrl('');
  }, 'Wrong url');

  t.throws(function() {
    u.amendUrl(false);
  },'Wrong url');

  t.throws(function() {
    u.amendUrl('http://abc?a=a');
  }, 'Only basic urls are supported');

  t.throws(function() {
    u.amendUrl('http://abc#a');
  }, 'Only basic urls are supported');

  t.equal(u.amendUrl('https://a:80/abc'), 'https://a:80/abc');

  t.equal(u.amendUrl('http://a:443/abc'), 'http://a:443/abc');

});

test('quote', function (t) {
  var all_chars = Array(65535).map(function (_, i) {
    return String.fromCharCode(i);
  }).join('');

  t.plan(8);

  t.equal(u.quote(''), '""');

  t.equal(u.quote('a'), '"a"');

  t.ok(['"\\t"', '"\\u0009"'].indexOf(u.quote('\t')) !== -1);

  t.ok(['"\\n"', '"\\u000a"'].indexOf(u.quote('\n')) !== -1);

  t.equal(u.quote('\x00\udfff\ufffe\uffff'), '"\\u0000\\udfff\\ufffe\\uffff"');

  t.equal(u.quote('\ud85c\udff7\ud800\ud8ff'), '"\\ud85c\\udff7\\ud800\\ud8ff"');

  t.equal(u.quote('\u2000\u2001\u0300\u0301'), '"\\u2000\\u2001\\u0300\\u0301"');

  t.ok(JSON.parse(u.quote(all_chars)) === all_chars, "Quote/unquote all 64K chars.");
});

test('detectProtocols', function (t) {
  var node_probed = {
    'websocket': true
  };
  t.plan(1);
  t.deepEqual(u.detectProtocols(node_probed, null, {}), ['websocket']);
 });

test("REventTarget", function (t) {
  var REventTarget = require('../lib/reventtarget.js');
  var bluff, handler0, handler1, handler2, handler3, handler4, log, r, single;
  t.plan(7);
  r = new REventTarget;
  r.addEventListener('message', function() {
    t.ok(true);
  });
  r.onmessage = function() {
    t.ok(false);
  };
  bluff = function() {
    t.ok(false);
  };
  r.addEventListener('message', bluff);
  r.removeEventListener('message', bluff);
  r.addEventListener('message', bluff);
  r.addEventListener('message', function() {
    t.ok(true);
  });
  r.onmessage = function() {
    t.ok(true);
  };
  r.removeEventListener('message', bluff);
  r.dispatchEvent({
    type: 'message'
  });
  handler0 = function() {
    log.push(0);
  };
  handler1 = function() {
    log.push(1);
    r.removeEventListener('test', handler0);
    r.removeEventListener('test', handler2);
    r.addEventListener('test', handler3);
    r.addEventListener('test', handler4);
  };
  handler2 = function() {
    log.push(2);
  };
  handler3 = function() {
    log.push(3);
    r.removeEventListener('test', handler1);
    r.removeEventListener('test', handler3);
    r.removeEventListener('test', handler4);
  };
  handler4 = function() {
    log.push(4);
  };
  r.addEventListener('test', handler0);
  r.addEventListener('test', handler1);
  r.addEventListener('test', handler2);
  log = [];
  r.dispatchEvent({
    type: 'test'
  });
  t.deepEqual(log, [0, 1, 2]);
  log = [];
  r.dispatchEvent({
    type: 'test'
  });
  t.deepEqual(log, [1, 3, 4]);
  log = [];
  r.dispatchEvent({
    type: 'test'
  });
  t.deepEqual(log, []);
  single = function() {
    t.ok(true);
  };
  r.addEventListener('close', single);
  r.addEventListener('close', single);
  r.dispatchEvent({
    type: 'close'
  });
  r.removeEventListener('close', single);
  r.dispatchEvent({
    type: 'close'
  });
});
