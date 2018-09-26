"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
exports.MicroWalletSchema = new Schema({
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
    version: {
        type: String,
        required: 'Requires version'
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});
//# sourceMappingURL=microWalletModel.js.map