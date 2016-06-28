'use strict';

var _        = require('lodash');
var sanitize = require('sanitize-html');
var crypto   = require('crypto');

var config   = require('../../config/config');
var coe      = require('../../modules/co-express');

var Comment  = require('./model');

module.exports = {

    /**
     * Creates a new Comment in the DB.
     */
    create: coe(function *(req, res) {
        if (!req.user)
            return res.status(401).send("Not authenticated");

        let comment = yield Comment.create(_.assign(sanitizeComment(req.body), { user: req.user._id }));

        res.location(`/api/comment/${comment._id}`).status(201).json(comment);
    }),


    /**
     * Get a single Comment
     */
    retrieve: coe(function *(req, res) {
        if (!req.params.id)
            return res.status(400).send('ID required');

        let comment = yield Comment.findById(req.params.id, null, { lean: true });

        if (!comment)
            return res.status(404).end();

        res.json(comment);
    }),

    /**
     * Updates an existing Comment in the DB.
     */
    update: coe(function *(req, res) {
        if (!req.params.id)
            return res.status(400).send('ID required');

        let comment = yield Comment.findByIdAndUpdate(req.params.id, { $set: sanitizeComment(req.body) }, { lean: true, new: true });

        res.json(comment);
    }),

    /**
     * Deletes an Comment from the DB.
     */
    delete: coe(function *(req, res) {
        if (!req.params.id)
            return res.status(400).send('ID required');

        yield Comment.findByIdAndRemove(req.params.id);

        res.status(204).end();
    }),

    /**
     * Retrieve Comments in Range; search by title; sort by date created
     */
    retrieveRange: coe(function *(req, res) {
        let query = {};

        if (req.query.content)
            query.content = { $regex: req.query.content, $options: 'i' }; // must contain string in content (case insensitive)


        // get only articles visible for non authors/moderators/admins(by default)

        let range = parseRange(req.headers['range']);

        let comments = yield Comment.find(query, null, { lean: true, skip: range.skip, limit: range.limit, sort: '-created' }); // pus badge in loc de -vote
        let count    = yield Comment.count(query);

        res.set("Accept-Ranges", 'comments');

        if (count && _.isEmpty(comments)) {
            res.set("Content-Range", `comments */${count}`);
            return res.status(416).end();
        }

        res.set("Content-Range", `comments ${range.skip}-${range.skip + range.limit}/${count}`);

        res.status(206).json(comments);
    })

};

function sanitizeComment(comment) {
    return _.pickBy({
        content:     sanitize(comment.content, { allowedTags: sanitize.defaults.allowedTags.concat(['img']) })


        // badge:    sanitize(comment.badge)
    });
}

function parseRange(range) {
    const MAX_PER_PAGE = 100;
    const DEFAULT_PER_PAGE = 10;

    let skip = 0;
    let limit = DEFAULT_PER_PAGE;
    if (range) {
        range = range.split('=')[1].split('-');
        if (range[0])
            skip = range[0] * 1; // make it a number

        let requestedLimit = range[1] - skip;
        if (requestedLimit <= MAX_PER_PAGE && requestedLimit > 0)
            limit = requestedLimit;
    }

    return {
        skip: skip,
        limit: limit
    };
}