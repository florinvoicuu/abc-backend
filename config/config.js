'use strict';

var path = require('path');

module.exports = {
    env: process.env.NODE_ENV || 'test',
    root: path.normalize(__dirname + '/..'),
    port: process.env.SCOUTSOCIETY_PORT || 3007,
    ip: process.env.IP || null,
    mongodb: {
        uri: process.env.NODE_ENV === 'test' ?
            'mongodb://localhost/abc-test' :
            (process.env.abc_MONGODB || 'mongodb://localhost/abc'),
        options: {
            db: {
                safe: true
            }
        }
    },
    session_secret: process.env.SESSION_SECRET || 'mysecretsession'
};