'use strict';
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var utils = require('./utils');

var WebSocket = require('ws');

function WebSocketTransport(ri, trans_url) {
    var that = this;
    var url = trans_url + '/websocket';
    if (url.slice(0, 5) === 'https') {
        url = 'wss' + url.slice(5);
    } else {
        url = 'ws' + url.slice(4);
    }
    that.ri = ri;
    that.url = url;

    that.ws = new WebSocket(that.url);
    that.ws.onmessage = function(e) {
        that.ri._didMessage(e.data);
    };
    that.ws.onclose = that.ws.onerror = function() {
        that.ri._didMessage(utils.closeFrame(1006, "WebSocket connection broken"));
    };
}

WebSocketTransport.prototype.doSend = function(data) {
    this.ws.send('[' + data + ']');
};

WebSocketTransport.prototype.doCleanup = function() {
    var that = this;
    var ws = that.ws;
    if (ws) {
        ws.onmessage = ws.onclose = ws.onerror = null;
        ws.close();
        that.ri = that.ws = null;
    }
};

WebSocketTransport.enabled = function() {
    return true;
};

// In theory, ws should require 1 round trip. But in chrome, this is
// not very stable over SSL. Most likely a ws connection requires a
// separate SSL connection, in which case 2 round trips are an
// absolute minumum.
WebSocketTransport.roundTrips = 2;

module.exports = WebSocketTransport;
