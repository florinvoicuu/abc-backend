'use strict';

var expect   = require('chai').expect;
var mongoose = require('mongoose');
var co       = require('co');

var config  = require('../config/config');
var request = require('./request');
var CRUD    = require('./CRUD');
var sample  = require('./sample')(request);
var util    = require('./util');

var User    = require(config.root + '/api/user/model');

require('..'); // Start it up

var uri = '/api/user';
var crud = new CRUD({
    uri: uri,
    request: request,
    properties: ['email']
});

describe('User', () => co( function *() {
    // Clear relevant collections
    before(done => co(function *() {
        yield new Promise(resolve => mongoose.connection.collections['users'].drop(resolve));
        yield request({ uri: '' });

        done();
    }));

    // CRUD
    describe(`POST ${uri}`, () => {
        it(`should create a user`, () => co (function *() {
            yield crud.createResource(sample.user);
        }));
    });

    describe(`GET ${uri}/:id`, () => {
        it(`should retrieve a user`, () => co (function *() {
            yield crud.retrieveResource();
        }));
    });

    describe(`PUT ${uri}/:id`, () => {
        it(`should update a user`, () => co (function *() {
            yield crud.updateResource(sample.user);
        }));
    });


    // delete the previous user from the CRUD object and finish testing CRUD
    describe(`DELETE ${uri}/:id`, () => {
        it(`should delete a user`, () => co (function *() {
            yield crud.deleteResource();
        }));
    });

    // Other
    describe(`GET ${uri}`, () => {
        it('should retrieve the authenticated user', () => co (function *() {
            let user = (yield request({ uri: uri, method: 'POST', body: sample.user() })).body;
            
            let res = yield request({ uri: uri });

            expect(res.statusCode).to.equal(200, util.errMsg(res, 'body'));
            expect(res.body).to.be.an('object', util.errMsg(res, 'body'));
            expect(res.body.email).to.equal(user.email, util.errMsg(res, 'body'));
            expect(res.body._id).to.be.a('string', util.errMsg(res, 'body'));
        }));
    });
}));