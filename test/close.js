var test = require('tape');

var helpers = require('./lib/helpers.js');

['websocket'].forEach(function (protocol) {
    test('close: user initiated', user_close_factory(protocol));
    test('close: server initiated', server_close_factory(protocol));
});

function user_close_factory(protocol) {
    return function (t) {
        var counter, r;
        t.plan(5);
        r = helpers.newSockJS('/echo', protocol);
        t.ok(r);
        counter = 0;
        r.onopen = function (e) {
            counter += 1;
            t.ok(counter === 1);
            r.close(3000, "User message");
            t.ok(counter === 1);
        };
        r.onmessage = function () {
            t.ok(false);
            counter += 1;
        };
        r.onclose = function (e) {
            counter += 1;
            console.log('user_close ' + e.code + ' ' + e.reason);
            t.equal(e.wasClean, true);
            t.ok(counter === 2);
        };
    };
}

function server_close_factory(protocol) {
    return function (t) {
        var r;
        t.plan(5);
        r = helpers.newSockJS('/close', protocol);
        t.ok(r);
        r.onopen = function (e) {
            t.ok(true);
        };
        r.onmessage = function (e) {
            t.ok(false);
        };
        r.onclose = function (e) {
            t.equal(e.code, 3000);
            t.equal(e.reason, "Go away!");
            t.equal(e.wasClean, true);
        };
    };
}
