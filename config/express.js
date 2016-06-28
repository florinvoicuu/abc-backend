'use strict';

var bodyParser   = require('body-parser');
var cookieParser = require('cookie-parser');
var useragent    = require('express-useragent');
var ewinston     = require('express-winston');
var cors         = require('cors');

var config       = require('./config');
var winston      = require(config.root + '/modules/winston')(config);

module.exports = function (app, express) {
    app.set('trust proxy', true);
    app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
    app.use(bodyParser.json({limit: '10mb'}));
    app.use(cookieParser());
    app.use(useragent.express());
    app.use(ewinston.errorLogger({ winstonInstance: winston }));
    app.options('/*', cors());
    app.use(cors());
    app.use(express.static(config.root + '/node_modules'));
    app.use(express.static(config.root + '/public'));
};