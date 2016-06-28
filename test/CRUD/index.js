"use strict";

var expect  = require('chai').expect;
var co      = require('co');
var _       = require('lodash');

var util    = require('../util');

var request;

class CRUD
{
    constructor (settings) {
        request = settings.request;
        this.uri = settings.uri;
        this.properties = settings.properties;
        this.inc = settings.inc || 0;
    }

    createResource (newResource) {
        let self = this;
        return co(function *() {
            self.resource = yield newResource(++self.inc);

            let res = yield request({ uri: self.uri, method: 'POST', body: self.resource });

            expect(res.statusCode).to.equal(201, util.errMsg(res, 'body'));
            expect(res.body).to.be.an('object', util.errMsg(res, 'body'));
            expect(res.headers.location).to.equal(`${self.uri}/${res.body._id}`, util.errMsg(res, 'body'));
            expect(_.pick(res.body, self.properties)).to.eql(_.pick(self.resource, self.properties), util.errMsg(res, 'body'));
            expect(res.body._id).to.be.a('string', util.errMsg(res, 'body'));
            expect(res.body.created).to.be.a('string', util.errMsg(res, 'body'));
            expect(res.body.updated).to.equal(res.body.created, util.errMsg(res, 'body'));

            self.resource = res.body;

            return res;
        });
    }

    retrieveResource () {
        let self = this;
        return co (function *() {
            let res = yield request({ uri: `${self.uri}/${self.resource._id}` });

            expect(res.statusCode).to.equal(200, util.errMsg(res, 'body'));
            expect(res.body).to.be.an('object', util.errMsg(res, 'body'));
            expect(_.pick(res.body, self.properties)).to.eql(_.pick(self.resource, self.properties), util.errMsg(res, 'body'));
            expect(res.body._id).to.equal(self.resource._id, util.errMsg(res, 'body'));
            expect(res.body.created).to.equal(self.resource.created, util.errMsg(res, 'body'));
            expect(res.body.updated).to.equal(self.resource.updated, util.errMsg(res, 'body'));

            return res;
        });
    }

    updateResource (newResource) {
        let self = this;
        return co (function *() {
            let updatedResource = yield newResource(++self.inc);

            let res = yield request({ uri: `${self.uri}/${self.resource._id}`, method: 'PUT', body: updatedResource });

            expect(res.statusCode).to.equal(200, util.errMsg(res, 'body'));
            expect(res.body).to.be.an('object', util.errMsg(res, 'body'));
            expect(_.pick(res.body, self.properties)).to.eql(_.pick(updatedResource, self.properties), util.errMsg(res, 'body'));
            expect(res.body._id).to.equal(self.resource._id, util.errMsg(res, 'body'));
            expect(res.body.created).to.equal(self.resource.created, util.errMsg(res, 'body'));
            expect(new Date(res.body.updated).getTime()).to.be.greaterThan(new Date(self.resource.updated).getTime(), util.errMsg(res, 'body'));

            return res;
        });
    }

    deleteResource () {
        let self = this;
        return co (function *() {
            let res = yield request({ uri: `${self.uri}/${self.resource._id}`, method: 'DELETE' });

            expect(res.statusCode).to.equal(204, util.errMsg(res, 'body'));

            res = yield request({ uri: `${self.uri}/${self.resource._id}`});

            expect(res.statusCode).to.equal(404, util.errMsg(res, 'body'));
            expect(res.body).to.not.be.an('object', util.errMsg(res, 'body'));

            return res;
        });
    }

    retrieveRange (newResource, type) {
        let self = this;
        return co (function *() {
            let resources = [];

            for (let i = 0; i < 15; i++) {
                resources.push(yield newResource(++self.inc));
            }

            _.reverse(resources);

            let res = yield request({ uri: self.uri, headers: { Range: `${type}=0-9` } });

            expect(res.statusCode).to.equal(206, util.errMsg(res, 'body'));
            expect(res.headers['accept-ranges']).to.equal(type, util.errMsg(res, 'body'));
            expect(res.headers['content-range']).to.equal(`${type} 0-9/15`, util.errMsg(res, 'body'));
            expect(res.body).to.be.an('array', util.errMsg(res, 'body')).with.length(9, util.errMsg(res, 'body'));
            expect(res.body).to.eql(_.slice(resources, 0, 9), util.errMsg(res, 'body'));

            res = yield request({ uri: self.uri, headers: { Range: `${type}=9-15` } });

            expect(res.statusCode).to.equal(206, util.errMsg(res, 'body'));
            expect(res.headers['accept-ranges']).to.equal(type, util.errMsg(res, 'body'));
            expect(res.headers['content-range']).to.equal(`${type} 9-15/15`, util.errMsg(res, 'body'));
            expect(res.body).to.be.an('array', util.errMsg(res, 'body')).with.length(6, util.errMsg(res, 'body'));
            expect(res.body).to.eql(_.slice(resources, 9, 15), util.errMsg(res, 'body'));

            res = yield request({ uri: self.uri, headers: { Range: `${type}=15-1000` } });
            expect(res.statusCode).to.equal(416, util.errMsg(res, 'body'));
            expect(res.headers['accept-ranges']).to.equal(type, util.errMsg(res, 'body'));
            expect(res.headers['content-range']).to.equal(`${type} */15`, util.errMsg(res, 'body'));
            expect(res.body).to.not.be.an('array', util.errMsg(res, 'body'));
        });
    }
}

module.exports = CRUD;