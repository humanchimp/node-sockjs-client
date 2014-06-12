'use strict';

var SockJS = require('../../');

var assign = require('lodash.assign');

var client_opts = require('./config.js').client_opts;

module.exports = {

  newSockJS: function(path, protocol) {
    var options, url;
    url = /^http/.test(path) ? path : client_opts.url + path;
    options = assign({}, client_opts.sockjs_opts);
    if (protocol) options.protocols_whitelist = [protocol];
    return new SockJS(url, null, options);
  }

};