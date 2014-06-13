var sockJS = require('sockjs');
var http = require('http');

var config = require('./config.js');

var server = http.createServer();
var sockjs = sockJS.createServer();

sockjs.installHandlers(server);

console.log(config);

server.listen(config.port, config.host);
