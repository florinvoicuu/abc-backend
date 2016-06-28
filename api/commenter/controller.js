'use strict';

var _        = require('lodash');
var sanitize = require('sanitize-html');

var coe      = require('../../modules/co-express');

var Commenter   = require('./model');

module.exports = {

    /**
     * Creates a new Commenter in the DB.
     */
    create: coe(function *(req, res) {
        if (!req.user)
            return res.status(401).send("Not authenticated");

        if (yield Commenter.findOne({ user: req.user._id }, null, { lean: true }))
            return res.status(400).send("Already an commenter.");

        let commenter = yield Commenter.create(_.assign(sanitizeCommenter(req.body), { user: req.user._id }));

        res.location(`/api/commenter/${commenter._id}`).status(201).json(commenter);
    }),

    /**
     * Get a single Commenter
     */
    retrieve: coe(function *(req, res) {
        if (!req.params.id)
            return res.status(400).send('ID required');

        let commenter = yield Commenter.findOne({ $or: [{_id: req.params.id }, { user: req.params.id }]}, null, { lean: true });

        if (!commenter)
            return res.status(404).end();

        res.json(commenter);
    }),

    /**
     * Updates an existing Commenter in the DB.
     */
    update: coe(function *(req, res) {
        if (!req.params.id)
            return res.status(400).send('ID required');

        let commenter = yield Commenter.findByIdAndUpdate(req.params.id, { $set: sanitizeCommenter(req.body) }, { lean: true, new: true });

        res.json(commenter);
    }),

    /**
     * Delete an Commenter from the DB.
     */
    delete: coe(function *(req, res) {
        if (!req.params.id)
            return res.status(400).send('ID required');

        yield Commenter.findByIdAndRemove(req.params.id);

        res.status(204).end();
    })

};

function sanitizeCommenter(commenter) {
    commenter = _.pickBy({
        name: sanitize(commenter.name),
        description: sanitize(commenter.description),
        image: sanitize(commenter.image),
        badge: sanitize(commenter.badge)

    });

    return commenter;
}