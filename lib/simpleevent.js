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
    var r = [],
        v,
        k;
    for (k in this) {
        if (!this.hasOwnProperty(k)) {
            continue;
        }
        v = this[k];
        if (typeof v === 'function') {
            v = '[function]';
        }
        r.push(k + '=' + v);
    }
    return 'SimpleEvent(' + r.join(', ') + ')';
};
