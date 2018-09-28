import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const MicroWalletSchema = new Schema({
    recordtype: {
        type: String,
        required: 'Requires recordType'
    },
    previousowner: {
        type: String
    },
    owner: {
        type: String,
        required: 'Requires owner'
    },
    uniqueid: {
        type: String,
        required: 'Requires public key'         
    },
    privatekey: {
        type: String,
        required: 'Requires private key'
    },
    secretkey: {
        type: String
    },
    hasbeencompleted: {
        type: Boolean,
        default: false
    },
    version: {
        type: String,
        required: 'Requires version'
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});