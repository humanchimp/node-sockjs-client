/* jshint node: true */
'use strict';
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var util = require('util');

var assign = require('lodash.assign');

var helpers = require('./helpers.js');
var REventTarget = require('./reventtarget');
var SimpleEvent = require('./simpleevent');
var InfoReceiver = require('./info-receiver');

module.exports = SockJS;

util.inherits(SockJS, REventTarget);

function SockJS(url, _reserved, options) {
    if (!(this instanceof SockJS)) {
        // makes `new` optional
        return new SockJS(url, _reserved, options);
    }
    // options should default to empty

    var that = this;
    that._options = options = options || {};
    that._base_url = helpers.amendUrl(url);

    that._server = 'server' in options ? options.server : helpers.random_number_string(1000);
    that._devel = 'devel' in options ? options.devel : false;
    that._debug = 'debug' in options ? options.debug : false;

    // only allow whitelist if it is valid
    if (options.protocols_whitelist && options.protocols_whitelist.length) {
        that._protocols_whitelist = Array.isArray(options.protocols_whitelist) ? options.protocols_whitelist : [options.protocols_whitelist];
    } else {
        that._protocols_whitelist = [];
    }

    that._protocols = [];
    that.protocol = null;
    that.readyState = SockJS.CONNECTING;

    that._ir = createInfoReceiver(that._base_url);
    that._ir.on('finish', function(info, rtt) {
        that._ir = null;
        if (info) {
            if (that._options.info) {
                // Override if user supplies the option
                info = assign(info, that._options.info);
            }
            if (that._options.rtt) {
                rtt = that._options.rtt;
            }
            that._applyInfo(info, rtt, that._protocols_whitelist);
            that._didClose();
        } else {
            that._didClose(1002, 'Can\'t connect to server', true);
        }
    });
}

// Inheritance
SockJS.prototype = new REventTarget();

SockJS.version = '0.0.0';

SockJS.prototype.CONNECTING = SockJS.CONNECTING = 0;
SockJS.prototype.OPEN = SockJS.OPEN = 1;
SockJS.prototype.CLOSING = SockJS.CLOSING = 2;
SockJS.prototype.CLOSED = SockJS.CLOSED = 3;

SockJS.prototype._log = function() {
    if (this._debug)
        helpers.log.apply(helpers, arguments);
};

SockJS.prototype._dispatchOpen = function() {
    var that = this;
    if (that.readyState === SockJS.CONNECTING) {
        if (that._transport_tref) {
            clearTimeout(that._transport_tref);
            that._transport_tref = null;
        }
        that.readyState = SockJS.OPEN;
        that.dispatchEvent(new SimpleEvent("open"));
    } else {
        // The server might have been restarted, and lost track of our
        // connection.
        that._didClose(1006, "Server lost session");
    }
};

SockJS.prototype._dispatchMessage = function(data) {
    var that = this;
    if (that.readyState !== SockJS.OPEN)
            return;
    that.dispatchEvent(new SimpleEvent("message", {data: data}));
};

SockJS.prototype._dispatchHeartbeat = function(data) {
    var that = this;
    if (that.readyState !== SockJS.OPEN)
        return;
    that.dispatchEvent(new SimpleEvent('heartbeat', {}));
};

SockJS.prototype._didClose = function(code, reason, force) {
    var that = this;
    if (that.readyState !== SockJS.CONNECTING &&
        that.readyState !== SockJS.OPEN &&
        that.readyState !== SockJS.CLOSING) {
            that.emit('error', Error('INVALID_STATE_ERR'));
            return;
        }

    if (that._transport) {
        that._transport.doCleanup();
        that._transport = null;
    }

    var close_event = new SimpleEvent("close", {
        code: code,
        reason: reason,
        wasClean: helpers.userSetCode(code)});

    if (!helpers.userSetCode(code) &&
        that.readyState === SockJS.CONNECTING && !force) {
        if (that._try_next_protocol(close_event)) {
            return;
        }
        close_event = new SimpleEvent("close", {code: 2000,
                                                reason: "All transports failed",
                                                wasClean: false,
                                                last_event: close_event});
    }
    that.readyState = SockJS.CLOSED;

    helpers.delay(function () { that.dispatchEvent(close_event); });
};

