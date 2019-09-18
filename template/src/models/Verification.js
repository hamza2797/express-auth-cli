const mongoose = require('mongoose');
const tables = require('./index').collectionNames;
const ObjectId = mongoose.Schema.Types.ObjectId;


const VerificationSchema = mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    verificationType: {
        type: Number,
        enum: ['emailVerification', 'phoneVerification', 'forgotPassword', 'generatePassword']
    },
    userId: {
        type: ObjectId,
        ref: tables.User,
        default: undefined
    }
});

VerificationSchema.index({ verificationType: 1, user: 1 }, { unique: true });

module.exports = mongoose.model(tables.Verification, VerificationSchema, tables.Verification);