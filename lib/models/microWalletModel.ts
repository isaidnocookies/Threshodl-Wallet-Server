import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const MicroWalletSchema = new Schema({
    recordType: {
        type: String,
        required: 'Requires recordType'
    },
    previousOwner: {
        type: String
    },
    owner: {
        type: String,
        required: 'Requires username'
    },
    uniqueId: {
        type: String,
        required: 'Requires public key'         
    },
    privateKey: {
        type: String,
        required: 'Requires private key'
    },
    secretKey: {
        type: String
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});