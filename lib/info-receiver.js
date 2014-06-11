/* jshint node: true */
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

util.inherits(InfoReceiver, EventEmitter);

function InfoReceiver(base_url) {
    var that = this;
    process.nextTick(function () { that.doRequest(base_url); });
}

InfoReceiver.prototype.doRequest = function(base_url) {
    var that = this;
    var t0 = Date.now();
    request({
        url: base_url + '/info',
        timeout: 8000, // copying the original SockJS client
    }, function (err, response, text) {
        if (err) {
            that.emit('error', err);
            return;
        }
        if (response.statusCode === 200) {
            var rtt = Date.now() - t0;
            var info;
            if (text) {
                try {
                    info = JSON.parse(text);
                }
                catch (e) {}
            }
            if (typeof info !== 'object') info = {};
            that.emit('finish', info, rtt);
        } else {
            that.emit('finish');
        }
    });
};

module.exports = InfoReceiver;
