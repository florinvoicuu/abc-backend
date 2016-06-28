'use strict';

var co = require('co');

module.exports = request => {
    let sample = {
        user: inc => ({
            email: `user${inc}@domain.com`,
            password: 'password',
            color: 'red'
        }),

        commenter: userId => inc => co(function *() {
            userId = userId || (yield request({ uri: '/api/user', method: 'POST', body: sample.user(inc) })).body._id;

            return {
                user: userId,
                name: `Commenter${inc}`,
                description: `My description ${inc}`,
                image: `http://lorempixel.com/400/400/?no=${inc}`,
                badge: `fa-diamond`
            };
        }),
        comment: userId => inc => co(function *() {
            userId = userId || (yield request({ uri: '/api/user', method: 'POST', body: yield sample.user(inc) })).body._id;

            return {
                user: userId,
                content: `something, something, something daaark ${inc}`

            };
        })
    };

    return sample;
};