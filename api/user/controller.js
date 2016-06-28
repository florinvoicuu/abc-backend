'use strict';

var _        = require('lodash');
var mongoose = require('mongoose');
var jwt      = require('jsonwebtoken');
var sanitize = require('sanitize-html');
var request  = require('request');

var config   = require('../../config/config');
var coe      = require('../../modules/co-express');

var User     = require('./model');

module.exports = {

    /**
     * Create a new user
     */
    create: coe(function *(req, res) {
        let user = yield User.create({
            email: sanitize(req.body.email),
            password: req.body.password,
            color: sanitize(req.body.color)
        });

        res.cookie('jwt', jwt.sign({ _id: user._id }, config.session_secret, { expiresIn: 5 * 60 * 60 }));

        res.location(`/api/user/${user._id}`).status(201).json(user);
    }),

    /**
     * Get a user | If no ID in params, try to get the authenticated user | If not authenticated, return an empty object
     */
    retrieve: coe(function *(req, res) {
        let id = req.params.id || (req.user ? req.user._id : null);

        if (!id)
            return res.json({});

        let user = yield User.findById(id, null, { lean: true });

        if (!user)
            return res.status(404).end();

        res.json(user);
    }),

    /**
     * Update user
     */
    update: coe(function *(req, res) {
        if (!req.params.id)
            return res.status(400).send('ID required');

        let user = yield User.findByIdAndUpdate(req.params.id, { $set: {
            email: sanitize(req.body.email)
        } }, { lean: true, new: true });

        res.json(user);
    }),

    /**
     * Delete user
     */
    delete: coe(function *(req, res) {
        if (!req.params.id)
            return res.status(400).send('ID required');

        yield User.findByIdAndRemove(req.params.id);

        res.status(204).end();
    }),

    /**
     * Authenticate and return the user object
     */
    authenticate: coe(function *(req, res) {
        if (!req.body.email)
            return res.status(400).send('Email required');

        let user = yield User.findOne({ email: req.body.email }, '+salt +hashed_password');

        if (!user)
            return res.status(404).send('User with specified email not found');

        if (!user.authenticate(req.body.password))
            return res.status(400).send('Incorrect password');

        res.cookie('jwt', jwt.sign({ _id: user._id }, config.session_secret, { expiresIn: 5 /* hours */ * 60 * 60 }));

        res.json(user);
    })
};