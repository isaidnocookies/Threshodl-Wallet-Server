import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const UserAccountSchema = new Schema({
    recordType: {
        type: String,
        required: 'Requires recordType'
    },
    username: {
        type: String,
        required: 'Requires username'
    },
    publickey: {
        type: String,
        required: 'Requires public key'         
    },
    uniqueid: {
        type: String,
        required: 'Requires uniqueid'            
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});