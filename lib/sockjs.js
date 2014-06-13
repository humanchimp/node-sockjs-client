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
var REventTarget = require('./reventtarget.js');
var SimpleEvent = require('./simpleevent.js');
var InfoReceiver = require('./info-receiver.js');
var jsonParse = require('./safe-json-parse.js');

module.exports = SockJS;

util.inherits(SockJS, REventTarget);

function SockJS(url, _reserved, options) {
    if (!(this instanceof SockJS)) {
        return new SockJS(url, _reserved, options);
    }

    // options should default to empty
    this._options = options = options || {};
    this._base_url = helpers.amendUrl(url);

    this._server = 'server' in options ? options.server : helpers.random_number_string(1000);
    this._devel = 'devel' in options ? options.devel : false;
    this._debug = 'debug' in options ? options.debug : false;

    // only allow whitelist if it is valid
    if (options.protocols_whitelist && options.protocols_whitelist.length) {
        this._protocols_whitelist = Array.isArray(options.protocols_whitelist) ? options.protocols_whitelist : [options.protocols_whitelist];
    } else {
        this._protocols_whitelist = [];
    }

    this._protocols = [];
    this.protocol = null;
    this.readyState = SockJS.CONNECTING;

    this._ir = createInfoReceiver(this._base_url);
    this._ir.on('finish', function (info, rtt) {
        this._ir = null;
        if (info) {
            if (this._options.info) {
                // Override if user supplies the option
                info = assign(info, this._options.info);
            }
            if (this._options.rtt) {
                rtt = this._options.rtt;
            }
            this._applyInfo(info, rtt, this._protocols_whitelist);
            this._didClose();
        } else {
            this._didClose(1002, 'Can\'t connect to server', true);
        }
    }.bind(this));
}

SockJS.version = require('../package.json').version;

SockJS.prototype.CONNECTING = SockJS.CONNECTING = 0;
SockJS.prototype.OPEN = SockJS.OPEN = 1;
SockJS.prototype.CLOSING = SockJS.CLOSING = 2;
SockJS.prototype.CLOSED = SockJS.CLOSED = 3;

SockJS.prototype._log = function () {
    if (this._debug) {
        helpers.log.apply(helpers, arguments);
    }
};

SockJS.prototype._dispatchOpen = function () {
    if (this.readyState === SockJS.CONNECTING) {
        if (this._transport_tref) {
            clearTimeout(this._transport_tref);
            this._transport_tref = null;
        }
        this.readyState = SockJS.OPEN;
        this.dispatchEvent(new SimpleEvent('open'));
    } else {
        // The server might have been restarted, and lost track of our
        // connection.
        this._didClose(1006, 'Server lost session');
    }
};

SockJS.prototype._dispatchMessage = function (data) {
    if (this.readyState !== SockJS.OPEN) {
        return;
    }
    this.dispatchEvent(new SimpleEvent('message', { data: data }));
};

SockJS.prototype._dispatchHeartbeat = function () {
    if (this.readyState !== SockJS.OPEN){
        return;
    }
    this.dispatchEvent(new SimpleEvent('heartbeat', {}));
};

SockJS.prototype._didClose = function (code, reason, force) {
    if (this.readyState !== SockJS.CONNECTING &&
        this.readyState !== SockJS.OPEN &&
        this.readyState !== SockJS.CLOSING) {
            this.emit('error', Error('INVALID_STATE_ERR'));
            return;
        }

    if (this._transport) {
        this._transport.doCleanup();
        this._transport = null;
    }

    var close_event = new SimpleEvent('close', {
        code: code,
        reason: reason,
        wasClean: helpers.userSetCode(code)});

    if (!helpers.userSetCode(code) &&
        this.readyState === SockJS.CONNECTING && !force) {
        if (this._try_next_protocol(close_event)) {
            return;
        }
        close_event = new SimpleEvent('close', {
            code: 2000,
            reason: 'All transports failed',
            wasClean: false,
            last_event: close_event
        });
    }
    this.readyState = SockJS.CLOSED;

    helpers.delay(function () { this.dispatchEvent(close_event); }.bind(this));
};

