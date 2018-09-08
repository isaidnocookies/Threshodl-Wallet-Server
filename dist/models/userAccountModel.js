"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
exports.UserAccountSchema = new Schema({
    recordtype: {
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
    version: {
        type: String,
        required: 'Requires version'
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});
//# sourceMappingURL=userAccountModel.js.map