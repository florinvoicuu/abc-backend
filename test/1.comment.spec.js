'use strict';

var expect   = require('chai').expect;
var mongoose = require('mongoose');
var co       = require('co');
var _        = require('lodash');

var config  = require('../config/config');
var request = require('./request');
var CRUD    = require('./CRUD');
var sample  = require('./sample')(request);
var util    = require('./util');

require('..'); // Start it up

var uri = '/api/comment';
var crud = new CRUD({
    uri: uri,
    request: request,
    properties: ['user','content', 'badge']
});

describe('Comment', function () {
    this.timeout(10000);

    before(done => co(function *() {
        yield new Promise(resolve => mongoose.connection.collections['users'].drop(resolve));
        yield new Promise(resolve => mongoose.connection.collections['comments'].drop(resolve));
        yield request({ uri: '' });

        done();
    }));

    // CRUD
    let res;
    describe(`POST ${uri}`, () => {
        it(`should create a comment`, () => co (function *() {
            res = yield crud.createResource(sample.comment());
        }));
    });

    describe(`GET ${uri}/:id`, () => {
        it(`should retrieve a comment`, () => co (function *() {
            yield crud.retrieveResource();
        }));
    });

    describe(`PUT ${uri}/:id`, () => {
        it(`should update a comment`, () => co (function *() {
            res = yield crud.updateResource(sample.comment(res.body.user));
        }));
    });

    describe(`DELETE ${uri}/:id`, () => {
        it(`should delete a comment`, () => co (function *() {
            yield crud.deleteResource();
        }));
    });


    // Collection
    describe(`GET ${uri}`, () => {
        it(`should retrieve a range of comments`, () => co (function *() {
            yield crud.retrieveRange(inc => co (function *() {
                return (yield request({ uri: uri, method: 'POST', body: yield sample.comment()(inc) })).body
            }), 'comments');
        }));
    });


    // Other

});