SockJS.prototype._didMessage = function (data) {
    var type = data.slice(0, 1),
        payload;
    switch (type) {
    case 'o':
        this._dispatchOpen();
        break;
    case 'a':
        payload = jsonParse(data.slice(1) || '[]');
        for(var i=0; i < payload.length; i++){
            this._dispatchMessage(payload[i]);
        }
        break;
    case 'm':
        payload = jsonParse(data.slice(1) || 'null');
        this._dispatchMessage(payload);
        break;
    case 'c':
        payload = jsonParse(data.slice(1) || '[]');
        this._didClose(payload[0], payload[1]);
        break;
    case 'h':
        this._dispatchHeartbeat();
        break;
    }
};

SockJS.prototype._try_next_protocol = function (close_event) {
    var protocol,
        roundTrips,
        connid,
        trans_url,
        to,
        timeoutFunction;
    if (this.protocol) {
        this._log('Closed transport:', this.protocol, ''+close_event);
        this.protocol = null;
    }
    if (this._transport_tref) {
        clearTimeout(this._transport_tref);
        this._transport_tref = null;
    }

    timeoutFunction = function () {
        if (this.readyState === SockJS.CONNECTING) {
            // I can't understand how it is possible to run
            // this timer, when the state is CLOSED, but
            // apparently in IE everythin is possible.
            this._didClose(2007, 'Transport timed out');
        }
    }.bind(this);

    while (true) {
        protocol = this.protocol = this._protocols.shift();

        if (!protocol) {
            return false;
        }

        if (!SockJS[protocol] || !SockJS[protocol].enabled(this._base_url)) {
            this._log('Skipping transport:', protocol);
        } else {
            roundTrips = SockJS[protocol].roundTrips || 1;
            to = ((this._rto || 0) * roundTrips) || 5000;
            this._transport_tref = helpers.delay(to, timeoutFunction);

            connid = helpers.random_string(8);
            trans_url = this._base_url + '/' + this._server + '/' + connid;
            this._log('Opening transport:', protocol, ' url:'+trans_url,
                        ' RTO:'+this._rto);
            this._transport = new SockJS[protocol](this, trans_url,
                                                   this._base_url);
            return true;
        }
    }
};

SockJS.prototype.close = function (code, reason) {
    if (code && !helpers.userSetCode(code)) {
        this.emit('error', new Error('INVALID_ACCESS_ERR'));
        return;
    }
    if(this.readyState !== SockJS.CONNECTING &&
       this.readyState !== SockJS.OPEN) {
        return false;
    }
    this.readyState = SockJS.CLOSING;
    this._didClose(code || 1000, reason || 'Normal closure');
    return true;
};

SockJS.prototype.send = function (data) {
    if (this.readyState === SockJS.CONNECTING) {
        this.emit('error', new Error('INVALID_STATE_ERR'));
        return;
    }
    if (this.readyState === SockJS.OPEN) {
        this._transport.doSend(helpers.quote('' + data));
    }
    return true;
};

SockJS.prototype._applyInfo = function (info, rtt, protocols_whitelist) {
    var probed;
    this._rtt = rtt;
    this._rto = helpers.countRTO(rtt);

    // Servers can override base_url, eg to provide a randomized domain name and
    // avoid browser per-domain connection limits.
    if (info.base_url) {
      this._base_url = helpers.amendUrl(info.base_url);
    }
    probed = helpers.probeProtocols(this._base_url);
    this._protocols = helpers.detectProtocols(probed, protocols_whitelist, info);
};

SockJS.websocket = require('./trans-websocket');

function createInfoReceiver(base_url) {
    return new InfoReceiver(base_url);
}
