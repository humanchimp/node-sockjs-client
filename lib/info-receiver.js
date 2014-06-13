'use strict';
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var request = require('request');

var jsonParse = require('./safe-json-parse.js');

module.exports = InfoReceiver;

util.inherits(InfoReceiver, EventEmitter);

function InfoReceiver(base_url) {
    process.nextTick(function () { this.doRequest(base_url); }.bind(this));
}

InfoReceiver.prototype.doRequest = function(base_url) {
    var t0 = Date.now();
    request({
        url: base_url + '/info',
        timeout: 8000, // copying the original SockJS client
    }, function (err, response, text) {
        if (err || response.statusCode !== 200) {
            this.emit('finish');
        } else {
            this.emit('finish', getInfo(text), Date.now() - t0);
        }
    }.bind(this));
};

function getInfo(text) {
    if (text) {
        return jsonParse(text);
    }
    return null;
}
