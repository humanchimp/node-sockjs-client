var test = require('tape');

var helpers = require('./lib/helpers.js');

['websocket'].forEach(function (protocol) {
    test('batch: large', large_batch_factory(protocol));
    test('batch: large, amplified', large_amplified_batch_factory(protocol))
});

function large_batch_factory(protocol) {
    var messages;
    messages = [
        new Array(Math.pow(2, 1)).join('x'),
        new Array(Math.pow(2, 2)).join('x'),
        new Array(Math.pow(2, 4)).join('x'),
        new Array(Math.pow(2, 8)).join('x'),
        new Array(Math.pow(2, 13)).join('x'),
        new Array(Math.pow(2, 13)).join('x')
    ];
    return batch_factory_factory(protocol, messages);
}

function large_amplified_batch_factory(protocol) {
    var messages;
    messages = [1, 2, 4, 8, 13, 15, 15];
    return batch_factory_factory_amp(protocol, messages);
}

function batch_factory_factory(protocol, messages) {
    return function (t) {
        var counter, r;
        t.plan(3 + messages.length);
        r = helpers.newSockJS('/echo', protocol);
        t.ok(r);
        counter = 0;
        r.onopen = function(e) {
            var msg, _i, _len;
            t.ok(true);
            for (_i = 0, _len = messages.length; _i < _len; _i++) {
                msg = messages[_i];
                r.send(msg);
            }
        };
        r.onmessage = function(e) {
            t.equal(e.data, messages[counter]);
            counter += 1;
            if (counter === messages.length) r.close();
        };
        r.onclose = function(e) {
            if (counter !== messages.length) {
                t.ok(false, "Transport closed prematurely. " + e);
            } else {
                t.ok(true);
            }
        };
    };
}

function batch_factory_factory_amp(protocol, messages) {
    return function (t) {
        var counter, r;
        t.plan(3 + messages.length);
        r = helpers.newSockJS('/amplify', protocol);
        t.ok(r);
        counter = 0;
        r.onopen = function(e) {
            var msg, _i, _len;
            t.ok(true);
            for (_i = 0, _len = messages.length; _i < _len; _i++) {
                msg = messages[_i];
                r.send('' + msg);
            }
        };
        r.onmessage = function(e) {
            t.equal(e.data.length, Math.pow(2, messages[counter]), e.data);
            counter += 1;
            if (counter === messages.length) r.close();
        };
        r.onclose = function(e) {
            if (counter !== messages.length) {
                t.ok(false, "Transport closed prematurely. " + e);
            } else {
                t.ok(true);
            }
        };
    };
}
