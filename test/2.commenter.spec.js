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
var Commenter    = require(config.root + '/api/commenter/model');

require('..'); // Start it up

var uri = '/api/commenter';
var crud = new CRUD({
    uri: uri,
    request: request,
    properties: ['user', 'name', 'description','image', 'badge']
});

describe('Commenter', function () {
    this.timeout(10000);

    before(done => co(function *() {
        yield new Promise(resolve => mongoose.connection.collections['users'].drop(resolve));
        yield new Promise(resolve => mongoose.connection.collections['comments'].drop(resolve));
        yield new Promise(resolve => mongoose.connection.collections['commenters'].drop(resolve));

        yield request({ uri: '' });
        done();
    }));

    // CRUD
    let res;
    describe(`POST ${uri}`, () => {
        it(`should create a commenter`, () => co (function *() {
            res = yield crud.createResource(sample.commenter());
        }));
    });

    describe(`GET ${uri}/:id`, () => {
        it(`should retrieve a commenter`, () => co (function *() {
            yield crud.retrieveResource();
        }));
    });

    describe(`PUT ${uri}/:id`, () => {
        it(`should update a commenter`, () => co (function *() {
            yield crud.updateResource(sample.commenter(res.body.user));
        }));
    });

    describe(`DELETE ${uri}/:id`, () => {
        it(`should delete a commenter`, () => co (function *() {
            yield crud.deleteResource();
        }));
    });

    // Other
    describe(`GET ${uri}/:id (user)`, () => {
        it('should retrieve a commenter by user (id)', () => co (function *() {
            let commenter = (yield request({ uri: uri, body: yield sample.commenter()(crud.inc), method: 'POST'})).body;
            let res = yield request({ uri: `${uri}/${commenter.user}` });

            expect(res.statusCode).to.equal(200, util.errMsg(res, 'body'));
            expect(res.body).to.be.an('object', util.errMsg(res, 'body'));
            expect(res.body).to.eql(commenter, util.errMsg(res, 'body'));
        }));
    });
});