var sockJS = require('sockjs');
var http = require('http');

var config = require('./config.js');

var server = http.createServer();

// Echo server
var echoServer = sockJS.createServer();
echoServer.on('connection', function(conn) {
    console.log('    [+] echo open    ' + conn);

    conn.on('close', function() {
        console.log('    [-] echo close   ' + conn);
    });

    conn.on('data', function(m) {
        var d  = JSON.stringify(m);
        console.log('    [ ] echo message ' + conn,
                                d.slice(0,64)+
                                ((d.length > 64) ? '...' : ''));
        conn.write(m);
    });

});
echoServer.installHandlers(server, { prefix: '/echo' });

// Amplification server
var ampServer = sockJS.createServer();
ampServer.on('connection', function(conn) {
    console.log('    [+] amp open    ' + conn);
    conn.on('close', function() {
        console.log('    [-] amp close   ' + conn);
    });
    conn.on('data', function(m) {
        var n = Math.floor(Number(m));
        n = (n > 0 && n < 19) ? n : 1;
        console.log('    [ ] amp message: 2^' + n);
        conn.write(new Array(Math.pow(2, n)+1).join('x'));
    });
});
ampServer.installHandlers(server, { prefix: '/amplify'});

// Go away server
var goAwayServer = sockJS.createServer();
goAwayServer.on('connection', function(conn) {
    console.log('        [+] clos open        ' + conn);
    conn.close(3000, "Go away!");
    conn.on('close', function() {
        console.log('        [-] clos close     ' + conn);
    });
});
goAwayServer.installHandlers(server, { prefix: '/close' });

server.listen(config.port, config.host);
