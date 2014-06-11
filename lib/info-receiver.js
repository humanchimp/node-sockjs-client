'use strict';
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var request = require('request');

var utils = require('./utils');
var EventEmitter = require('./eventemitter');

function InfoReceiver(base_url) {
    var that = this;
    utils.delay(function(){that.doRequest(base_url);});
}

InfoReceiver.prototype = new EventEmitter(['finish']);

InfoReceiver.prototype.doRequest = function(base_url) {
    var that = this;
    var t0 = Date.now();
    request({
        url: base_url + '/info',
        timeout: 8000, // copying the original SockJS client
    }, function (err, response, text) {
        if (err) {
            throw err;
        }
        var status = response.statusCode;
        if (status === 200) {
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
