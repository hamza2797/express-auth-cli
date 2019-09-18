const mongoose = require('mongoose');
const tables = require('./index').collectionNames;
const ObjectId = mongoose.Schema.Types.ObjectId;


const SocialSchema = mongoose.Schema({
    source: {
        type: Number,
        enum: ['Facebook', 'Google']
    },
    userId: {
        type: ObjectId,
        ref: tables.User,
        default: undefined,
        autopopulate: true
    },
    accountId: {
        type: String
    }
});


module.exports = mongoose.model(tables.Social, SocialSchema, tables.Social);