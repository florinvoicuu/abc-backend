'use strict';

var transport  = require('nodemailer').createTransport;
var sanitize   = require('sanitize-html');
var jwt        = require('jsonwebtoken');
var cors         = require('cors');

var config = require('./config');

module.exports = function (app, express) {
    app.all('/*', addUser); // Add authenticated user to req

    app.use('/api/user', require(config.root + '/api/user')(express));
    app.use('/api/comment', require(config.root + '/api/comment')(express));
    app.use('/api/commenter', require(config.root + '/api/commenter')(express));


    //app.use((err, req, res, next) => res.status(500).send(err));

    app.all('/*', (req, res) => res.status(404).send('Route not found'));
};

function addUser(req, res, next) {
    jwt.verify(req.cookies['jwt'], config.session_secret, function(err, user) {
        req.user = user;
        next();
    });
}