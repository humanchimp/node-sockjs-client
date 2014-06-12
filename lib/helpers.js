'use strict';

var _all_protocols = ['websocket'];

var helpers = {

    quote: (function () {
        var extra_escapable = /[\x00-\x1f\ud800-\udfff\ufffe\uffff\u0300-\u0333\u033d-\u0346\u034a-\u034c\u0350-\u0352\u0357-\u0358\u035c-\u0362\u0374\u037e\u0387\u0591-\u05af\u05c4\u0610-\u0617\u0653-\u0654\u0657-\u065b\u065d-\u065e\u06df-\u06e2\u06eb-\u06ec\u0730\u0732-\u0733\u0735-\u0736\u073a\u073d\u073f-\u0741\u0743\u0745\u0747\u07eb-\u07f1\u0951\u0958-\u095f\u09dc-\u09dd\u09df\u0a33\u0a36\u0a59-\u0a5b\u0a5e\u0b5c-\u0b5d\u0e38-\u0e39\u0f43\u0f4d\u0f52\u0f57\u0f5c\u0f69\u0f72-\u0f76\u0f78\u0f80-\u0f83\u0f93\u0f9d\u0fa2\u0fa7\u0fac\u0fb9\u1939-\u193a\u1a17\u1b6b\u1cda-\u1cdb\u1dc0-\u1dcf\u1dfc\u1dfe\u1f71\u1f73\u1f75\u1f77\u1f79\u1f7b\u1f7d\u1fbb\u1fbe\u1fc9\u1fcb\u1fd3\u1fdb\u1fe3\u1feb\u1fee-\u1fef\u1ff9\u1ffb\u1ffd\u2000-\u2001\u20d0-\u20d1\u20d4-\u20d7\u20e7-\u20e9\u2126\u212a-\u212b\u2329-\u232a\u2adc\u302b-\u302c\uaab2-\uaab3\uf900-\ufa0d\ufa10\ufa12\ufa15-\ufa1e\ufa20\ufa22\ufa25-\ufa26\ufa2a-\ufa2d\ufa30-\ufa6d\ufa70-\ufad9\ufb1d\ufb1f\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4e\ufff0-\uffff]/g,
            extra_lookup;

        function unroll_lookup(escapable) {
            var i;
            var unrolled = {};
            var c = [];
            for(i=0; i<65536; i++) {
                c.push( String.fromCharCode(i) );
            }
            escapable.lastIndex = 0;
            c.join('').replace(escapable, function (a) {
                unrolled[ a ] = '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                return '';
            });
            escapable.lastIndex = 0;
            return unrolled;
        }

        return function quote(string) {
            var quoted = JSON.stringify(string);

            // In most cases this should be very fast and good enough.
            extra_escapable.lastIndex = 0;
            if(!extra_escapable.test(quoted)) {
                return quoted;
            }

            if(!extra_lookup) {
                extra_lookup = unroll_lookup(extra_escapable);
            }

            return quoted.replace(extra_escapable, function(a) {
                return extra_lookup[a];
            });
        };
    }()),

    random_string: (function (){
        var random_string_chars = 'abcdefghijklmnopqrstuvwxyz012345';
        return function(length) {
            var max = random_string_chars.length;
            var bytes = require('crypto').randomBytes(length);
            var ret = [];
            for (var i=0; i < length; i++) {
                ret.push( random_string_chars[bytes[i] % max] );
            }
            return ret.join('');
        };
    }()),

    closeFrame: function (code, reason) {
        return 'c'+JSON.stringify([code, reason]);
    },

    userSetCode: function (code) {
        return code === 1000 || (code >= 3000 && code <= 4999);
    },

    detectProtocols: function (probed, protocols_whitelist, info) {
        var pe = {},
            protocols = [];
        if (!protocols_whitelist || !protocols_whitelist.length) {
            protocols_whitelist = _all_protocols;
        }
        for(var i=0; i<protocols_whitelist.length; i++) {
            var protocol = protocols_whitelist[i];
            pe[protocol] = probed[protocol];
        }
        var maybe_push = function(protos) {
            var proto = protos.shift();
            if (pe[proto]) {
                protocols.push(proto);
            } else {
                if (protos.length > 0) {
                    maybe_push(protos);
                }
            }
        };

        // 1. Websocket
        if (info.websocket !== false) {
            maybe_push(['websocket']);
        }

        return protocols;
    },

    probeProtocols: function (url) {
        var SockJS = require('./sockjs');
        var probed = {};
        for(var i=0; i<_all_protocols.length; i++) {
            var protocol = _all_protocols[i];
            // User can have a typo in protocol name.
            probed[protocol] = SockJS[protocol] &&
                               SockJS[protocol].enabled(url);
        }
        return probed;
    },

    countRTO: function (rtt) {
        // In a local environment, when using IE8/9 and the `jsonp-polling`
        // transport the time needed to establish a connection (the time that pass
        // from the opening of the transport to the call of `_dispatchOpen`) is
        // around 200msec (the lower bound used in the article above) and this
        // causes spurious timeouts. For this reason we calculate a value slightly
        // larger than that used in the article.
        if (rtt > 100) {
            return 4 * rtt; // rto > 400msec
        }
        return 300 + rtt;              // 300msec < rto <= 400msec
    },

    delay: function (ms, fn) {
        if ('function' === typeof fn) {
            setTimeout(fn, ms);
        }
        else {
            process.nextTick(ms);
        }
    },

    random_number: function(max) {
        return Math.floor(Math.random() * max);
    },

    random_number_string: function(max) {
        var t = (''+(max - 1)).length;
        var p = new Array(t+1).join('0');
        return (p + helpers.random_number(max)).slice(-t);
    },

    flatUrl: function (url) {
        return url.indexOf('?') === -1 && url.indexOf('#') === -1;
    },

    amendUrl: function (url) {
        if (!url) {
            throw new Error('Wrong url for SockJS');
        }
        if (!helpers.flatUrl(url)) {
            throw new Error('Only basic urls are supported in SockJS');
        }

        // strip trailing slashes
        url = url.replace(/[/]+$/,'');

        return url;
    }
};

module.exports = helpers;
