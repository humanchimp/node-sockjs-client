
var _all_protocols = ['websocket'];

var utils = {

    random_string: (function (){
        var random_string_chars = 'abcdefghijklmnopqrstuvwxyz012345';
        return function(length) {
            var max = random_string_chars.length;
            var bytes = '' + require('crypto').randomBytes(length);
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
        if (!protocols_whitelist || !protocols_whitelist.length) protocols_whitelist = _all_protocols;
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
        if (rtt > 100) return 4 * rtt; // rto > 400msec
        return 300 + rtt;              // 300msec < rto <= 400msec
    },

    delay: function (ms, fn) {
        if ('function' == typeof fn) {
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
        return (p + utils.random_number(max)).slice(-t);
    },

    flatUrl: function (url) {
        return url.indexOf('?') === -1 && url.indexOf('#') === -1;
    },

    amendUrl: function (url) {
        if (!url) {
            throw new Error('Wrong url for SockJS');
        }
        if (!utils.flatUrl(url)) {
            throw new Error('Only basic urls are supported in SockJS');
        }

        // strip trailing slashes
        url = url.replace(/[/]+$/,'');

        return url;
    }
};

module.exports = utils;
