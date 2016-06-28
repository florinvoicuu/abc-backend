"use strict";

var config  = require('../../config/config');
var util  = require('../util');

var xsrfToken;

function req(options) {
    return send(options);
}

req.request = require('request').defaults({
    baseUrl: `http://localhost:${config.port}`,
    json: true,
    jar: true
});

function send(options) {
    return new Promise((resolve, reject) => {
        if (!options.headers) options.headers = {};
        if (xsrfToken) options.headers["X-XSRF-TOKEN"] = xsrfToken ;

        req.request(options, (err, res) => {
            if (err) reject(err);
            xsrfToken = util.getXSRFToken(res.headers);
            resolve(res);
        });
    });
}

module.exports = req;