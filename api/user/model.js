'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var crypto   = require('crypto');
var _        = require('lodash');

var Schema   = mongoose.Schema;

/**
 * User Schema
 */

var UserSchema = new Schema({

    name: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
        // Regexp email validation conforming (for the most part) with the RFC2822 guide lines
        match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],
        validate: [validateUniqueEmail, 'E-mail address is already in-use']
    },

    hashed_password: {
        type: String,
        required: true,
        select: false
    },
    salt: { // Salty
        type: String,
        select: false
    },
    color: {
        type: String,
        required: true
    }
}, { timestamps: { createdAt: 'created', updatedAt: 'updated' } });

/**
 * Virtuals
 */
UserSchema.virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.hashPassword(password);
    })
    .get(function() {
        return this._password;
    });

/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {
    if (this.isNew && this.provider === 'local' && this.password && !this.password.length)
        return next(new Error('Invalid password'));
    next();
});

/**
 * Methods
 */
UserSchema.methods = {
    authenticate: function(password) {
        return this.hashPassword(password) === this.hashed_password;
    },
    makeSalt: function() {
        return crypto.randomBytes(16).toString('base64');
    },
    hashPassword: function(password) {
        var salt = new Buffer(this.salt, 'base64');
        // password, salt, 3000, 64
        return crypto.pbkdf2Sync(password, salt, 3000, 64, 'sha512').toString('base64');
    }
};

function validateUniqueEmail (value, callback) {
    var User = mongoose.model('User');
    User.findOne({ $and: [ { email: value }, { _id: { $ne: this._id } } ] }, function(err, user) {
        if (err)
            return callback(false, err);

        callback(!user);
    });
}


module.exports = mongoose.model('User', UserSchema);