const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const tables = require('./index').collectionNames;
const config = require('../util/config');

let letter = /[a-zA-Z]/;
let number = /[0-9]/;

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        // unique: true
    },
    email: {
        type: String,
        required: true,
        // unique: true
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                let valid = true;
                if (config.validation.passwordAlphaNumeric) {
                    valid = number.test(v) && letter.test(v);
                }
                return (v.length >= config.validation.passwordLength) && valid;
            }
        },
    },
    verified: {
        type: Boolean,
        default: config.verification.emailVerification ? false : true
    },
    bio: {
        type: String,
        default: null
    }
});


module.exports = mongoose.model(tables.User, UserSchema, tables.User);

module.exports.comparePassword = function(candidatePassword, hash) {
    return bcrypt.compare(candidatePassword, hash)
}

module.exports.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
}