SockJS.prototype._didMessage = function(data) {
    var that = this;
    var type = data.slice(0, 1);
    var payload;
    switch(type) {
    case 'o':
        that._dispatchOpen();
        break;
    case 'a':
        payload = JSON.parse(data.slice(1) || '[]');
        for(var i=0; i < payload.length; i++){
            that._dispatchMessage(payload[i]);
        }
        break;
    case 'm':
        payload = JSON.parse(data.slice(1) || 'null');
        that._dispatchMessage(payload);
        break;
    case 'c':
        payload = JSON.parse(data.slice(1) || '[]');
        that._didClose(payload[0], payload[1]);
        break;
    case 'h':
        that._dispatchHeartbeat();
        break;
    }
};

SockJS.prototype._try_next_protocol = function(close_event) {
    var that = this;
    if (that.protocol) {
        that._log('Closed transport:', that.protocol, ''+close_event);
        that.protocol = null;
    }
    if (that._transport_tref) {
        clearTimeout(that._transport_tref);
        that._transport_tref = null;
    }

    function timeoutFunction() {
        if (that.readyState === SockJS.CONNECTING) {
            // I can't understand how it is possible to run
            // this timer, when the state is CLOSED, but
            // apparently in IE everythin is possible.
            that._didClose(2007, "Transport timed out");
        }
    }

    function tryNextProtocol() {
        that._try_next_protocol();
    }

    while(1) {
        var protocol = that.protocol = that._protocols.shift();
        if (!protocol) {
            return false;
        }

        if (!SockJS[protocol] ||
              !SockJS[protocol].enabled(that._base_url)) {
            that._log('Skipping transport:', protocol);
        } else {
            var roundTrips = SockJS[protocol].roundTrips || 1;
            var to = ((that._rto || 0) * roundTrips) || 5000;
            that._transport_tref = helpers.delay(to, timeoutFunction);

            var connid = helpers.random_string(8);
            var trans_url = that._base_url + '/' + that._server + '/' + connid;
            that._log('Opening transport:', protocol, ' url:'+trans_url,
                        ' RTO:'+that._rto);
            that._transport = new SockJS[protocol](that, trans_url,
                                                   that._base_url);
            return true;
        }
    }
};

SockJS.prototype.close = function(code, reason) {
    var that = this;
    if (code && !helpers.userSetCode(code)) {
        that.emit('error', new Error("INVALID_ACCESS_ERR"));
        return;
    }
    if(that.readyState !== SockJS.CONNECTING &&
       that.readyState !== SockJS.OPEN) {
        return false;
    }
    that.readyState = SockJS.CLOSING;
    that._didClose(code || 1000, reason || "Normal closure");
    return true;
};

SockJS.prototype.send = function(data) {
    var that = this;
    if (that.readyState === SockJS.CONNECTING) {
        that.emit('error', new Error('INVALID_STATE_ERR'));
        return;
    }
    if (that.readyState === SockJS.OPEN) {
        that._transport.doSend(helpers.quote('' + data));
    }
    return true;
};

SockJS.prototype._applyInfo = function(info, rtt, protocols_whitelist) {
    var that = this;
    that._rtt = rtt;
    that._rto = helpers.countRTO(rtt);

    // Servers can override base_url, eg to provide a randomized domain name and
    // avoid browser per-domain connection limits.
    if (info.base_url)
      that._base_url = helpers.amendUrl(info.base_url);
    var probed = helpers.probeProtocols(that._base_url);
    that._protocols = helpers.detectProtocols(probed, protocols_whitelist, info);
};

SockJS.websocket = require('./trans-websocket');

function createInfoReceiver(base_url) {
    return new InfoReceiver(base_url);
}
