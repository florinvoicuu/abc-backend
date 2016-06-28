// Wrapper for Winston with MongoDB

"use strict";

var winston = require('winston');
var winstonMongoDB = require('winston-mongodb').MongoDB;

module.exports = config => winston.add(winstonMongoDB, {
    db: config.mongodb.uri,
    level: (config.env === 'development' || config.env === 'test') ? 'debug' : 'info'
});