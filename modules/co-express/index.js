'use strict';

module.exports = generator => (req, res, next) => require('co').wrap(generator)(req, res, next).catch(next); //err => res.status(500).send(err)
