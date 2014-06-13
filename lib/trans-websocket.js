'use strict';
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var WebSocket = require('ws');

var helpers = require('./helpers.js');

module.exports = WebSocketTransport;

function WebSocketTransport(ri, trans_url) {
    var url = trans_url + '/websocket';
    if (url.slice(0, 5) === 'https') {
        url = 'wss' + url.slice(5);
    } else {
        url = 'ws' + url.slice(4);
    }
    this.ri = ri;
    this.url = url;

    this.ws = new WebSocket(this.url);

    this.ws.onmessage = function (e) {
        this.ri._didMessage(e.data);
    }.bind(this);

    this.ws.onclose = this.ws.onerror = function () {
        this.ri._didMessage(helpers.closeFrame(1006, 'WebSocket connection broken'));
    }.bind(this);
}

WebSocketTransport.prototype.doSend = function (data) {
    this.ws.send('[' + data + ']');
};

WebSocketTransport.prototype.doCleanup = function () {
    var ws = this.ws;
    if (ws) {
        ws.onmessage = ws.onclose = ws.onerror = null;
        ws.close();
        this.ri = this.ws = null;
    }
};

WebSocketTransport.enabled = function () {
    return true;
};
