"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
exports.MicroWalletSchema = new Schema({
    recordType: {
        type: String,
        required: 'Requires recordType'
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
//# sourceMappingURL=microWalletModel.js.map