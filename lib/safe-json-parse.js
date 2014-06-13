'use strict';

module.exports = parse;

function parse(json, reviver) {
    try {
        return JSON.parse(json, reviver);
    }
    catch (e) {
        return null; // i hope it's ok to trade out some correctness here!  It's worked for PHP all these years :)
    }
}
