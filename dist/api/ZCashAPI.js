"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CryptoAPI_1 = require("./CryptoAPI");
exports.Network = CryptoAPI_1.Network;
class ZCashAPI extends CryptoAPI_1.CryptoAPI {
    constructor() {
        super(...arguments);
        this.zcashcore = require('zcash-bitcore-lib');
    }
    createWallet(chainType, seed) {
        var newPrivateKey;
        var newWif;
        var newAddress;
        var fromSeed;
        var network;
        var success = true;
        if (chainType == CryptoAPI_1.Network.Mainnet) {
            network = this.zcashcore.Networks.livenet;
        }
        else if (chainType == CryptoAPI_1.Network.Testnet) {
            network = this.zcashcore.Networks.testnet;
        }
        else {
            success = false;
        }
        if (seed && success) {
            var theSeedValue = Buffer.from(seed);
            var hash = this.zcashcore.crypto.Hash.sha256(theSeedValue);
            var bn = this.zcashcore.crypto.BN.fromBuffer(hash);
            newPrivateKey = new this.zcashcore.PrivateKey(bn);
            fromSeed = true;
        }
        else if (success) {
            newPrivateKey = new this.zcashcore.PrivateKey.fromRandom(network);
            fromSeed = false;
        }
        if (success) {
            newWif = newPrivateKey.toWIF();
            newAddress = newPrivateKey.toAddress(network).toString();
        }
        if (!newPrivateKey || !newWif || !newAddress) {
            newPrivateKey = "";
            newWif = "";
            newAddress = "";
            fromSeed = false;
        }
        this.zcashcore = null;
        return ({ "address": newAddress, "privateKey": newPrivateKey, "wif": newWif, "fromSeed": fromSeed });
    }
    getBalance(chainType, address) {
        return "";
    }
    getUnspentTransactions(chainType, address, amount) {
        throw new Error("Method not implemented.");
    }
    getTransactionFee(chainType, inputs, outputs) {
        throw new Error("Method not implemented.");
    }
    send(chainType, fromAddresses, fromPrivateKeys, toAddresses, toAmounts) {
        throw new Error("Method not implemented.");
    }
    createTransactionHex(network, fromAddress, fromPrivateKey, toAddresses, toAmounts, message) {
        throw new Error("Method not implemented.");
    }
}
exports.ZCashAPI = ZCashAPI;
//# sourceMappingURL=ZCashAPI.js.map