'use strict';
/*
 * ***** BEGIN LICENSE BLOCK *****
 * Copyright (c) 2011-2012 VMware, Inc.
 *
 * For the license see COPYING.
 * ***** END LICENSE BLOCK *****
 */

var assign = require('lodash.assign');

module.exports = SimpleEvent;

function SimpleEvent(type, obj) {
    this.type = type;
    assign(this, obj);
}

SimpleEvent.prototype.toString = function () {
    var acc = [],
        val,
        key;

    for (key in this) {
        if (!this.hasOwnProperty(key)) {
            continue;
        }

        val = this[key];
        if (typeof val === 'function') {
            val = '[function]';
        }

        acc.push(key + '=' + val);
    }
    return 'SimpleEvent(' + acc.join(', ') + ')';
};
